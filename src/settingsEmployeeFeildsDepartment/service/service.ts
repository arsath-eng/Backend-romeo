import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectDataSource() private dataSource:DataSource,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private NotificationRepository: Repository<HrmNotifications>,
  ) {}

  async postDepartment(req: Request,  companyId: string
    ) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newDegreeData = {
        name
      };
      return await this.commonRepository.save({
        type: 'department',
        data: newDegreeData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDepartments( companyId: string) {
    try {
      const departmentList = await this.dataSource.query(
        `
              SELECT d."id", d."data"->>'name' AS name, COUNT(e.job_info) AS count
              FROM hrm_configs AS d
              LEFT JOIN LATERAL (
                SELECT jsonb_array_elements("jobInformation") AS job_info
                FROM hrm_employee_details
                WHERE "companyId" = $1 AND "status" != 'Non Active'
              ) AS e
              ON d."data"->>'name' = e.job_info->>'department' AND e.job_info->>'active' = 'true'
              WHERE d."companyId" = $1
              AND d."type" = 'department'
              GROUP BY d."id"
            `,
        [companyId],
      ); 
      // This sql query does the same thing as the below code 
      // const departments = await this.commonRepository.find({where: { companyId: companyId, type: 'department'}});
      // const departmentList = [];
      // let jobInfos = [];
      // const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: companyId}});
      // const jobInfo = allEmployeeDetails.flatMap((a) => a.jobInformation);
      // for (let i = 0; i < departments.length; i++) {
      //   const filteredJobInfos = jobInfo.filter((jobInfo) => jobInfo.active === true && departments[i].data.name === jobInfo.department);
      //   departments[i]['count'] = filteredJobInfos.length;
      //   const obj = {
      //     id: departments[i].id,
      //     name: departments[i].data.name,
      //     count: departments[i]["count"],
      //   };
      //   departmentList.push(obj);
      // }
        return departmentList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDepartmentById(
    id: string,
    req: Request,
      
  ) {
    try {
      const department = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: department.companyId, status: Not('Non Active')}});
          for (let i = 0; i < allEmployeeDetails.length; i++) {
            const jobInfos = allEmployeeDetails[i].jobInformation;
            for (let j = 0; j < jobInfos.length; j++) {
              if (jobInfos[j].department === department.data.name) {
                jobInfos[j].department = req.body['name'];
              }
            }
            allEmployeeDetails[i].jobInformation = jobInfos;
            await this.employeeDetailsRepository.save(allEmployeeDetails[i]);
          }
          // const notification = await this.NotificationRepository.find({where: { companyId: department.companyId ,type: 'jobInformation',mainType: "request"}});
          // for (let i = 0; i < notification.length; i++) {
          //   if (notification[i].data.formData.jobInfo.department === department.data.name) {
          //     notification[i].data.formData.jobInfo.department = req.body['name'];
          //     await this.NotificationRepository.save(notification[i]);
          //   }
          // }
        }
      }
      if (req.body.hasOwnProperty('name')) {
        department.data.name = req.body['name'];
      }
      department.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(department);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteDepartmentById(
    id: string,
      
  ) {
    try {
      const department = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(department);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
