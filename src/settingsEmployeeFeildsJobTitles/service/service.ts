import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';

@Injectable()
export class JobTitlesService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private NotificationRepository: Repository<HrmNotifications>,
  ) {}

  async postJobTitles(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const eeoCategory = req.body.eeoCategory;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newDivisionData = {
        name,
        eeoCategory,
      };
      return await this.commonRepository.save({
        type: 'jobTitles',
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

  async getJobTitles( companyId: string) {
    try {
      const jobTitles = await this.dataSource.query(`SELECT * FROM hrm_configs WHERE "type" = 'jobTitles' AND "companyId" = '${companyId}'`);
      const allEmployees = await this.dataSource.query(`SELECT * FROM hrm_employee_details WHERE "companyId" = '${companyId}' AND "status" != 'Non Active'`);
      const allJobInformation = allEmployees.flatMap((employee) => employee.jobInformation); 
      const jobTitleList = [];
      if (jobTitles.length != 0) {
        for (let i = 0; i < jobTitles.length; i++) {
          const no = allJobInformation.filter((jobInfo) => jobInfo.jobTitle === jobTitles[i].data.name && jobInfo.active).length;
          jobTitles[i]['count'] = no;
          jobTitleList.push({
            id: jobTitles[i].id,
            name: 'All',
            count: jobTitles[i]['count'],
            ...jobTitles[i].data,
            createdAt: jobTitles[i].createdAt,
            modifiedAt: jobTitles[i].modifiedAt,
            companyId: jobTitles[i].companyId,
          });
        }
      }
       return (jobTitleList);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putJobTitlesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const jobTitle = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const jobInformations = await this.employeeDetailsRepository.find({where: { companyId: jobTitle.companyId,status: Not('Non Active')}});
          for (let i = 0; i < jobInformations.length; i++) {
            jobInformations[i].jobInformation = jobInformations[i].jobInformation.map((jobInfo) => {
              if (jobInfo.jobTitle === jobTitle.data.name) {
                jobInfo.jobTitle = req.body['name'];
              }
              return jobInfo;
            });
            await this.employeeDetailsRepository.save(jobInformations[i]);
          }
          // const notification = await this.NotificationRepository.find({where: { companyId: jobTitle.companyId, type: "jobInformation",mainType: "request"}});
          // for (let i = 0; i < notification.length; i++) {
          //   if (notification[i].data.formData.jobInfo.department === jobTitle.data.name) {
          //     notification[i].data.formData.jobInfo.department = req.body['name'];
          //     await this.NotificationRepository.save(notification[i]);
          //   }
          // }
        }
      }
      if (req.body.hasOwnProperty('name')) {
        jobTitle.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('eeoCategory')) {
        jobTitle.data.eeoCategory = req.body['eeoCategory'];
      }
      jobTitle.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(jobTitle);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteJobTitlesById(
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
