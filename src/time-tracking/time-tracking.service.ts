import { HrmTimeProjects } from '@flows/allEntities/timeProjects.entity';
import { HrmTimeEntries } from '@flows/allEntities/timeEntries.entity';
import { HrmTimesheetRequests } from '@flows/allEntities/timesheetRequests.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import {v4 as uuidv4} from 'uuid';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as crypto from 'crypto';
//import * as ExcelJS from 'exceljs';
//import * as XlsxPopulate from 'xlsx-populate';
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';
import * as XLSX from 'xlsx';
import * as json2xls from 'json2xls';
import { commonDto } from '@flows/allDtos/common.dto';
import { APIService } from '../superAdminPortalAPI/APIservice.service';
import { CompanyDto } from '@flows/company/dto/company.dto';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { SocketClient } from '@flows/socket/socket-client';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { SpecialUser } from '@flows/allEntities/specialUser.entity';

@Injectable()
export class TimeTrackingService {
    constructor(
      private readonly APIService: APIService,
      private readonly notificationService: NotificationService,
        @InjectRepository(HrmActivityTracking) private activityTrackingRepository: Repository<HrmActivityTracking>,
        @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        @InjectDataSource() private dataSource: DataSource,
    ) {}

    async activityTrackingFunction(headers,employeeId, action, item, subItem, approval, approvalSubItem, access, finalData, companyId) {
      let mode = '';
      let via = '';
      let from = '';
      let to = employeeId;
      if (headers.userid) {
        from = headers.userid;
      }
      else { from = employeeId}
      if (subItem === 'FILE') {
        to = '';
      }
      if (to === from) {mode = 'SELF'} else {mode = 'ANOTHER'}
      if (headers['user-agent']) {
        if (headers['user-agent'].includes('Windows') || headers['user-agent'].includes('Macintosh') || headers['user-agent'].includes('Linux')) {
          via = 'DESKTOP';
        }
        else if (headers['user-agent'].includes('iPhone') || headers['user-agent'].includes('Android')) {
          via = 'MOBILE';
        }
        else {
          via = 'UNKNOWN';
        }
      }
      const data = (finalData);
      const createdAt = new Date();
      const modifiedAt = new Date();
      const activityTracking = this.activityTrackingRepository.create(
        {
          from,
          to,
          mode,
          action,
          item,
          subItem,
          approval,
          approvalSubItem,
          access,
          via,
          data,
          createdAt,
          modifiedAt,
          companyId
        }
      );
        await this.activityTrackingRepository.save(activityTracking);
    }
    async getActivityTracking(  companyId: string) {
      try {
        const activityTracking = await this.activityTrackingRepository.find({where: {companyId:companyId} });
         return (activityTracking);
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }  

    async getProjectsTime(id: string, companyId: string,employeeId:string) {
      try {
        let allEntries: HrmTimeEntries[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_entries WHERE "companyId"=$1',
          [companyId],
        );
        let method = '';
        let projectsTime: HrmTimeProjects[];
        if (id) {
          method = 'single';
          projectsTime = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "id"=$1',
            [id],
          );
        } else if (employeeId) {
          method = "all";
          projectsTime = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "companyId"=$1 AND "projectEmployees" @> $2',
            [companyId, JSON.stringify([{"employeeId": employeeId}])],
          );
        } else {
          method = 'all';
          projectsTime = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
            [companyId],
          );
        }
        const response = this.embedAdditionalInfo(projectsTime, allEntries);
        return {
          code: 0,
          method: method,
          message: "successfully retrieved project",
          projects:response
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postProjectsTime(req: Request) {
        try {
          const newProjectsTime: HrmTimeProjects = req.body;
          for (let i=0;i<newProjectsTime.tasks.length;i++) {
            newProjectsTime.tasks[i]['id'] = uuidv4();
            for (let j=0;j<newProjectsTime.tasks[i].comments.length;j++) {
              newProjectsTime.tasks[i].comments[j]['id'] = uuidv4();
            }
          }
          newProjectsTime.companyId = req.body.companyId;
          const savedProjectsTime = await this.dataSource.getRepository(HrmTimeProjects).save(newProjectsTime);
          return {
            code: 0,
            message: "successfully created project",
            projects:savedProjectsTime
          };
        } catch (error) {
          console.log(error);
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async putProjectsTime(req: Request, id: string) {
        try {
          let data: HrmTimeProjects[] = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "id"=$1',
            [id],
          );
          const projectsTime = data[0];
          let allEntries: HrmTimeEntries[] = await this.dataSource.query(
            'SELECT * FROM hrm_time_entries WHERE "companyId"=$1',
            [projectsTime.companyId],
          );
          const updatedProjectsTime: HrmTimeProjects = req.body;
          if (updatedProjectsTime.hasOwnProperty('name')) {
            projectsTime.name = updatedProjectsTime['name'];
          }
          if (updatedProjectsTime.hasOwnProperty('description')) {
            projectsTime.description = updatedProjectsTime['description'];
          }
          if (updatedProjectsTime.hasOwnProperty('projectLogo')) {
            projectsTime.projectLogo = updatedProjectsTime['projectLogo'];
          }
          if (updatedProjectsTime.hasOwnProperty('projectCode')) {
            projectsTime.projectCode = updatedProjectsTime['projectCode'];
          }
          if (updatedProjectsTime.hasOwnProperty('projectCustomer')) {
            projectsTime.projectCustomer = updatedProjectsTime['projectCustomer'];
          }
          if (updatedProjectsTime.hasOwnProperty('billingType')) {
            projectsTime.billingType = updatedProjectsTime['billingType'];
          }
          if (updatedProjectsTime.hasOwnProperty('projectCost')) {
            projectsTime.projectCost = updatedProjectsTime['projectCost'];
          }
          if (updatedProjectsTime.hasOwnProperty('projectEmployees')) {
            projectsTime.projectEmployees = updatedProjectsTime['projectEmployees'];
          }
          if (updatedProjectsTime.hasOwnProperty('tasks')) {
            for (let i=0;i<updatedProjectsTime['tasks'].length;i++) {
              if (!updatedProjectsTime['tasks'][i].hasOwnProperty('id')) {
                updatedProjectsTime['tasks'][i]['id'] = uuidv4();
              }
            }
          }
          if (updatedProjectsTime.hasOwnProperty('projectColor')) {
            projectsTime.projectColor = updatedProjectsTime['projectColor'];
          }
          const savedProjectsTime = await this.dataSource.getRepository(HrmTimeProjects).save(projectsTime);
          const response = this.embedAdditionalInfo([savedProjectsTime], allEntries);
          return {
            code: 0,
            message: "successfully updated project",
            projects:response[0]
          };
        } catch (error) {
          console.log(error);
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async deleteProjectsTime(id: string) {
      try {
        const projectsTimeEntries: HrmTimeEntries[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_entries WHERE "projectId"=$1',
          [id],
        );
        if (projectsTimeEntries.length === 0) {
          await this.dataSource.getRepository(HrmTimeProjects).createQueryBuilder().delete().where({ id: id }).execute();
        }
        return {
          code: (projectsTimeEntries.length !== 0) ? 400 : 200,
          message: (projectsTimeEntries.length !== 0) ? "The project has timesheet entries. so it cannot be deleted" : "successfully deleted project",
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async getProjectsTimeEntries(id: string, companyId: string, filterBy: string, dateFrom: string, dateTo: string, type: string, req: Request, employeeId: string) {
      try {
        let start;
        let end;
        let method = '';
        let projectsTimeEntries: HrmTimeEntries[] = [];
        let employee: employeeDetails = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status" != $2',
          [req.headers['userid'] as string,'Non Active'],
        ).then(res => res[0]);
        const company = await this.APIService.getCompanyById(companyId);
        const employeeTimezone = (new Date()).toLocaleString("en-US", { timeZone: employee ? employee.timezone : company.timezone });
        const date = new Date(employeeTimezone);
        if (id) {
          let idType = 'id';
          if (type && type === 'project') { idType = 'projectId' }
          else if (type && type === 'task') { idType = 'taskId' }
          method = 'single';
          if (employeeId) {
            projectsTimeEntries = await this.dataSource.query(
              `SELECT * FROM hrm_time_entries WHERE "${idType}"=$1 AND "type"=$2 AND "employeeId"=$3 ORDER BY "createdAt" DESC`,
              [id, 'log', employeeId],
            );
          }
          else {
            projectsTimeEntries = await this.dataSource.query(
              `SELECT * FROM hrm_time_entries WHERE "${idType}"=$1 AND "type"=$2 ORDER BY "createdAt" DESC`,
              [id, 'log'],
            );
          }
        }
        else {
          let data: HrmTimeEntries[] = [];
          if (type && type === 'project') {
            if (employeeId) {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 AND "projectId"=$3 AND "employeeId"=$4 ORDER BY "createdAt" DESC',
                [companyId, 'log', id, employeeId],
              );
            }
            else {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 AND "projectId"=$3 ORDER BY "createdAt" DESC',
                [companyId, 'log', id],
              );
            }
          }
          else if (type && type === 'task') {
            if (employeeId) {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 AND "taskId"=$3 AND "employeeId"=$4 ORDER BY "createdAt" DESC',
                [companyId, 'log', id, employeeId],
              );
            }
            else {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 AND "taskId"=$3 ORDER BY "createdAt" DESC',
                [companyId, 'log', id],
              );
            }
          }
          else {
            if (employeeId) {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 AND "employeeId"=$3 ORDER BY "createdAt" DESC',
                [companyId, 'log', employeeId],
              );
            }
            else {
              data = await this.dataSource.query(
                'SELECT * FROM hrm_time_entries WHERE "companyId"=$1 AND "type"=$2 ORDER BY "createdAt" DESC',
                [companyId, 'log'],
              );
            }
          }
          method = 'all';
          if (filterBy) {
            const dateList = [];
            if (filterBy === "previousMonth") {
              start = new Date(date.getFullYear(), date.getMonth()-1, 1);
              end = new Date(date.getFullYear(), date.getMonth()-1 + 1, 0);
            }
            else if (filterBy === "thisMonth") {
              start = new Date(date.getFullYear(), date.getMonth(), 1);
              end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            }
            else if (filterBy === "previousWeek") {
              date.setDate(date.getDate()-7)
              start = startOfWeek(date);
              end = endOfWeek(date);
            }
            else if (filterBy === "thisWeek") {
              start = startOfWeek(date);
              end = endOfWeek(date);
            }
            else if (filterBy === "customDate") {
              start = new Date(dateFrom);
              end = new Date(dateTo);
            }
            dateList.push(format(new Date(start), 'yyyy-MM-dd'));
            while (format(new Date(start), 'yyyy-MM-dd') !== format(new Date(end), 'yyyy-MM-dd')) {
                start.setDate(start.getDate()+1);
                dateList.push(format(new Date(start), 'yyyy-MM-dd'));
            }
            for (let i=0;i<data.length;i++) {
              if (dateList.includes(format(new Date(data[i].createdAt), 'yyyy-MM-dd'))) {
                projectsTimeEntries.push(data[i]);
              }
            }
          }
          else {
            projectsTimeEntries = data;
          }
        }
        const projectsTime: HrmTimeProjects[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
          [companyId],
        );
        for (let i=0;i<projectsTimeEntries.length;i++) {
          for (let j=0;j<projectsTime.length;j++) {
            if (projectsTimeEntries[i].projectId === projectsTime[j].id) {
              projectsTimeEntries[i]['projectName'] = projectsTime[j].name;
              for (let k=0;k<projectsTime[j].tasks.length;k++) {
                if (projectsTimeEntries[i].taskId === projectsTime[j].tasks[k].id) {
                  projectsTimeEntries[i]['taskName'] = projectsTime[j].tasks[k].taskName;
                }
              }
            }
          }
        }
        let notifications;
        if (employeeId) {
          notifications = await this.dataSource.query(
            `SELECT * FROM hrm_timesheet_requests WHERE "employeeId" = $1 ORDER BY "createdAt" DESC`,
            [//"timesheetRequest", 'pending', 
              employeeId],
          );
        }
        else {
          notifications = await this.dataSource.query(
            `SELECT * FROM hrm_timesheet_requests ORDER BY "createdAt" DESC`
            //["timesheetRequest", 'pending'],
          );
        }
        const pendingProjectsTimeEntries = notifications;
        return {
          code: 0,
          method: method,
          message: "successfully retrieved entries",
          entries:projectsTimeEntries,
          pendingApprovals: pendingProjectsTimeEntries
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postProjectsTimeEntries(req: Request) {
        try {
          let timezone;
          let errorRes: HrmTimeEntries;
          let employee: employeeDetails = await this.dataSource.query(
            'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status" != $2',
            [req.headers['userid'] as string,'Non Active'],
          ).then(res => res[0]);
          const specialUser: SpecialUser = await this.dataSource.query(
            `SELECT * from special_user WHERE "id" = $1`,[req.headers['userid'] as string]
          ).then(res => res[0]);

          if (employee) { timezone = employee.timezone; }
          else if (specialUser) {
            const company: CompanyDto = await this.APIService.getCompanyById(specialUser.companies[0].companyId);
            timezone = company.timezone;
          }
          else {
            return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found. Please contact RomeoHR', entries: errorRes};
          }

          const employeeTimezone = (new Date()).toLocaleString("en-US", { timeZone: timezone });
          const newProjectsTimeEntries: HrmTimeEntries = req.body.data;
          if (req.body.method === 'save') {
            newProjectsTimeEntries.start = false;
            newProjectsTimeEntries.inProgress = false;
          }
          else if (req.body.method === 'start') {
            newProjectsTimeEntries.start = true;
            newProjectsTimeEntries.inProgress = true;
            newProjectsTimeEntries.startTime = format(new Date(employeeTimezone), 'HH:mm:ss');
          }
          newProjectsTimeEntries.companyId = req.body.data.companyId;
          if (req.body.method === 'start' && newProjectsTimeEntries.hasPeriod) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "failed to create entry",
              entries: errorRes
            };
          }
          else {
            const savedProjectsTimeEntries = await this.dataSource.getRepository(HrmTimeEntries).save(newProjectsTimeEntries);
            return {
              statusCode: HttpStatus.OK,
              message: "successfully created entry",
              entries:savedProjectsTimeEntries
            };
          }
        } catch (error) {
          console.log(error);
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async putProjectsTimeEntries(req: Request, id: string) {
      try {
        let employee: employeeDetails[] = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status" != $2',
          [req.headers['userid'] as string,'Non Active'],
        );
        const employeeTimezone = (new Date()).toLocaleString("en-US", { timeZone: employee[0].timezone });
        let errorRes: HrmTimeEntries;
        let hasPeriod = false;
        if (req.body.notificationId) {
          let timeEntries: HrmTimeEntries = req.body.data;
          let requests = await this.dataSource.query(
            'SELECT * FROM hrm_timesheet_requests WHERE "id"=$1',
            [req.body.notificationId],
          );
          requests[0].timeEntries = requests[0].timeEntries.filter((e) => e.id !== id);
          requests[0].timeEntries.push(timeEntries);
          const savedProjectsTimeEntries = await this.dataSource.getRepository(HrmTimeEntries).save(timeEntries);
          const savedTimesheetRequest:HrmTimesheetRequests = await this.dataSource.getRepository(HrmTimesheetRequests).save(requests[0]);
          await this.notificationService.addNotifications('timesheetRequest', `${employee[0].fullName.first + ' ' + employee[0].fullName.last}'s Timesheet from ${format(new Date(savedTimesheetRequest.startDate), 'do MMM, y')} to ${format(new Date(savedTimesheetRequest.endDate), 'do MMM, y')} is ${savedTimesheetRequest.status}.`, savedTimesheetRequest['id'], req.body.companyId, req.headers['userid'] as string);

          return {
            statusCode: HttpStatus.OK,
            message: "successfully updated entries and notifications",
            entries:savedProjectsTimeEntries
          };
        }
        else {
          let data: HrmTimeEntries[] = await this.dataSource.query(
            'SELECT * FROM hrm_time_entries WHERE "id"=$1',
            [id],
          );
          const projectsTimeEntries = data[0];
          const updatedProjectsTimeEntries: HrmTimeProjects = req.body.data;
          if (updatedProjectsTimeEntries.hasOwnProperty('duration')) {
            projectsTimeEntries.duration = updatedProjectsTimeEntries['duration'];
          }
          if (req.body.method === 'start') {
            projectsTimeEntries.start = true;
            projectsTimeEntries.inProgress = true;
            projectsTimeEntries.startTime = format(new Date(employeeTimezone), 'HH:mm:ss');
          }
          else if (req.body.method === 'stop' && !projectsTimeEntries.inProgress) {
            projectsTimeEntries.start = false;
          }
          else if (req.body.method === 'pause') {
            projectsTimeEntries.inProgress = false;
            projectsTimeEntries.duration = this.addTime(projectsTimeEntries.duration, projectsTimeEntries.startTime, employeeTimezone); 
          }  
          else if (req.body.method === 'stop') {
            projectsTimeEntries.start = false;
            projectsTimeEntries.inProgress = false;
            projectsTimeEntries.duration = this.addTime(projectsTimeEntries.duration, projectsTimeEntries.startTime, employeeTimezone); 
          }  
          else if (req.body.method === 'resume') {
            projectsTimeEntries.inProgress = true;
            projectsTimeEntries.startTime = format(new Date(employeeTimezone), 'HH:mm:ss');
          }
          if (req.body.hasOwnProperty('data')) {
            if (updatedProjectsTimeEntries.hasOwnProperty('date')) {
              projectsTimeEntries.date = updatedProjectsTimeEntries['date'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('type')) {
              projectsTimeEntries.type = updatedProjectsTimeEntries['type'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('hasPeriod')) {
              hasPeriod = projectsTimeEntries.hasPeriod;
              projectsTimeEntries.hasPeriod = updatedProjectsTimeEntries['hasPeriod'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('beginTime')) {
              projectsTimeEntries.beginTime = updatedProjectsTimeEntries['beginTime'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('endTime')) {
              projectsTimeEntries.endTime = updatedProjectsTimeEntries['endTime'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('billable')) {
              projectsTimeEntries.billable = updatedProjectsTimeEntries['billable'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('billedStatus')) {
              projectsTimeEntries.billedStatus = updatedProjectsTimeEntries['billedStatus'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('projectId')) {
              projectsTimeEntries.projectId = updatedProjectsTimeEntries['projectId'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('taskId')) {
              projectsTimeEntries.taskId = updatedProjectsTimeEntries['taskId'];
            }
            if (updatedProjectsTimeEntries.hasOwnProperty('note')) {
              projectsTimeEntries.note = updatedProjectsTimeEntries['note'];
            }
          }
          if (hasPeriod && req.body.method === 'start') {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "failed to update entry",
              entries: errorRes
            };
          }
          else {
            const projectsTime: HrmTimeProjects[] = await this.dataSource.query(
              'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
              [projectsTimeEntries.companyId],
            );
            const savedProjectsTimeEntries = await this.dataSource.getRepository(HrmTimeEntries).save(projectsTimeEntries);
              for (let j=0;j<projectsTime.length;j++) {
                if (savedProjectsTimeEntries.projectId === projectsTime[j].id) {
                  savedProjectsTimeEntries['projectName'] = projectsTime[j].name;
                  for (let k=0;k<projectsTime[j].tasks.length;k++) {
                    if (savedProjectsTimeEntries.taskId === projectsTime[j].tasks[k].id) {
                      savedProjectsTimeEntries['taskName'] = projectsTime[j].tasks[k].taskName;
                    }
                  }
                }
              }
            return {
              statusCode: HttpStatus.OK,
              message: "successfully updated entry",
              entries:savedProjectsTimeEntries
            };
          }
        }
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteProjectsTimeEntries(id: string, requestId: string) {
      try {
        await this.dataSource.getRepository(HrmTimeEntries).createQueryBuilder().delete().where({ id: id }).execute();
        if (requestId) {
          let requests = await this.dataSource.query(
            'SELECT * FROM hrm_timesheet_requests WHERE "id"=$1',
            [requestId],
          );
          requests[0].timeEntries = requests[0].timeEntries.filter((e) => e.id !== id);
          const savedNotification = await this.dataSource.getRepository(HrmTimesheetRequests).save(requests[0]);
        }
        return {
          code: 0,
          message: "successfully deleted entry",
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async getProjectsTimeEntryMe(companyId: string, employeeId: string) {
      try {
        let ongoing = false;
        let projectsTimeEntries: HrmTimeEntries[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_entries WHERE "start"=$1 AND "employeeId"=$2',
          [true, employeeId],
        );
        const projectsTime: HrmTimeProjects[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
          [companyId],
        );
        if (projectsTimeEntries.length !== 0) {
          for (let j=0;j<projectsTime.length;j++) {
            if (projectsTimeEntries[0].projectId === projectsTime[j].id) {
              projectsTimeEntries[0]['projectName'] = projectsTime[j].name;
              for (let k=0;k<projectsTime[j].tasks.length;k++) {
                if (projectsTimeEntries[0].taskId === projectsTime[j].tasks[k].id) {
                  projectsTimeEntries[0]['taskName'] = projectsTime[j].tasks[k].taskName;
                }
              }
            }
          }
          ongoing = true;
        }
        return {
          code: 0,
          method: ongoing ? "ongoing" : "Not Found",
          message: "successfully retrieved entries",
          entries:projectsTimeEntries
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async getTimesheetTemplates(id: string, companyId: string, type: string) {
      try {
        const response = [];
        let common: HrmConfigs[] = await this.dataSource.query(
          'SELECT * FROM hrm_configs WHERE "type"=$1 AND "companyId"=$2', ['timesheetTemplates', companyId]
        );
        for (let i=0;i<common.length;i++) {
          common[i].data['id'] = common[i].id;
          common[i].data['createdAt'] = common[i].createdAt;
          common[i].data['modifiedAt'] = common[i].modifiedAt;
          if (id && common[i].id === id) {
            response.push(common[i].data);
            break;
          }
          else if (type && common[i].data.type === type) {
            response.push(common[i].data);
          }
          else if (!type && !id) {
            response.push(common[i].data);
          }
        }
        return {
          code: 0,
          message: "successfully retrieved templates",
          templates: response
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postTimesheetTemplates(req: Request) {
      try {
        let newTimesheetTemplate = {};
        newTimesheetTemplate['data'] = req.body;
        newTimesheetTemplate['companyId'] = req.body.companyId;
        newTimesheetTemplate['type'] = 'timesheetTemplates';
        newTimesheetTemplate['createdAt'] = new Date();
        newTimesheetTemplate['modifiedAt'] = new Date();
        const savedTimesheetTemplate = await this.dataSource.getRepository(HrmConfigs).save(newTimesheetTemplate);
        return {
          code: 0,
          message: "successfully created timesheet template",
          template:savedTimesheetTemplate
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async putTimesheetTemplates(req: Request, id: string) {
      try {
        let common: HrmConfigs[] = await this.dataSource.query(
          'SELECT * FROM hrm_configs WHERE "id"=$1',
          [id],
        );
        common[0].data = req.body;
        common[0].modifiedAt = new Date();
        const savedTimesheetTemplate = await this.dataSource.getRepository(HrmConfigs).save(common[0]);
        return {
          code: 0,
          message: "successfully updated timesheet template",
          template:savedTimesheetTemplate
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteTimesheetTemplates(id: string) {
      try {
        await this.dataSource.getRepository(HrmConfigs).createQueryBuilder().delete().where({ id: id }).execute();
        return {
          code: 0,
          message: "successfully deleted template",
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async exportTemplate(req: Request, res: Response) {
      try {
        const rc = [];
        let company;
        let projectsTime;
        let employees;
        let common: HrmConfigs[] = await this.dataSource.query(
          'SELECT * FROM hrm_configs WHERE "id"=$1',
          [req.body.templateId],
        );
        let data = [];
        if (common[0].data.type === 'projects') { 
          company = await this.APIService.getCompanyById(req.body.companyId);
          data = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
            [req.body.companyId],
          );
        }
        else if (common[0].data.type === 'project_tasks') {
          projectsTime = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
            [req.body.companyId],
          );
          for (let i=0;i<projectsTime.length;i++) {
            data = data.concat(projectsTime[i].tasks);
          }
          
        }
        else if (common[0].data.type === 'timesheet') {
          employees = await this.dataSource.query(
            'SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status" != $2',
            [req.body.companyId,'Non Active'],
          );
          projectsTime = await this.dataSource.query(
            'SELECT * FROM hrm_time_projects WHERE "companyId"=$1',
            [req.body.companyId],
          );
          data = await this.dataSource.query(
            'SELECT * FROM hrm_time_entries WHERE "companyId"=$1',
            [req.body.companyId],
          );
        }
        
        for (let i=0;i<data.length;i++) {
          let obj = {};
          for (let j=0;j<common[0].data.template.length;j++) {
            if (common[0].data.type === 'projects' && common[0].data.template[j].fieldNameDb === 'currency') {
              obj[common[0].data.template[j].fieldNameExport] = company.currency;
            }
            else if (common[0].data.type === 'timesheet' && common[0].data.template[j].fieldNameDb === 'projectName') {
            
              const project = projectsTime.find((p) => p.id === data[i].projectId);
              obj[common[0].data.template[j].fieldNameExport] = project.name;
            }
            else if (common[0].data.type === 'project_tasks' && common[0].data.template[j].fieldNameDb === 'projectStatus') {
              const project = projectsTime.find((p) => p.id === data[i].projectId);
              if (project.active) {
                obj[common[0].data.template[j].fieldNameExport] = "True";
              }
              else {
                obj[common[0].data.template[j].fieldNameExport] = "False";
              }
            }
            else if (common[0].data.type === 'timesheet' && common[0].data.template[j].fieldNameDb === 'employeeEmail') {
              const employee = employees.find((e) => e.employeeId === data[i].employeeId);
              obj[common[0].data.template[j].fieldNameExport] = employee.username;
            }
            else if (common[0].data.type === 'timesheet' && common[0].data.template[j].fieldNameDb === 'date') {
              obj[common[0].data.template[j].fieldNameExport] = data[i].date;
            }
            else if (common[0].data.type === 'timesheet' && common[0].data.template[j].fieldNameDb === 'employeeName') {
              const employee = employees.find((e) => e.employeeId === data[i].employeeId);
              obj[common[0].data.template[j].fieldNameExport] = employee.fullName.first + " " + employee.fullName.last;
            }
            else if (common[0].data.type === 'timesheet' && common[0].data.template[j].fieldNameDb === 'billable') {
              if (data[i][common[0].data.template[j].fieldNameDb]) {
                obj[common[0].data.template[j].fieldNameExport] = "True";
              }
              else {
                obj[common[0].data.template[j].fieldNameExport] = "False";
              }
            }
            else {
              obj[common[0].data.template[j].fieldNameExport] = data[i][common[0].data.template[j].fieldNameDb];
            }
          }
          rc.push(obj);
          
        }
        if (req.body.isProtected) {
          if (req.body.exportAs === 'CSV') {
            const csvHeader = [];
            for (let i=0;i<common[0].data.template.length;i++) {
              let obj = {};
              obj['id'] = common[0].data.template[i].fieldNameExport;
              obj['title'] = common[0].data.template[i].fieldNameExport;
              csvHeader.push(obj);
            }
            const data = rc;
        
            const csvWriter = createObjectCsvWriter({
              path: 'data.csv',
              header: csvHeader
            });
        
            await csvWriter.writeRecords(data);
        
            // Generate a random password
            const password = req.body.password;
            
            // Encrypt the CSV file
            const encryptedFileName = 'data_encrypted.csv';
            const input = fs.createReadStream('data.csv');
            const output = fs.createWriteStream(encryptedFileName);
            const iv = crypto.randomBytes(16); // Generate an initialization vector
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(password, 'hex'), iv);
            input.pipe(cipher).pipe(output);
            
            // Create a zip file
            const zipFileName = 'data.zip';
            const zipOutput = fs.createWriteStream(zipFileName);
            const zipArchive = archiver('zip', {
              zlib: { level: 9 } // Sets the compression level.
            });
            zipArchive.pipe(zipOutput);
            zipArchive.append(fs.createReadStream(encryptedFileName), { name: 'data_encrypted.csv' });
            zipArchive.finalize();
        
            // Set headers and send the zip file as a response
            res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
            res.setHeader('Content-Type', 'application/zip');
            res.download(zipFileName, () => {
              // Cleanup: remove the temporary files
              fs.unlinkSync('data.csv');
              fs.unlinkSync(encryptedFileName);
              fs.unlinkSync(zipFileName);
            });
          }
        }
        else {
          const data = rc;
          if (req.body.exportAs === 'CSV') {
            const csvHeader = [];
            for (let i=0;i<common[0].data.template.length;i++) {
              let obj = {};
              obj['id'] = common[0].data.template[i].fieldNameExport;
              obj['title'] = common[0].data.template[i].fieldNameExport;
              csvHeader.push(obj);
            }
            const csvWriter = createObjectCsvWriter({
              path: 'data.csv',
              header: csvHeader
            });  
            await csvWriter.writeRecords(data);
            res.on('finish', () => {
              fs.unlinkSync('data.csv');
            });
            res.download('data.csv');
          }
          if (req.body.exportAs === 'XLS') {
            const xls = json2xls(data);
            res.setHeader('Content-Disposition', 'attachment; filename=data.xls');
            res.setHeader('Content-Type', 'application/vnd.ms-excel');
            res.send(xls);
          }
          if (req.body.exportAs === 'XLSX') {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buf);
          }
        }
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async putProjectCommon(req: Request) {
      try {
        let msg = '';
        let code = 200;
        let data: HrmTimeProjects[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_projects WHERE "id"=$1',
          [req.body.projectId],
        );
        const project = data[0];
        let allEntries: HrmTimeEntries[] = await this.dataSource.query(
          'SELECT * FROM hrm_time_entries WHERE "companyId"=$1',
          [project.companyId],
        );
        if (req.body.type === 'task') {
          if (req.body.method === 'add') {
            const task = req.body.data;
            task['id'] = uuidv4();
            project.tasks.push(task);
            msg = 'successfully added task';
          }
          else if (req.body.method === 'remove') {
            const entries = allEntries.filter((e) => e.taskId === req.body.data.id);
            if (entries.length === 0) {
              project.tasks = project.tasks.filter((t) => t.id !== req.body.data.id);
              msg = 'successfully removed task';
            }
            else {
              msg = 'The task has timesheet entries. so it cannot be removed';
              code = 400;
            }
          }
          else if (req.body.method === 'edit') {
            const task = req.body.data;
            project.tasks = project.tasks.filter((t) => t.id !== task.id);
            project.tasks.push(task);
            msg = 'successfully edited task';
          }
        }
        else if (req.body.type === 'employee') {
          if (req.body.method === 'add') {
            const employees = req.body.data;
            project.projectEmployees = project.projectEmployees.concat(employees);
            msg = 'successfully added employee';
          }
          else if (req.body.method === 'remove') {
            const entries = allEntries.filter((e) => e.employeeId === req.body.data.employeeId && e.projectId === req.body.data.projectId);
            if (entries.length === 0) {
              project.projectEmployees = project.projectEmployees.filter((e) => e.employeeId !== req.body.data.employeeId);
              msg = 'successfully removed employee';
            }
            else {
              msg = 'The employee has timesheet entries. so it cannot be removed';
              code = 400;
            }
          }
          else if (req.body.method === 'edit') {
            const employee = req.body.data;
            project.projectEmployees = project.projectEmployees.filter((e) => e.employeeId !== employee.employeeId);
            project.projectEmployees.push(employee);
            msg = 'successfully edited employee';
          }
        }
        const projectTime = await this.dataSource.getRepository(HrmTimeProjects).save(project);
        const response = this.embedAdditionalInfo([projectTime], allEntries);
        return {
          code: code,
          message: msg,
          changedData: response[0]
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    private addTime(duration: string, startTime: string, employeeTimezone: string) {
      const [durationHours = '00', durationMinutes = '00', durationSeconds = '00'] = duration.split(':');
      const [startTimeHours = '00', startTimeMinutes = '00', startTimeSeconds = '00'] = startTime.split(':');
      const pauseTimeArray = (format(new Date(employeeTimezone), 'HH:mm:ss')).split(':');
      const durationInSec =   (((parseInt(durationHours)) * 60 * 60) + (parseInt(durationMinutes) * 60) + (parseInt(durationSeconds))) +
                              ((((parseInt(pauseTimeArray[0])) * 60 * 60) + (parseInt(pauseTimeArray[1]) * 60) + (parseInt(pauseTimeArray[2]))) - 
                              (((parseInt(startTimeHours)) * 60 * 60) + (parseInt(startTimeMinutes) * 60) + (parseInt(startTimeSeconds))));
      const billableHours = (Math.floor(durationInSec / (60 * 60)));        
      const durationResponse = (Math.floor(durationInSec / (60 * 60)))
                  .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                  (Math.floor((durationInSec - (billableHours * 60 * 60))/60))
                  .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                  (Math.floor(durationInSec % 60))
                  .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 

      return durationResponse;
    }
    private embedAdditionalInfo(projectsTime: HrmTimeProjects[], allEntries: HrmTimeEntries[]) {
      for (let i=0;i<projectsTime.length;i++) {
        for (let j=0;j<projectsTime[i].tasks.length;j++) {
          const entries = allEntries.filter((e) => e.taskId === projectsTime[i].tasks[j].id);
          let billableInSec = 0;
          let nonbillableInSec = 0;
          for (let k=0;k<entries.length;k++) {
            const [hours = '00', minutes = '00', seconds = '00'] = entries[k].duration.split(':');
            if (entries[k].billable) {
              billableInSec = billableInSec + ((parseInt(hours)) * 60 * 60) + (parseInt(minutes) * 60) + (parseInt(seconds));
            }
            else {
              nonbillableInSec = nonbillableInSec + ((parseInt(hours)) * 60 * 60) + (parseInt(minutes) * 60) + (parseInt(seconds));
            }
          }
          const billableHours = (Math.floor(billableInSec / (60 * 60)));        
          projectsTime[i].tasks[j]['billableHours'] = (Math.floor(billableInSec / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((billableInSec - (billableHours * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(billableInSec % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
          const nonbillableHours = (Math.floor(nonbillableInSec / (60 * 60)));        
          projectsTime[i].tasks[j]['nonbillableHours'] = (Math.floor(nonbillableInSec / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((nonbillableInSec - (nonbillableHours * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(nonbillableInSec % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
          projectsTime[i].tasks[j]['totalHours'] = (Math.floor((billableInSec + nonbillableInSec) / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(((billableInSec + nonbillableInSec) - ((billableHours + nonbillableHours) * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((billableInSec + nonbillableInSec) % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
        }
      }
      for (let i=0;i<projectsTime.length;i++) {
        for (let j=0;j<projectsTime[i].projectEmployees.length;j++) {
          const entries = allEntries.filter((e) => e.employeeId === projectsTime[i].projectEmployees[j].employeeId && e.projectId === projectsTime[i].id);
          let billableInSec = 0;
          let nonbillableInSec = 0;
          for (let k=0;k<entries.length;k++) {
            const [hours = '00', minutes = '00', seconds = '00'] = entries[k].duration.split(':');
            if (entries[k].billable) {
              billableInSec = billableInSec + ((parseInt(hours)) * 60 * 60) + (parseInt(minutes) * 60) + (parseInt(seconds));
            }
            else {
              nonbillableInSec = nonbillableInSec + ((parseInt(hours)) * 60 * 60) + (parseInt(minutes) * 60) + (parseInt(seconds));
            }
          }
          const billableHours = (Math.floor(billableInSec / (60 * 60)));        
          projectsTime[i].projectEmployees[j]['billableHours'] = (Math.floor(billableInSec / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((billableInSec - (billableHours * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(billableInSec % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
          const nonbillableHours = (Math.floor(nonbillableInSec / (60 * 60)));        
          projectsTime[i].projectEmployees[j]['nonbillableHours'] = (Math.floor(nonbillableInSec / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((nonbillableInSec - (nonbillableHours * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(nonbillableInSec % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
          projectsTime[i].projectEmployees[j]['totalHours'] = (Math.floor((billableInSec + nonbillableInSec) / (60 * 60)))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor(((billableInSec + nonbillableInSec) - ((billableHours + nonbillableHours) * 60 * 60))/60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ':' + 
                      (Math.floor((billableInSec + nonbillableInSec) % 60))
                      .toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
        }
      }
      return projectsTime;
    }
}