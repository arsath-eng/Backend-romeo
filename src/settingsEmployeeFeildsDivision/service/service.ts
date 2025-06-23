import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
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
export class DivisionService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private notificationRepository: Repository<HrmNotifications>,
  ) {}

  async postDivision(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newDivisionData = {
        name
      };
      return await this.commonRepository.save({
        type: 'division',
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

  async getDivisions( companyId: string) {
    try {
      const divisions = await this.commonRepository.find({where: { companyId: companyId, type: 'division'}});
      const divisionList = [];
      const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: companyId,status: Not('Non Active')}});
      let jobInfos = allEmployeeDetails.flatMap((employee) => employee.jobInformation);
      for (let i = 0; i < divisions.length; i++) {
        const filteredJobInfos = jobInfos.filter((jobInfo) => jobInfo.active === true && divisions[i].data.name === jobInfo.division);
        divisions[i]['count'] = filteredJobInfos.length;
        const obj = {
          id: divisions[i].id,
          ...divisions[i].data,
          count: divisions[i]["count"],
          createdAt: divisions[i].createdAt,
          modifiedAt: divisions[i].modifiedAt,
          companyId: divisions[i].companyId,
        };
        divisionList.push(obj);
      }
       return divisionList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDivisionById(
    id: string,
    req: Request,
      
  ) {
    try {
      const division = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: division.companyId,status: Not('Non Active')}});
          for (let i = 0; i < allEmployeeDetails.length; i++) {
            const jobInfo = allEmployeeDetails[i].jobInformation;
            for (let j = 0; j < jobInfo.length; j++) {
              if (jobInfo[j].division === division.data.name) {
                jobInfo[j].division = req.body['name'];
                this.employeeDetailsRepository.save(allEmployeeDetails[i]);
              }
            }
          }
          // const notifications = await this.notificationRepository.find({where: { companyId: division.companyId}});
          // for (let i = 0; i < notifications.length; i++) {
          //   if (notifications[i].data.formData.division === division.data.name) {
          //     notifications[i].data.formData.division = req.body['name'];
          //     this.notificationRepository.save(notifications[i]);
          //   }
          // }
        }
      }
      if (req.body.hasOwnProperty('name')) {
        division.data.name = req.body['name'];
      }
      division.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(division);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteDivisionById(
    id: string,
      
  ) {
    try {
      const division = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(division);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
