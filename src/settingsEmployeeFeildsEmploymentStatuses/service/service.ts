import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';

@Injectable()
export class EmploymentStatusesService {
  constructor(
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postEmploymentStatuses(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const fte = req.body.fte;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newDivisionData = {
        name,
        fte,
      };
      return await this.commonRepository.save({
        type: 'employmentStatuses',
        data: newDivisionData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmploymentStatuses( companyId: string) {
    try {
      const employmentStatuses = await this.commonRepository.find({where: { companyId: companyId ,type: 'employmentStatuses'}});
      const emolyeementStatusList = []; //this is used for store response obj similar to previous response
      if (employmentStatuses.length != 0) {
        const allEmployees = await this.employeeDetailsRepository.find({
          where: { companyId: companyId,status: Not('Non Active')},
        });
        const allEmploymentStatuses = allEmployees.flatMap((employee) => employee.employeeStatus);
        employmentStatuses.forEach((employmentStatus) => {
          employmentStatus['count'] = allEmploymentStatuses.filter(
            (employeeStatus) => employeeStatus.status === employmentStatus.data.name && employeeStatus.active,
          ).length;
          const obj = {
            id: employmentStatus.id,
            ...employmentStatus.data,
            count: employmentStatus['count'],
            createdAt: employmentStatus.createdAt,
            modifiedAt: employmentStatus.modifiedAt,
            companyId: employmentStatus.companyId,
          }; //create similar obj as previous response
          emolyeementStatusList.push(obj);
        });
      }
       return emolyeementStatusList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putEmploymentStatusesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const employmentStatus =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const allEmployeesDetails = await this.employeeDetailsRepository.find({where: { companyId: employmentStatus.companyId,status: Not('Non Active')}});
          allEmployeesDetails.forEach(employee => {
            for (let i = 0; i < employee.employeeStatus.length; i++) {
              if (employee.employeeStatus[i].status == employmentStatus.data.name) {
                employee.jobInformation[i].location = req.body['name'];
              }
            }
            this.employeeDetailsRepository.save(employee);
          });
        }
      }
      if (req.body.hasOwnProperty('name')) {
        employmentStatus.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('fte')) {
        employmentStatus.data.fte = req.body['name'];
      }
      employmentStatus.data.modifiedAt = new Date(Date.now());
      await this.commonRepository.save(employmentStatus);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEmploymentStatusesById(
    id: string,
      
  ) {
    try {
      const employmentStatus = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(employmentStatus);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
