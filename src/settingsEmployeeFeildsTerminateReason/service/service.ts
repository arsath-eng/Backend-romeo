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
export class TerminateReasonService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
  ) {}

  async postTerminateReason(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newTerminateReason = {
        name
      };
      return await this.commonRepository.save({
        type: 'terminateReason',
        data: newTerminateReason,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTerminateReasons( companyId: string) {
    try {
      const terminateReasons = await this.commonRepository.find({where: { companyId: companyId, type: 'terminateReason'}});
      const terminateReasonList = [];
      for (let i = 0; i < terminateReasons.length; i++) {
        const terminateReason = terminateReasons[i].data;
        terminateReason["id"] = terminateReasons[i].id;
        terminateReason["createdAt"] = terminateReasons[i].createdAt;
        terminateReason["modifiedAt"] = terminateReasons[i].modifiedAt;
        terminateReason["companyId"] = terminateReasons[i].companyId;
        terminateReasonList.push(terminateReason);
      }
      return terminateReasonList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putTerminateReasonById(
    id: string,
    req: Request,
      
  ) {
    try {
      const terminateReason =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const allEmployeeDetails = await this.employeeDetailsRepository.find({where: {companyId: terminateReason.companyId,status: Not('Non Active')}});
          allEmployeeDetails.forEach((employee) => {
            for (let j = 0; j < employee.employeeStatus.length; j++) {
              if (employee.employeeStatus[j].terminateReason == terminateReason.data.name) {
                employee.employeeStatus[j].terminateReason = req.body['name'];
                this.employeeDetailsRepository.save(employee);
              }
            }
          });
        }
      }
      if (req.body.hasOwnProperty('name')) {
        terminateReason.data.name = req.body['name'];
      }
      terminateReason.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(terminateReason);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTerminateReasonById(
    id: string,
      
  ) {
    try {
      const terminateReason =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      await this.commonRepository.remove(terminateReason);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
