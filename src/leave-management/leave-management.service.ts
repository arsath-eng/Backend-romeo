import { HrmLeaveCategories } from '@flows/allEntities/leaveCategories.entity';
import { SocketClient } from '@flows/socket/socket-client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Request, Response } from 'express';
import { HrmLeaveHistory } from '@flows/allEntities/leaveHistory.entity';
import { HrmLeaveRequests } from '@flows/allEntities/leaveRequests.entity';
import { HrmLeaveBalances } from '@flows/allEntities/leaveBalances.entity';
import {v4 as uuidv4} from 'uuid';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { differenceInMinutes, eachDayOfInterval, format, getDay, parse, parseISO } from 'date-fns';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { S3Service } from '@flows/s3/service/service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { log } from 'console';
import { earningsDto, GetTimelineLeavesDto, GetTimelineResponseDto, postTimelineDto } from '@flows/allDtos/leaveManagement.dto.';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmRosterShifts } from '@flows/allEntities/hrmRoster.entity';
import { APIService } from '../superAdminPortalAPI/APIservice.service';
import { ConfigService } from '@nestjs/config';
import { formatInTimeZone } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB';
import * as AWS from 'aws-sdk';
import { attendanceSettingsConfigDto, attendanceSettingsDto } from '@flows/allDtos/attendance.dto';
import { getAttendanceSettings } from '@flows/attendance/attendanceSettings.util';
import { canApprove } from '@flows/access-levels/accessLevels.util';
import { leaveRequestTemplate } from 'emailTemplate.util';
const axios = require('axios')


