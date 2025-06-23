
import { TimezoneService } from '../../timezone/timezone.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository , InjectDataSource} from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository, DataSource, Not } from 'typeorm';
import { EmployeeStatusDto } from '../dto/employeeStatus.dto';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

import {v4 as uuidv4} from 'uuid';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
@Injectable()
export class EmployeeStatusService {
  constructor(
    private TimezoneServiceService: TimezoneService,
    private timeTrackingService: TimeTrackingService,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postEmployeeStatus(employeeStatus: EmployeeStatusDto,  companyId: string, req: Request) {
    try {
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: employeeStatus.employeeId, status: Not('Non Active')},});
      const common = await this.commonRepository.find({ where: { companyId: employeeDetails.companyId }, });
      const newDate = new Date();
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const employeeId = employeeStatus.employeeId;
      let active = false;
      const effectiveDate = employeeStatus.effectiveDate;
      const match = await this.TimezoneServiceService.dateMatches(newDate, effectiveDate, employeeId, 'PUT'); 
      if (match) {
        const oldEmployeeStatus = employeeDetails.employeeStatus.find((status) => status.active === true);
        if (oldEmployeeStatus != null) {
          oldEmployeeStatus['active'] = false;
          employeeDetails.employeeStatus = employeeDetails.employeeStatus.filter((status) => status.id !== oldEmployeeStatus.id);
          employeeDetails.employeeStatus.push(oldEmployeeStatus);
        }
        active = true;
        const newEmployeeStatus = {
          id: uuidv4(),
          employeeId,
          effectiveDate,
          status: employeeStatus.status,
          comment: employeeStatus.comment,
          incomeType: employeeStatus.incomeType || 'SALARYANDWAGES',
          active,
          createdAt,
          modifiedAt,
          companyId
        };
        employeeDetails.employeeStatus.push(newEmployeeStatus);
        await this.employeeDetailsRepository.save(employeeDetails);;
      }
      else {
        const status = employeeStatus.status;
        if (status === 'terminated') {
          const employee = await this.employeeDetailsRepository.findOne({where: { employeeId:employeeId },});
          employee.terminationDate = effectiveDate;
          await this.employeeDetailsRepository.save(employee);
        }
        const comment = employeeStatus.comment;
        const newEmployeeStatus = {
          id: uuidv4(),
          employeeId,
          effectiveDate,
          status,
          comment,
          incomeType: employeeStatus.incomeType || 'SALARYANDWAGES',
          active,
          createdAt,
          modifiedAt,
          companyId
        };
        employeeDetails.employeeStatus.push(newEmployeeStatus);
        await this.employeeDetailsRepository.save(employeeDetails);      
      }
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeeStatus( companyId: string) {
    try {
      const res = [];
      let employeeDetails = await this.employeeDetailsRepository.find({where: { companyId: companyId},});
      for (let i = 0; i < employeeDetails.length; i++) {
        res.push(employeeDetails[i].employeeStatus);
      }
       return (res);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeeStatusById(
    employeeId: string  
  ) {
    try {
      let employeeDetails = await this.dataSource.query('SELECT * FROM hrm_employee_details WHERE "employeeId" = $1', [employeeId]);
      let employeeStatuses = []
      if(employeeDetails.length !== 0){
        employeeStatuses = employeeDetails[0].employeeStatus
      }
       return (employeeStatuses);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putEmployeeStatusById(
    id: string,
    body: Body,
    req: Request,
    employeeId: string
  ) {
    try {
      let effectiveDate;
      const newDate = new Date();
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      let oldEmployeeStatus;
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: employeeId},});
      let common = await this.commonRepository.find({where: { companyId: employeeDetails.companyId},});
      const newEmployeeStatus = employeeDetails.employeeStatus.find((status) => status.id === id);
      if (body.hasOwnProperty('effectiveDate')) {
        const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss zzzz');
        effectiveDate = body['effectiveDate'];
        const match = await this.TimezoneServiceService.dateMatches(newDate, effectiveDate, newEmployeeStatus.employeeId, 'PUT');  
        if (match) {
          oldEmployeeStatus = employeeDetails.employeeStatus.find((status) => status.active === true);
          if (oldEmployeeStatus != null) {
            oldEmployeeStatus['active'] = false;
            employeeDetails.employeeStatus = employeeDetails.employeeStatus.filter((status) => status.id !== oldEmployeeStatus.id);
            employeeDetails.employeeStatus.push(oldEmployeeStatus);
            await this.employeeDetailsRepository.save(employeeDetails);
          }
          newEmployeeStatus.active = true;
          await this.employeeDetailsRepository.save(employeeDetails);  
        }
        newEmployeeStatus.effectiveDate = body['effectiveDate'];
      }
      if (body.hasOwnProperty('status')) {
        newEmployeeStatus.status = body['status'];
        if (newEmployeeStatus.status === 'terminated') {
          const employee = await this.employeeDetailsRepository.findOne({where: { employeeId:id, status: Not('Non Active') },});
          employee.status = 'Terminate'
          employee.terminationDate = effectiveDate.toISOString().slice(0,10);
          await this.employeeDetailsRepository.save(employee);
        }
      }
      if (body.hasOwnProperty('comment')) {
        newEmployeeStatus.comment = body['comment'];
      }
      if(body.hasOwnProperty('incomeType')){
        newEmployeeStatus.incomeType = body['incomeType'];
      }
      newEmployeeStatus.modifiedAt = new Date(Date.now());
      const data = {
        new:newEmployeeStatus,
        old:oldEmployeeStatus
      }
      await this.timeTrackingService.activityTrackingFunction(req.headers,newEmployeeStatus.employeeId, 'EDIT', 'EMP_RECORDS', 'EMP-STATUSES', '', '', '', data, newEmployeeStatus.companyId);
      employeeDetails.employeeStatus = employeeDetails.employeeStatus.filter((status) => status.id !== newEmployeeStatus.id);
      employeeDetails.employeeStatus.push(newEmployeeStatus);
      return await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEmployeeStatusById(
    id: string,  
    req: Request,
    employeeId: string
  ) {
    try {
      const date = new Date(Date.now());
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: employeeId},});
      const employeestatus = employeeDetails.employeeStatus.find((status) => status.id === id);
      employeeDetails.employeeStatus = employeeDetails.employeeStatus.filter((status) => status.id !== id);
      await this.timeTrackingService.activityTrackingFunction(req.headers,employeestatus.employeeId, 'DELETE', 'EMP_RECORDS', 'EMP-STATUSES', '', '', '', employeestatus, employeestatus.companyId);
      await this.employeeDetailsRepository.save(employeeDetails);
      if (employeestatus.active === true) {
        employeeDetails.employeeStatus.sort(function (a, b) {
          var dateA = new Date(a.effectiveDate).valueOf();
          var dateB = new Date(b.effectiveDate).valueOf();
          return dateA - dateB
        });
        for (let i = 0; i < employeeDetails.employeeStatus.length; i++) {
          const effectiveDate = new Date(employeeDetails.employeeStatus[i]['effectiveDate']);
          if (effectiveDate <= date) {
            employeeDetails.employeeStatus = employeeDetails.employeeStatus.filter((status) => status.id !== employeeDetails.employeeStatus[i].id);
            employeeDetails.employeeStatus[i].active = true;
            employeeDetails.employeeStatus.push(employeeDetails.employeeStatus[i]);
            await this.employeeDetailsRepository.save(employeeDetails);
            return;
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
