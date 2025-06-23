
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';
import { PostSpecialUserDto, PutSpecialUserDto, SpecialUserDto } from '@flows/allDtos/specialUser.dto';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { SpecialUser } from '@flows/allEntities/specialUser.entity';
import { S3Service } from '@flows/s3/service/service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { CompanyDto } from '@flows/company/dto/company.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { emailTemplate } from 'emailTemplate.util';

@Injectable()
export class PartnerPortalService {
    private readonly adminAPI;
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @InjectRepository(SpecialUser)
        private specialUserRepository: Repository<SpecialUser>,
        private s3Service: S3Service,
        private eventEmitter: EventEmitter2,
        private readonly APIService: APIService,
        private readonly configService: ConfigService,
    ) {
        this.adminAPI = axios.create({
          baseURL: this.configService.get<string>('SAPDOMAIN'),
        })
    }

    async postPartner(specialUser: PostSpecialUserDto) {
      let user: SpecialUserDto = await this.dataSource.query(
        `SELECT * from special_user WHERE "userId" = $1`,[specialUser.userId]
      ).then(res => res[0]);
      let res: SpecialUser;
      if (user) {
        user.companies.push({companyId: specialUser.companyId, accessLevelId: specialUser.accessLevelId, isActive: true});
      }
      else {
        user = new SpecialUserDto();
        user.email = specialUser.email;
        user.firstName = specialUser.firstName;
        user.lastName = specialUser.lastName;
        user.type = specialUser.type;
        user.userId = specialUser.userId;
        user.companies = [{companyId: specialUser.companyId, accessLevelId: specialUser.accessLevelId, isActive: true}];
      }
      res = await this.dataSource.getRepository(SpecialUser).save(user);
      const company: CompanyDto = await this.APIService.getCompanyById(specialUser.companyId);
      const body = await emailTemplate("roleAdded", specialUser.type, company.companyName, specialUser.firstName +" "+ specialUser.lastName, company.companyEmail);
      const emitBody = { sapCountType: 'Role Added', companyId: specialUser.companyId, subjects: "Role Added", email: specialUser.email, body};
      this.eventEmitter.emit('send.email', emitBody);
      return { code: 201, status: 'created', data: [res]};
      }

    async getPartnersByCompanyId(companyId: string) {
      const specialUsers = await this.dataSource.query(
        `SELECT "id", "userId", "type", "email", "firstName", "lastName", "createdAt", "modifiedAt",
                (SELECT company->>'accessLevelId'
                 FROM jsonb_array_elements(companies) AS company
                 WHERE company->>'companyId' = '${companyId}'
                ) AS "accessLevelId",
                (SELECT company->>'isActive'
                 FROM jsonb_array_elements(companies) AS company
                 WHERE company->>'companyId' = '${companyId}'
                ) AS "isActive"
         FROM special_user
         WHERE companies @> '[{"companyId": "${companyId}"}]';`
      );
        return { code: 200, partners: specialUsers }
    }

    async putPartner(data: PutSpecialUserDto) {
      const specialUser: SpecialUserDto = await this.dataSource.query(
        `SELECT * from special_user WHERE "id" = $1`,[data.id]
      ).then(res => res[0])
      const company = specialUser.companies.find((company) => company.companyId === data.companyId);
      const changed = company.isActive !== data.isActive;
      company.accessLevelId = data.accessLevelId;
      company.isActive = data.isActive;
      specialUser.firstName = data.firstName;
      specialUser.lastName = data.lastName;
      specialUser.companies = specialUser.companies.filter((company) => company.companyId !== data.companyId);
      specialUser.companies.push(company);
      await this.specialUserRepository.save(specialUser);
      if (changed) {
        let templateType = data.isActive ? "roleReactivated" : "roleDeactivated";
        let subject = data.isActive ? "Role Reactivated" : "Role Deactivated";
        const company: CompanyDto = await this.APIService.getCompanyById(data.companyId);
        const body = await emailTemplate(templateType, specialUser.type, company.companyName, specialUser.firstName +" "+ specialUser.lastName, company.companyEmail);
        const emitBody = { sapCountType: subject, companyId: data.companyId, subjects: subject, email: specialUser.email, body};
        this.eventEmitter.emit('send.email', emitBody);
      }
        return { code: 200, status: 'success' };
    }

    async deletePartnerById(id: string, companyId: string) {
      const specialUser: SpecialUserDto = await this.dataSource.query(
        `SELECT * from special_user WHERE "id" = $1`,[id]
      ).then(res => res[0])
      specialUser.companies = specialUser.companies.filter((company) => company.companyId !== companyId);
      await this.specialUserRepository.save(specialUser);
    }

    async switchToSpecialUser(employeeId: string, type: string) {
      const employee: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
        [employeeId],
      ).then(res => res[0]);
      if (!employee) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'Employee not found'};
      }
      const keycloakUser = await this.adminAPI.get(
        `/user?email=${employee.email.work}`).then((res) => res.data);

      if (!employee.access && keycloakUser.status === 'INVALID') {
        return {statusCode: HttpStatus.UNAUTHORIZED, message: 'Employee does not have access'};
      }
      employee.status = 'Non Active';
      await this.dataSource.getRepository(HrmEmployeeDetails).save(employee);
      
      let specialUser = new PostSpecialUserDto();
      specialUser.userId = employee.userId;
      specialUser.type = type;
      specialUser.email = employee.email.work;
      specialUser.firstName = employee.fullName.first;
      specialUser.lastName = employee.fullName.last;
      specialUser.companyId = employee.companyId;
      specialUser.accessLevelId = employee.accessLevelId;
      await this.postPartner(specialUser);
      return {statusCode: HttpStatus.OK, message: `Employee switched to ${type} successfully`};
    }
}