@Injectable()
export class LeaveManagementService {
    private readonly PayrollAPI;
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly socketClient: SocketClient,
        private readonly notificationService: NotificationService,
        private readonly s3Service: S3Service,
        private eventEmitter: EventEmitter2,
        private readonly APIService: APIService,
        private readonly configService: ConfigService
    ) {
      this.PayrollAPI = axios.create({
        baseURL: this.configService.get<string>('PAYROLLBACKEND'),
      })
    }

    async postLeaveCategory(req: Request) {
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status"!=$2',
        [req.body.companyId,'Non Active'],
      );
      let arr = [];
      const leaveCategory = req.body;
      if (leaveCategory.assignees.everyoneIncludingNew) {
        for (let i=0;i<employeeDetails.length;i++) {
          arr.push(employeeDetails[i].employeeId);
        }
      }
      else {
        arr = leaveCategory.assignees.employeeIds;
      }
        leaveCategory['id'] = uuidv4();
        for (let i=0;i<arr.length;i++) {
            const leaveBalance = {
                "categoryId": leaveCategory['id'],
                "employeeId":arr[i],
                "companyId":req.body.companyId,
                "total": leaveCategory.automaticAccrual.amount,
                "used": "0",
            } 
            await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
        }
        const savedLeaveCategory = await this.dataSource.getRepository(HrmLeaveCategories).save(leaveCategory);
        return {id: savedLeaveCategory.id};
    }
    async getLeaveCategory(companyId: string, all: boolean, id: string) {
        let leavePolicies: HrmLeaveCategories[];
        if (companyId && all) {
            leavePolicies = await this.dataSource.query(
                'SELECT * FROM hrm_leave_categories WHERE "companyId"=$1',
                [companyId],
              );
        }
        else if (id) {
            leavePolicies = await this.dataSource.query(
                'SELECT * FROM hrm_leave_categories WHERE "id"=$1',
                [id],
              );
        }
        return leavePolicies;
    }
    async putLeaveCategory(req: Request) {
      const newLeaveCategory = req.body;
      const leaveCategories = await this.dataSource.query(
        'SELECT * FROM hrm_leave_categories WHERE "id"=$1',
        [newLeaveCategory.id],
      );
      const oldLeaveCategory = leaveCategories[0];
      if (!oldLeaveCategory.assignees.everyoneIncludingNew && newLeaveCategory.assignees.everyoneIncludingNew) {
        const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status"!=$2',
          [req.body.companyId,'Non Active'],
        );
        for (let i=0;i<employeeDetails.length;i++) {
          if (!(oldLeaveCategory.assignees.employeeIds.includes(employeeDetails[i].employeeId))) {
            const leaveBalance = {
              "categoryId": newLeaveCategory.id,
              "employeeId":employeeDetails[i].employeeId,
              "companyId":req.body.companyId,
              "total": newLeaveCategory.automaticAccrual.amount,
              "used": "0",
            } 
            await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
          }
      }
      }
      await this.dataSource.getRepository(HrmLeaveCategories).save(req.body);
    }
    async deleteLeaveCategory(categoryId: string) {
        await this.dataSource.getRepository(HrmLeaveCategories).createQueryBuilder().delete().where({ id: categoryId }).execute();
    }

    async getLeaveHistory(employeeId: string, categoryId: string) {
        let leaveHistory: HrmLeaveHistory[];
        if (employeeId && categoryId) {
            leaveHistory = await this.dataSource.query(
                'SELECT * FROM hrm_leave_history WHERE "employeeId"=$1 AND "categoryId"=$2',
                [employeeId, categoryId],
              );
        }
        else if (employeeId) {
            leaveHistory = await this.dataSource.query(
                'SELECT * FROM hrm_leave_history WHERE "employeeId"=$1',
                [employeeId],
              );
        }
        else if (categoryId) {
            leaveHistory = await this.dataSource.query(
                'SELECT * FROM hrm_leave_history WHERE "categoryId"=$1',
                [categoryId],
              );
        }
        return leaveHistory;
    }

    async getLeaveRequest(companyId: string, all: boolean, id: string, employeeId: string) {
      let leaveRequest: HrmLeaveRequests[];
      if (employeeId) {
        leaveRequest = await this.dataSource.query(
            'SELECT * FROM hrm_leave_requests WHERE "employeeId"=$1',
            [employeeId],
          );
    }
      else if (companyId && all) {
          leaveRequest = await this.dataSource.query(
              'SELECT * FROM hrm_leave_requests WHERE "companyId"=$1',
              [companyId],
            );
      }
      else if (id) {
          leaveRequest = await this.dataSource.query(
              'SELECT * FROM hrm_leave_requests WHERE "id"=$1',
              [id],
            );
      }
      return leaveRequest;
  }
  async postLeaveRequest(req: Request) {
    try {
      let type;
      const employee: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status"!=$2',
        [req.body.employeeId,'Non Active'],
      ).then(res => res[0]);
        const id = uuidv4();
        const leaveRequest = {
          employeeId: req.body.employeeId,
          categoryId: req.body.categoryId,
          startDate: req.body.dateList[0].date,
          endDate: req.body.dateList[req.body.dateList.length-1].date,
          fileId: req.body.fileId,
          coverupPersonId: req.body.coverupPersonId,
          status: req.body.status,
          totalHours: req.body.totalHours,
          totalDays: req.body.totalDays,
          dateList: req.body.dateList,
          note: req.body.note,
          notificationId: '',
          historyId: '',
          companyId: req.body.companyId,
          requesterId: req.headers['userid'] as string
        }
        leaveRequest.notificationId = id;
        const leaveBalance = await this.dataSource.query(
          `SELECT b.*, p."timeUnit", p."name"
           FROM hrm_leave_balances b
           JOIN hrm_leave_categories p ON b."categoryId" = p."id" 
           WHERE b."employeeId" = $1 AND b."categoryId" = $2`,
          [req.body.employeeId, req.body.categoryId]
        ).then(res => res[0]);
        
          let msgType = '';
          if (leaveBalance.timeUnit === 'DAYS') {
            leaveBalance.used = parseFloat(leaveBalance.used) + parseFloat(req.body.totalDays) + '';
            msgType = req.body.totalDays + ' day(s) of ' + leaveBalance.name;
            type = 'day';
          }
          else if (leaveBalance.timeUnit === 'HOURS') {
            leaveBalance.used = parseFloat(leaveBalance.used) + parseFloat(req.body.totalHours) + '';
            msgType = req.body.totalHours + ' hour(s) of ' + leaveBalance.name;
            type = 'hour';
          }
        delete leaveBalance.timeUnit;
        await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
        const dateRange = format(new Date(req.body.dateList[0].date), 'do MMM, y') + ' - ' + format(new Date(req.body.dateList[req.body.dateList.length-1].date), 'do MMM, y');

        let amount;
        if (req.body.hasOwnProperty('totalDays') && req.body.totalDays !== '') {
          amount = req.body.totalDays;
        }
        else {
          amount = req.body.totalHours;
        }
        const historyId = await this.leaveHistory(null, leaveRequest.employeeId, leaveRequest.categoryId, req.body.employeeId, amount, req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1), dateRange, '', req.body.note, leaveBalance.companyId);
        leaveRequest.historyId = historyId;
        leaveRequest.companyId = employee.companyId;
        const savedLeaveRequest = await this.dataSource.getRepository(HrmLeaveRequests).save(leaveRequest);
  
        const startDate = new Date(req.body.dateList[0].date);
        const endDate = new Date(req.body.dateList[req.body.dateList.length - 1].date);
        const isSameDate = startDate.getTime() === endDate.getTime();
        
        const dateText = isSameDate
          ? `on ${format(startDate, 'do MMM, y')}`
          : `from ${format(startDate, 'do MMM, y')} to ${format(endDate, 'do MMM, y')}`;
        
        await this.notificationService.addNotifications(
          'leaveRequest',
          `${employee.fullName.first + ' ' + employee.fullName.last} is requesting a ${leaveBalance.name} leave ${dateText}.`,
          savedLeaveRequest['id'],
          req.body.companyId,
          req.headers['userid'] as string
        );

        const employees: HrmEmployeeDetails[] = await this.dataSource.query(
          `SELECT * FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`,
          [employee.companyId],
        );
        
        for (let i = 0; i < employees.length; i++) {
          const approve = await canApprove(this.dataSource, employees[i].employeeId, 'leaves', req.headers['userid'] as string);
          if (approve) {
            const body = await leaveRequestTemplate('', employee.fullName.first + ' ' + employee.fullName.last, msgType, leaveBalance.name, format(new Date(), 'do MMM, y'), leaveBalance.total, parseFloat(leaveBalance.used), type);
            const emitBody = { sapCountType:'LeaveRequest',companyId: employee.companyId, subjects: 'Leave Request', email: employees[i].email.work, body};
            this.eventEmitter.emit('send.email', emitBody);
          }
        }
        
        return {
          code: 201,
          data: savedLeaveRequest
        }
    } catch (error) {
      console.log(error);
    }
  }
  async putLeaveRequest(req: Request) {
    try {
      let leaveRequest: HrmLeaveRequests[] = await this.dataSource.query(
        'SELECT * FROM hrm_leave_requests WHERE "id"=$1',
        [req.body.id],
      );
    let leaveHistory: HrmLeaveHistory[] = await this.dataSource.query(
      'SELECT * FROM hrm_leave_history WHERE "id"=$1',
      [leaveRequest[0].historyId],
    );
      const leaveBalance = await this.dataSource.query(
        `SELECT b.*, p."timeUnit", p."name"
         FROM hrm_leave_balances b
         JOIN hrm_leave_categories p ON b."categoryId" = p."id" 
         WHERE b."employeeId" = $1 AND b."categoryId" = $2`,
        [leaveRequest[0].employeeId, leaveRequest[0].categoryId]
      ).then(res => res[0]);
      if (req.body.status === 'denied' || req.body.status === 'withdrawn' ) {
        leaveBalance.used = parseFloat(leaveBalance.used) - parseFloat(leaveBalance.timeUnit === 'DAYS' ? leaveRequest[0].totalDays : leaveRequest[0].totalHours) + '';
      }
      const dateRange = format(new Date(leaveRequest[0].startDate), 'do MMM, y') + ' - ' + format(new Date(leaveRequest[0].endDate), 'do MMM, y');
      await this.leaveHistory(leaveRequest[0].historyId, leaveRequest[0].employeeId, leaveRequest[0].categoryId, req.headers['userid'] as string, leaveHistory[0].amount, req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1), dateRange, '', leaveRequest[0].note, leaveRequest[0].companyId);
      
    delete leaveBalance.timeUnit;
    leaveRequest[0].status = req.body.status;
    await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
    const savedLeaveRequest = await this.dataSource.getRepository(HrmLeaveRequests).save(leaveRequest[0]);
    await this.socketClient.sendNotificationRequest(savedLeaveRequest);

    const startDate = new Date(savedLeaveRequest.dateList[0].date);
    const endDate = new Date(savedLeaveRequest.dateList[savedLeaveRequest.dateList.length - 1].date);
    const isSameDate = startDate.getTime() === endDate.getTime();
    
    const dateText = isSameDate
      ? `on ${format(startDate, 'do MMM, y')}`
      : `from ${format(startDate, 'do MMM, y')} to ${format(endDate, 'do MMM, y')}`;
    
    await this.notificationService.addNotifications(
      'alert',
      `Your ${leaveBalance.name} Leave Request ${dateText} has been ${req.body.status}.`,
      savedLeaveRequest['id'],
      savedLeaveRequest.companyId,
      savedLeaveRequest.requesterId
    );
    return {
      code: 200,
      data: savedLeaveRequest
    }
    } catch (error) {
      console.log(error);
    }
  }

    async putLeaveBalance(req: Request) {
        const leaveBalance: HrmLeaveBalances[] = await this.dataSource.query(
            'SELECT * FROM hrm_leave_balances WHERE "categoryId"=$1 AND "employeeId"=$2',
            [req.body.categoryId, req.body.employeeId],
          );
        if (req.body.method === 'add') {
            leaveBalance[0].total = parseFloat(leaveBalance[0].total) + parseFloat(req.body.amount) + '';
        }
        else if (req.body.method === 'sub') {
            leaveBalance[0].total = parseFloat(leaveBalance[0].total) - parseFloat(req.body.amount) + '';
        }
        const dateRange = format(new Date(), 'do MMM, y');
        await this.leaveHistory(null, req.body.employeeId, req.body.categoryId, req.headers['userid'] as string, req.body.amount, 'Manual', dateRange, req.body.method, null, leaveBalance[0].companyId);
        await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance[0]);
        return {
          code: 200,
          data: leaveBalance[0]
        }
    }
    async leaveHistory(
        id: string,
        employeeId: string,
        categoryId: string,
        changedBy: string,
        amount: string,
        action: string,
        date: string,
        actionType: string,
        note: string,
        companyId: string,
    ) {
        let leaveHistory = {
            employeeId,
            categoryId,
            changedBy,
            amount,
            action,
            date,
            actionType,
            companyId,
        }
        if (id) {
          leaveHistory['id'] = id;
        }
        if (note) {
          leaveHistory['note'] = note;
        }
        else {
          leaveHistory['note'] = '';
        }
        const savedLeaveHistory = await this.dataSource.getRepository(HrmLeaveHistory).save(leaveHistory);
        return savedLeaveHistory.id;
    }

    async postTimeline(body: postTimelineDto) {
        try {
          const penaltyConfig = [
            {
              awardId : "27",
              penalties : [
              {
                id: 1,
                name: "Ordinary Hours",
                hasPeriod: false,
                eligibleDays: "12345",
                from: null, 
                to: null,
                isOvertime: false,
                hourLimit: null,
                hourLimitType: null
              },
              {
                id: 2,
                name: "Saturday",
                hasPeriod: false,
                eligibleDays: "6",
                from: null, 
                to: null,
                isOvertime: false,
                hourLimit: null,
                hourLimitType: null
              },
              {
                id: 3,
                name: "Sunday",
                hasPeriod: false,
                eligibleDays: "0",
                from: null, 
                to: null,
                isOvertime: false,
                hourLimit: null,
                hourLimitType: null
              },
              {
                id: 4,
                name: "Public Holiday",
                hasPeriod: false,
                eligibleDays: "P",
                from: null, 
                to: null,
                isOvertime: false,
                hourLimit: null,
                hourLimitType: null
              },
              {
                id:5,
                name: "Sunday - Overtime",
                hasPeriod: false,
                eligibleDays: "0",
                from: null, 
                to: null,
                isOvertime: true,
                hourLimit: null,
                hourLimitType: null
              },
              {
                id:6,
                name: "Overtime (First 2 hours)",
                hasPeriod: false,
                eligibleDays: "123456",
                from: null, 
                to: null,
                isOvertime: true,
                hourLimit: 2,
                hourLimitType: "first"
              },
              {
                id:7,
                name: "Overtime (After 2 hours)",
                hasPeriod: false,
                eligibleDays: "123456",
                from: null, 
                to: null,
                isOvertime: true,
                hourLimit: 2,
                hourLimitType: "after"
              },
              {
                id:8,
                name: "Public Holiday - Overtime",
                hasPeriod: false,
                eligibleDays: "P",
                from: null, 
                to: null,
                isOvertime: true,
                hourLimit: null,
                hourLimitType: null
              }, 
              ]
            
            }  
          ]
          let res = new GetTimelineResponseDto();
          res.leaves = [];
          res.hours = [];
          const { employeeId, startDate, endDate, earnings, payrollConfigs } = body;
          const today = new Date().toISOString().split('T')[0];
          const employee: HrmEmployeeDetails = await this.dataSource.query(
            `SELECT * FROM hrm_employee_details WHERE "employeeId"='${employeeId}'`
          ).then(res => res[0]);
          const company = await this.APIService.getCompanyById(employee.companyId);
          const attendanceSettings: attendanceSettingsDto = (await getAttendanceSettings(this.dataSource, employee.companyId)).settings[0];
          const serverTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss zzz');
          const calculationMethod = company.companyAccounts.hasOwnProperty('payrollCalculationMethod') && company.companyAccounts.payrollCalculationMethod ? company.companyAccounts.payrollCalculationMethod : 'ATTENDANCE';
          let source;
          if (calculationMethod === 'ATTENDANCE') {
            const attendance = await this.dataSource.query(
              `SELECT * FROM hrm_attendance 
               WHERE "employeeId" = $1 
               AND "date" >= $2 
               AND "date" <= $3`,
              [employeeId, startDate, endDate]
            )
            source = attendance.flatMap((a) => 
              a.timeEntries.map(entry => ({
                ...entry,
                date: a.date,
                isOvertime: entry.isOvertime !== undefined ? entry.isOvertime : false
              }))
            ).filter(entry => entry.ongoing === false && entry.isBreak === false);
          }
          else {
            source = await this.dataSource.query(
              `SELECT * FROM hrm_roster_shifts 
               WHERE "employeeId" = $1 
               AND "date" >= $2 
               AND "date" <= $3`,
              [employeeId, startDate, endDate]
            )
          }
          const [leaveCategories, leaveRequests, holidays] = await Promise.all([
            this.dataSource.query(
              `SELECT * FROM hrm_leave_categories WHERE "companyId" = $1`,
              [employee.companyId]
            ),
            this.dataSource.query(
              `SELECT * FROM hrm_leave_requests WHERE "employeeId" = $1`,
              [employeeId]
            ),
            this.dataSource.query(
              `SELECT * FROM hrm_configs 
               WHERE "companyId" = $1 
               AND "type" = $2 
               AND data->>'date' >= $3 
               AND data->>'date' <= $4`,
              [employee.companyId, 'payroll_holiday', startDate, endDate]
            )
          ]);
          res.leaves = leaveCategories
          .filter(category => (company.country === 'Australia' ? category.timeOffCategoryType : category.name))
          .map(category => {
            const leaves = leaveRequests.filter(leave => leave.categoryId === category.id);
            const dateList = leaves.flatMap((d) => d.dateList).filter((d) => d.date >= startDate && d.date <= endDate).sort((a, b) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            if (dateList.length > 0) {
              let unitAmount = 0;
              for (const date of dateList) {
                unitAmount += parseFloat(date.amount);
              } 
              return {
                type: `${company.country === 'Australia' ? category.timeOffCategoryType : category.name} (${dateList[0].date} to ${dateList[dateList.length - 1].date})`,
                unitType: category.timeUnit,
                unitAmount: String(unitAmount)
              };
            }
            return null;
          })
          .filter(Boolean);
          res.publicHolidays = holidays.filter((h) => h.data.groupIds.includes(employee.payrollEmployment.holidayGroup)).map((h) => {
            let currentCompanyTimeFull = new Date(formatInTimeZone(
              new Date(serverTime),
              company.timezone,
              'yyyy-MM-dd',
              { locale: enGB },
            ));
            const workingDay = attendanceSettings.workingDays.find((d) => d.id === getDay(currentCompanyTimeFull))
            if (company.country === 'Australia') {
              const unitAmount = (differenceInMinutes(
                parseISO(`${today}T${format(parse(workingDay.end, 'hh:mm a', new Date()), 'HH:mm')}:00`), 
                parseISO(`${today}T${format(parse(workingDay.start, 'hh:mm a', new Date()), 'HH:mm')}:00`)
              ) / 60).toFixed(2);
              return {
                name: h.data.name,
                unitAmount: unitAmount,
                date: h.data.date
              }
            }
            else {
              return {
                name: h.data.name,
                date: h.data.date
              }
            }
          });
          const payrollCalculation = company.companyAccounts.hasOwnProperty('payrollCalculation') ? company.companyAccounts.payrollCalculation : false;
          const payrollAwards = company.companyAccounts.hasOwnProperty('payrollAwards') ? company.companyAccounts.payrollAwards : false;
          const start = calculationMethod === 'ATTENDANCE' ? 'clockIn' : 'startTime';
          const end = calculationMethod === 'ATTENDANCE' ? 'clockOut' : 'endTime';
        const earningsRateIds = earnings.map(earning => earning.earningsRateId);
        if (payrollAwards && payrollCalculation) { 
          const awardId = employee.payrollEmployment.hasOwnProperty('employeeAward') ? 
                employee.payrollEmployment.employeeAward : '';
          const penaltyList = penaltyConfig.find((item)=>item.awardId === awardId)?.penalties || []    
          for (let i = 0; i < earnings.length; i++) {
            const penalty = penaltyList.find((penalty) => String(penalty.id) === String(earnings[i].awardPenalty));
            
            if (penalty) {
              // Initialize total minutes
              let totalMinutes = 0;
              
              // Process each source entry
              source.forEach(entry => {
                // Skip entries with mismatched overtime status
                if (entry.isOvertime !== penalty.isOvertime) return;
                
                const entryDay = getDay(new Date(entry.date)).toString();
                
                // Check if entry's day is eligible (including public holiday if applicable)
                const holidaysDateArray = holidays.flatMap(h => h.data.date);
                const dateStr = new Date(entry.date).toISOString().split('T')[0];
                const isPublicHoliday = holidaysDateArray.includes(dateStr)
                const isDayEligible = penalty.eligibleDays.includes(entryDay) || 
                                     (isPublicHoliday && penalty.eligibleDays.includes('P'));
                
                if (!isDayEligible) return;
                
                // Initialize overlap minutes
                let overlapMinutes = 0;
                
                if (penalty.hasPeriod && penalty.from !== null && penalty.to !== null) {
                  // Convert times to minutes for easier comparison
                  const entryStartMinutes = this.timeToMinutes(entry.clockIn);
                  const entryEndMinutes = this.timeToMinutes(entry.clockOut);
                  const periodStartMinutes = this.timeToMinutes(penalty.from);
                  const periodEndMinutes = this.timeToMinutes(penalty.to);
                  
                  // Handle period crossing midnight
                  if (periodStartMinutes > periodEndMinutes) {
                    // Period crosses midnight (e.g., 22:00 to 06:00)
                    if (entryStartMinutes >= periodStartMinutes) {
                      // Entry starts after period start on same day
                      overlapMinutes = entryEndMinutes - entryStartMinutes;
                    } else if (entryEndMinutes <= periodEndMinutes) {
                      // Entry is within early morning hours
                      overlapMinutes = entryEndMinutes - entryStartMinutes;
                    } else if (entryStartMinutes < periodEndMinutes) {
                      // Entry starts before period end in morning
                      overlapMinutes = periodEndMinutes - entryStartMinutes;
                    } else if (entryEndMinutes > periodStartMinutes) {
                      // Entry ends after period start in evening
                      overlapMinutes = entryEndMinutes - periodStartMinutes;
                    }
                  } else {
                    // Normal period within same day
                    const overlapStart = Math.max(entryStartMinutes, periodStartMinutes);
                    const overlapEnd = Math.min(entryEndMinutes, periodEndMinutes);
                    
                    if (overlapEnd > overlapStart) {
                      overlapMinutes = overlapEnd - overlapStart;
                    }
                  }
                } else {
                  // If no period constraints, use entire entry duration
                  overlapMinutes = this.timeToMinutes(entry.clockOut) - this.timeToMinutes(entry.clockIn);
                }
                
                // Apply hour limits if applicable for overtime entries
                if (entry.isOvertime && penalty.hourLimit !== null && penalty.hourLimitType !== null) {
                  const hourLimitMinutes = penalty.hourLimit * 60;
                  
                  if (penalty.hourLimitType === "first") {
                    // Only count the first X hours
                    overlapMinutes = Math.min(overlapMinutes, hourLimitMinutes);
                  } else if (penalty.hourLimitType === "after") {
                    // Only count hours after the first X hours
                    if (overlapMinutes > hourLimitMinutes) {
                      overlapMinutes = overlapMinutes - hourLimitMinutes;
                    } else {
                      overlapMinutes = 0;
                    }
                  }
                }
                
                if (overlapMinutes > 0) {
                  totalMinutes += overlapMinutes;
                }
              });
              
              // Convert minutes to hours with 2 decimal places
              const unitAmount = (totalMinutes / 60).toFixed(2);
              
              res.hours.push({
                earningsRateId: earnings[i].earningsRateId,
                unitAmount: unitAmount
              });
            }
          }
        }
        else if (!payrollAwards && payrollCalculation) {
          let ordinaryHoursIds = []
          const overtimeHoursIds = payrollConfigs.filter((config) => config.data.name === 'Overtime Hours')
                                                   .flatMap((configs) => configs.id); 
          if (overtimeHoursIds.length === 0) {
            ordinaryHoursIds = payrollConfigs.flatMap((configs) => configs.id);
            for (let i = 0; i < ordinaryHoursIds.length; i++) {
              if (earningsRateIds.includes(ordinaryHoursIds[i])) {
                const unitAmount = (source.reduce((total, entry) => {
                  return total + differenceInMinutes(
                    parseISO(`${today}T${entry[end]}:00`), 
                    parseISO(`${today}T${entry[start]}:00`)
                  );
                }, 0) / 60).toFixed(2);
                res.hours.push({
                  earningsRateId: ordinaryHoursIds[i],
                  unitAmount: unitAmount
                })
              }
            }
          }
          else {
            ordinaryHoursIds = payrollConfigs.filter((config) => config.data.name === 'Ordinary Hours')
                                               .flatMap((configs) => configs.id);
            const ordinaryEntries = source.filter((entry) => entry.isOvertime === false);
            const overtimeEntries = source.filter((entry) => entry.isOvertime === true);
            for (let i = 0; i < ordinaryHoursIds.length; i++) {
              if (earningsRateIds.includes(ordinaryHoursIds[i])) {
                const unitAmount = (ordinaryEntries.reduce((total, entry) => {
                  return total + differenceInMinutes(
                    parseISO(`${today}T${entry[end]}:00`), 
                    parseISO(`${today}T${entry[start]}:00`)
                  );
                }, 0) / 60).toFixed(2);
                res.hours.push({
                  earningsRateId: ordinaryHoursIds[i],
                  unitAmount: unitAmount
                })
              }
            }
            for (let i = 0; i < overtimeHoursIds.length; i++) {
              if (earningsRateIds.includes(overtimeHoursIds[i])) {
                const unitAmount = (overtimeEntries.reduce((total, entry) => {
                  return total + differenceInMinutes(
                    parseISO(`${today}T${entry[end]}:00`), 
                    parseISO(`${today}T${entry[start]}:00`)
                  );
                }, 0) / 60).toFixed(2);
                res.hours.push({
                  earningsRateId: overtimeHoursIds[i],
                  unitAmount: unitAmount
                })
              }
            }
          }
        }
        else {
          return new HttpException('Unhandled', HttpStatus.FORBIDDEN);
        }
          return res
        } catch (error) {
          console.log(error);
        }
      }

      getMiddleDays(fromDay, toDay) {
        fromDay = fromDay % 7;
        toDay = toDay % 7;
        const middleDays = [];
        if (fromDay === toDay) {
          return middleDays;
        }
        if (fromDay < toDay) {
          for (let day = fromDay + 1; day < toDay; day++) {
            middleDays.push(day);
          }
        } else {
          for (let day = fromDay + 1; day <= 6; day++) {
            middleDays.push(day);
          }
          for (let day = 0; day < toDay; day++) {
            middleDays.push(day);
          }
        }
        return middleDays;
      }

      timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      }

        async getAwardsPenaltyConfig(){
          try {
            const s3 = new AWS.S3({
              accessKeyId: process.env.AWS_S3_ACCESS_KEY,
              secretAccessKey: process.env.AWS_S3_KEY_SECRET,
            });
            const params = {
              Bucket: process.env.RESOURCE_BUCKET_NAME,
              Key: process.env.PAYROLL_AWARDS_PENALTY_CONFIG,
            };
            const data = await s3
              .getObject(params)
              .promise()
              .then((data) => {
                return JSON.parse(data.Body.toString());
              });
            return data;
          } catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
          }
        }
}
