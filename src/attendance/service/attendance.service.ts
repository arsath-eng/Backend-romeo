import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';
import { formatInTimeZone } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmAttendance, HrmAttendanceRequests } from '@flows/allEntities/attendance.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {HrmAttendanceSummary} from '@flows/allEntities/attendanceSummary.entity'
import {startOfWeek, endOfWeek,format,parse, differenceInMinutes, getDay, parseISO, addWeeks, isAfter, isBefore, isEqual} from 'date-fns';
import { attendance, attendanceSettingsDto, CheckLocationDto, postAttendanceRequestDto } from '@flows/allDtos/attendance.dto';
import { th } from 'date-fns/locale';
import { ConfigService } from '@nestjs/config';
import { LeaveManagementService } from '@flows/leave-management/leave-management.service';
import { time } from 'console';
import { HrmRosterShifts } from '@flows/allEntities/hrmRoster.entity';
import { S3Service } from '@flows/s3/service/service';
import { PdfService } from '@flows/pdf/pdf.service';
const axios = require('axios')
import { getAttendanceSettings } from '@flows/attendance/attendanceSettings.util';
import { stat } from 'fs';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SocketClient } from '@flows/socket/socket-client';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';
import { timeLogTemplate } from 'emailTemplate.util';


@Injectable()
export class AttendanceService {
  private readonly PayrollAPI;
  constructor(
    private readonly APIService: APIService,
    @InjectRepository(HrmAttendance)
    private attendanceRepository: Repository<HrmAttendance>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(HrmAttendanceSummary)
    private attendanceSummaryRepository: Repository<HrmAttendanceSummary>,
    private readonly configService: ConfigService,
    private readonly leaveManagementService: LeaveManagementService,
    private s3Service: S3Service,
    private readonly pdfService: PdfService,
    private readonly notificationService: NotificationService,
    private eventEmitter: EventEmitter2,
    private readonly socketClient: SocketClient,
  ) {
    this.PayrollAPI = axios.create({
      baseURL: this.configService.get<string>('PAYROLLBACKEND'),
    })
  }

  async getEmployeeAttendanceTodayMyCircle(employeeId: string, companyId: string) {
    try {
      let circle = [];
      const company = await this.APIService.getCompanyById(companyId);
      if (!company) { throw new NotFoundException('Company not found'); }
      const serverTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss zzz');
      let currentCompanyTime = formatInTimeZone(
                new Date(serverTime),
                company.timezone,
                'yyyy-MM-dd',
                { locale: enGB },
              );
      const employeeList: HrmEmployeeDetails[] = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status"=$2',
        [companyId, 'Active'],
      );
      let employeeDetails;
      for (let k = 0; k < employeeList.length; k++) {
        employeeDetails = employeeList[k];
        for (let i = 0; i < employeeDetails.jobInformation.length; i++) {
          if (employeeDetails.jobInformation[i].active) {
            if (
              employeeDetails.jobInformation[i].reportTo.reporterId ===
              employeeId
            ) {
              circle.push(
                employeeDetails.jobInformation[i].reportTo.employeeId,
              );
            }
            if (
              employeeDetails.jobInformation[i].reportTo.employeeId ===
              employeeId
            ) {
              circle.push(
                employeeDetails.jobInformation[i].reportTo.employeeId,
              );
              for (let j = 0; j < employeeDetails.jobInformation.length; j++) {
                if (
                  employeeDetails.jobInformation[i].reportTo.reporterId ===
                  employeeDetails.jobInformation[j].reportTo.reporterId
                ) {
                  circle.push(
                    employeeDetails.jobInformation[j].reportTo.employeeId,
                  );
                }
              }
            }
          }
        }
      }
      circle = [...new Set(circle)];
      const attendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE date = $1 AND "companyId" = $2', [currentCompanyTime, companyId]);
      
      const attendanceArray = circle.map(employeeId => {
        const employeeAttendance = attendance.find(att => att.employeeId === employeeId);
        
        return employeeAttendance || {
          employeeId: employeeId,
          date: currentCompanyTime,
          isOnline: false,
          isApproved: false,
          locationType: '',
          location: '',
          timeEntries: [],
          companyId: companyId,
        };
      });
      
      return attendanceArray;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }
  async postAttendance(body: any){
    try {
      const { employeeId, companyId, date, locationType, location } = body;
      const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 ',
        [employeeId],
      );
      if (!employeeDetails) { throw new NotFoundException(`Employee not found for employeeId ${employeeId}`); }
      employeeDetails.online = true;
      await this.dataSource.getRepository(HrmEmployeeDetails).save(employeeDetails);
      const isOnline = true
      const isApproved = false
      const timeEntries = []
      let savedAttendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "companyId" = $1 AND "employeeId" = $2 AND date= $3',[companyId,employeeId,date]).then((res) => res[0]);
      if (!savedAttendance) {
        const attendance = this.attendanceRepository.create({
          employeeId,
          date,
          isOnline,
          isApproved,
          locationType,
          location,
          timeEntries,
          companyId
        })
      savedAttendance = await this.attendanceRepository.save(attendance);
      }
      return savedAttendance;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async getAttendance(companyId: string,all:boolean,employeeId:string,date:string){
    try {
     if(all && date){
        const attendance = await this.dataSource.query('SELECT e."employeeId",COALESCE(a."isOnline",FALSE) AS "isOnline",a."locationType" ,COALESCE(a."timeEntries",\'[]\'::jsonb) As "timeEntries" FROM hrm_employee_details e LEFT JOIN  hrm_attendance a ON e."employeeId" = a."employeeId" AND a."date"=$1 WHERE e."companyId" =$2 ',[date,companyId]);
        const response = {
          attendance: attendance
        }
        return response;
     }
     if(!all &&date && employeeId){
        const weekStart = format(startOfWeek(new Date(date), { weekStartsOn: 1 }),'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(new Date(date), { weekStartsOn: 1 }),'yyyy-MM-dd');
        let attendance: HrmAttendance[] = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "companyId" = $1 AND "employeeId" = $2 AND date>= $3 AND date<=$4',[companyId,employeeId,weekStart,weekEnd]);
        const shifts: HrmRosterShifts[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "companyId" = $1  AND "employeeId" = $2 AND date= $3',[companyId,employeeId,date]);
        const todayAttendance = attendance.find((att) => att.date === date);
        const weeklyTimeEntries = attendance.flatMap((att) => att.timeEntries).filter((entry) => entry.ongoing === false && entry.isBreak === false);
        const weeklyDuration = this.getTimeDuration(weeklyTimeEntries);
        
        const response = {
          weeklyAttendance: attendance.length,
          weeklyDuration: weeklyDuration,
          attendance: todayAttendance ? [todayAttendance] : [],
          shifts: shifts,
        }
        return response;
     }

    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async updateAttendance(id: string, body:any){
    try {
      const attendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "id" = $1 ',[id]);
      if (!attendance) { throw new NotFoundException('Attendance not found for employeeId ' + id); }
      if(body.action === 'isApproved'){
        attendance[0].isApproved = true;
      }
      if(body.timeEntries){
        attendance[0].timeEntries = body.timeEntries;
      }
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async deleteAttendance(id: string){
    try {
      const attendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "id" = $1 ',[id]);
      if (!attendance) { throw new NotFoundException('Attendance not found for employeeId ' + id); }
      const updateAttendance = await this.attendanceRepository.delete(attendance[0]);
      return updateAttendance;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async postClock(body: any){
    try {
      const { employeeId, companyId, action, attendanceId, locationType } = body;
      const attendanceSettings: attendanceSettingsDto = (await getAttendanceSettings(this.dataSource, companyId)).settings[0];
      if (!attendanceSettings) { throw new NotFoundException(`Attendance settings not found for companyId ${companyId}`); }
      const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 ',
        [employeeId],
      ).then((res) => res[0]);
      if (!employeeDetails) { throw new NotFoundException(`Employee not found for employeeId ${employeeId}`); }
      const company = await this.APIService.getCompanyById(companyId);
      if (!company) { throw new NotFoundException(`Company not found for companyId ${companyId}`); }
      const serverTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss zzz');
      let currentCompanyTime = formatInTimeZone(
                new Date(serverTime),
                company.timezone,
                'HH:mm',
                { locale: enGB },
              );
      let currentCompanyTimeFull = new Date(formatInTimeZone(
        new Date(serverTime),
        company.timezone,
        'yyyy-MM-dd',
        { locale: enGB },
      ));
      const attendance: attendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "id" = $1 ',[attendanceId]).then((res) => res[0]);
      if (!attendance) {
        throw new NotFoundException('Attendance not found for attendanceId ' + attendanceId);
      }
      const workingDay = attendanceSettings.workingDays.find((d) => d.id === getDay(currentCompanyTimeFull));
      let shifts: HrmRosterShifts[] = await this.dataSource.query(`SELECT * FROM hrm_roster_shifts WHERE "employeeId" = $1 AND "companyId" = $2 AND "date" = $3 AND "endTime" > $4`, 
                                      [employeeId, companyId, format(currentCompanyTimeFull, 'yyyy-MM-dd'), currentCompanyTime]);
      const ongoingIndex = attendance.timeEntries.findIndex((entry) => entry.ongoing === true);
                                      
      if (action === 'clockIn') {
        let overtime, clockIn;
        if (shifts.length !== 0) {
          shifts = shifts.sort((a, b) => a.startTime.localeCompare(b.endTime));
          const shift = shifts.find((s) => currentCompanyTime >= s.startTime && currentCompanyTime <= s.endTime);
          if (shift && shift.breaks.length > 0 && ongoingIndex !== -1) {
              const shiftBreak = shift.breaks.find((b) => b.startTime === attendance.timeEntries[ongoingIndex].clockIn);
              if (shiftBreak) {
                  attendance.timeEntries[ongoingIndex].clockOut = currentCompanyTime;
                  attendance.timeEntries[ongoingIndex].ongoing = false;
                  clockIn = currentCompanyTime;
              }
          }
          else {
            clockIn = (shift && (currentCompanyTime < shift.startTime) && !attendanceSettings.clockInEarly) 
                    ? (() => { throw new ForbiddenException('You cannot clock in at this time'); })() 
                    : (shift && (currentCompanyTime > shift.startTime) && !attendanceSettings.clockInLate) 
                    ? (() => { throw new ForbiddenException('You cannot clock in at this time'); })() 
                    : (!shift) 
                    ? shifts[0].startTime
                    : currentCompanyTime;
          }
          overtime = shifts[0].isOvertime;
        }
        else {
          overtime = attendanceSettings.clockInLate && currentCompanyTime >= format(parse(workingDay.end, 'hh:mm a', new Date()), 'HH:mm') ? true : false;
          clockIn = (!attendanceSettings.clockInEarly) 
                    ? (() => { throw new ForbiddenException('You cannot clock in at this time'); })() 
                    : (currentCompanyTime > format(parse(workingDay.start, 'hh:mm a', new Date()), 'HH:mm') && !attendanceSettings.clockInLate) 
                    ? (() => { throw new ForbiddenException('You cannot clock in at this time'); })() 
                    : currentCompanyTime;
        }
        employeeDetails.online = true;
        attendance.isOnline = true;
        attendance.locationType = locationType;
        attendance.timeEntries.push({
          id:attendance.timeEntries.length + 1,
          clockIn: clockIn,
          clockOut: '',
          taskId:"",
          ongoing: true,
          isOvertime: overtime,
          isBreak: false
        })
      }
      else if (action === 'clockOut') {
        if (shifts.length !== 0) {
          shifts = shifts.filter((s) => attendance.timeEntries[ongoingIndex].clockIn <= s.endTime).sort((a, b) => a.startTime.localeCompare(b.endTime));
          for (let i = 0; i < shifts.length; i++) {
            if (i === 0) {
              if (currentCompanyTime <= shifts[i].startTime) {
                attendance.timeEntries.splice(ongoingIndex, 1);
                employeeDetails.online = false;
                attendance.isOnline = false;
                break;
              }
              else if (currentCompanyTime <= shifts[i].endTime) {
                if (attendanceSettings.clockOutEarly) {
                  attendance.timeEntries[ongoingIndex].clockOut = currentCompanyTime;
                  attendance.timeEntries[ongoingIndex].ongoing = false;
                  attendance.isOnline = false;
                  break;
                }
                else {
                  throw new ForbiddenException('You can only clock out at or after ' + shifts[i].endTime);
                }
              }
              else {
                attendance.timeEntries[ongoingIndex].clockOut = shifts[i].endTime;
                attendance.timeEntries[ongoingIndex].ongoing = false;
              }
            }
            else if (currentCompanyTime <= shifts[i].endTime) {
              if (!attendanceSettings.clockOutEarly || !attendanceSettings.clockInLate) {
                break;
                //capped to the last shift time
              }
              else {
                attendance.timeEntries.push({
                  id:attendance.timeEntries.length + 1,
                  clockIn: shifts[i].startTime,
                  clockOut: currentCompanyTime,
                  taskId: attendance.timeEntries[ongoingIndex].taskId,
                  ongoing: false,
                  isOvertime: shifts[i].isOvertime,
                  isBreak: false
                })
              }
            }
            else {
                attendance.timeEntries.push({
                  id:attendance.timeEntries.length + 1,
                  clockIn: shifts[i].startTime,
                  clockOut: shifts[i].endTime,
                  taskId: attendance.timeEntries[ongoingIndex].taskId,
                  ongoing: false,
                  isOvertime: shifts[i].isOvertime,
                  isBreak: false
                })
            }
          }
        }
        else {
          if (attendanceSettings.clockOutLate) {
            employeeDetails.online = false;
            attendance.isOnline = false;
            if (currentCompanyTime <= format(parse(workingDay.end, 'hh:mm a', new Date()), 'HH:mm')) {
              if (!attendanceSettings.clockOutEarly) {
                throw new ForbiddenException('You can only clock out at or after ' + workingDay.end);
              }
              attendance.timeEntries[ongoingIndex].clockOut = currentCompanyTime;
              attendance.timeEntries[ongoingIndex].ongoing = false;
            }
            else {
              if (!attendance.timeEntries[ongoingIndex].isOvertime) {
                attendance.timeEntries[ongoingIndex].clockOut = format(parse(workingDay.end, 'hh:mm a', new Date()), 'HH:mm');
                attendance.timeEntries[ongoingIndex].ongoing = false;
                attendance.timeEntries.push({
                  id:attendance.timeEntries.length + 1,
                  clockIn: format(parse(workingDay.end, 'hh:mm a', new Date()), 'HH:mm'),
                  clockOut: currentCompanyTime,
                  taskId: attendance.timeEntries[ongoingIndex].taskId,
                  ongoing: false,
                  isOvertime: true,
                  isBreak: false
                })
              }
              else {
                attendance.timeEntries[ongoingIndex].clockOut = currentCompanyTime;
                attendance.timeEntries[ongoingIndex].ongoing = false;
              }
            }
          }
          else {
            employeeDetails.online = false;
            attendance.isOnline = false;
            attendance.timeEntries[ongoingIndex].clockOut = currentCompanyTime;
            attendance.timeEntries[ongoingIndex].ongoing = false;
          }
        }
      }
      await this.dataSource.getRepository(HrmEmployeeDetails).save(employeeDetails);
      const updateAttendance = await this.attendanceRepository.save(attendance);
      return updateAttendance;

    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async updateSettings(body: any){
    try {
      const settings: HrmConfigs[] = await this.dataSource.query('SELECT * FROM hrm_configs WHERE type =\'attendance\' AND "companyId" = $1 ',[body.companyId]);
      if(settings.length === 0){
        const config = this.commonRepository.create({
          type:'attendance',
          data:{
            isAutoClockOutByShift:body.isAutoClockOutByShift,
            weekStartDay:body.weekStartDate,
            autoRequestSummary:body.autoRequestSummary,
            autoAttendance:body.autoAttendance,
            workingDays:body.workingDays,
            clockInEarly:body.clockInEarly,
            clockInLate:body.clockInLate,
            clockOutEarly:body.clockOutEarly,
            clockOutLate:body.clockOutLate
          },
          companyId:body.companyId,
          createdAt:new Date(),
          modifiedAt:new Date()
        })
        const res =  await this.commonRepository.save(config);
        return {
          default:false,
          settings:[{
            id: res.id,
            isAutoClockOutByShift: res.data.isAutoClockOutByShift,
            workingDays:res.data.workingDays,
            autoRequestSummary:res.data.autoRequestSummary,
            autoAttendance:res.data.autoAttendance,
            weekStartDay:res.data.weekStartDay,
            clockInEarly:res.data.clockInEarly,
            clockInLate:res.data.clockInLate,
            clockOutEarly:res.data.clockOutEarly,
            clockOutLate:res.data.clockOutLate,
            companyId:res.companyId
          }]

        }
      }else{
        settings[0].data.isAutoClockOutByShift = body.isAutoClockOutByShift;
        settings[0].data.workingDays = body.workingDays;
        settings[0].data.autoRequestSummary = body.autoRequestSummary;
        settings[0].data.weekStartDay = body.weekStartDay;
        settings[0].data.autoAttendance = body.autoAttendance;
        settings[0].data.clockInEarly = body.clockInEarly;
        settings[0].data.clockInLate = body.clockInLate;
        settings[0].data.clockOutEarly = body.clockOutEarly;
        settings[0].data.clockOutLate = body.clockOutLate;
        const res = await this.commonRepository.save(settings[0]);
        return {
          default:false,
          settings:[{
            id: res.id,
            isAutoClockOutByShift: res.data.isAutoClockOutByShift,
            autoRequestSummary:res.data.autoRequestSummary,
            autoAttendance:res.data.autoAttendance,
            weekStartDay:res.data.weekStartDay,
            workingDays:res.data.workingDays,
            clockInEarly:res.data.clockInEarly,
            clockInLate:res.data.clockInLate,
            clockOutEarly:res.data.clockOutEarly,
            clockOutLate:res.data.clockOutLate,
            companyId:res.companyId
          }]
        }
      }
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }

  async postSummary(body: any){
    try {
      const company = await this.APIService.getCompanyById(body.companyId);
      if (!company) { throw new NotFoundException(`Company not found for companyId ${body.companyId}`); }
      const companyId = body.companyId
      const weekStartDate = body.weekStartDate
      const weekEndDate = body.weekEndDate
      const weeklyAttendance: HrmAttendance[] = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "companyId" = $1  AND date>= $2 AND date<=$3',[companyId,weekStartDate,weekEndDate]);
      const summary: HrmAttendanceSummary[] = await this.dataSource.query('SELECT * FROM hrm_attendance_summary WHERE "companyId" = $1 AND "weekStartDate" = $2 AND "weekEndDate" = $3',[companyId,weekStartDate,weekEndDate]);
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(`SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status" != 'Non Active'`,[companyId]);
      let array = []
      const employeeIds = employeeDetails.map((att) => att.employeeId);
      for(let i = 0; i < employeeIds.length; i++){
          const existingSummary = summary.find((sum) => sum.employeeId === employeeIds[i]);
          const completedAttendance = weeklyAttendance
            .filter((att) => att.employeeId === employeeIds[i])
            .map((att) => ({
              ...att,
              timeEntries: att.timeEntries.filter((entry) => entry.ongoing === false)
            }));
          if(existingSummary){
            const res = this.attendanceSummaryRepository.create({
              id: existingSummary.id,
              employeeId: employeeIds[i] as string,
              companyId: companyId,
              weekStartDate: weekStartDate,
              weekEndDate: weekEndDate,
              status: "pending",
              weeklySummary: completedAttendance
            })
            await this.attendanceSummaryRepository.save(res);
            array.push(res)
          }else{
            const res = this.attendanceSummaryRepository.create({
              employeeId: employeeIds[i],
              companyId: companyId,
              weekStartDate: weekStartDate,
              weekEndDate: weekEndDate,
              status: "pending",
              weeklySummary: completedAttendance,
              createdAt: new Date(),
              modifiedAt: new Date(),
            })
            await this.attendanceSummaryRepository.save(res);
            array.push(res)
          }
        
        
      }
      return array
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      
    }
  }

  async getSummary(weekStartDate: string, weekEndDate: string, companyId: string,id:string){
    try {
      if(id){
        const summary = await this.dataSource.query('SELECT * FROM hrm_attendance_summary WHERE "id" = $1 ',[id]);
        return summary;
      }
      const summary = await this.dataSource.query('SELECT * FROM hrm_attendance_summary WHERE "companyId" = $1 AND "weekStartDate" = $2 AND "weekEndDate" = $3',[companyId,weekStartDate,weekEndDate]);
      return summary;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }
  async updateSummary(body:any){
    try {
      const summary = await this.dataSource.query('SELECT * FROM hrm_attendance_summary WHERE "id" = $1 ',[body.id]).then((res) => res[0]);
      if (!summary) { throw new NotFoundException('Attendance Summary not found for id ' + body.id); }
      summary.status = body.status !== "" ? body.status : summary.status;
      summary.weeklySummary = body.weeklySummary;
      for(let i = 0; i < summary.weeklySummary.length; i++){
        let attendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE "id" = $1 ',[summary.weeklySummary[i].id]).then((res) => res[0]);
        if (!attendance) {
          attendance = this.attendanceRepository.create({
            id: summary.weeklySummary[i].id,
            employeeId: summary.employeeId,
            companyId: summary.companyId,
            date: summary.weeklySummary[i].date,
            isApproved: false,
            isOnline: false,
            locationType: summary.weeklySummary[i].locationType,
            location: summary.weeklySummary[i].location,
            timeEntries: summary.weeklySummary[i].timeEntries
          })
          await this.attendanceRepository.save(attendance);
        }
        if(body.status === 'approved'){
        attendance.isApproved = true;
        }else if(body.status === 'rejected'){
          attendance.isApproved = false;
        }
        attendance.timeEntries = summary.weeklySummary[i].timeEntries;
        const res = await this.attendanceRepository.save(attendance);
       
      }
      const res = await this.attendanceSummaryRepository.save(summary);
      return res;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }
   getTimeDuration(entries) {
    let totalDurationInMinutes = 0
    entries.forEach(entry => {
      const clockInDate = parse(entry.clockIn, 'HH:mm', new Date())
      const clockOutDate = parse(entry.clockOut, 'HH:mm', new Date())
      if(entry.ongoing){
        totalDurationInMinutes += 0
      }else{
        totalDurationInMinutes += differenceInMinutes(clockOutDate, clockInDate)
      }
      
    })

    const totalHours = Math.floor(totalDurationInMinutes / 60)
    const totalMinutes = totalDurationInMinutes % 60
    return `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`
  }

  async getReport(dateFrom: string, dateTo: string, companyId: string, type: string, employeeId: string, pdf: boolean) {
    
    const dataList = [
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
    
    try {
      let reportFormatted;
      const report = [];
      const holidays = await this.dataSource.query(`SELECT * FROM hrm_configs WHERE "companyId" = $1 AND "type" = $2 AND data->>'date' >= $3 
         AND data->>'date' <= $4`,
        [companyId, 'payroll_holiday', dateFrom, dateTo]
      )
      const company = await this.APIService.getCompanyById(companyId);
      if (!company) { throw new NotFoundException(`Company not found for companyId ${companyId}`); }
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query('SELECT * FROM hrm_employee_details WHERE "companyId"=$1',[companyId]);
      const payrollAwards = company.companyAccounts.hasOwnProperty('payrollAwards') ? company.companyAccounts.payrollAwards : false;
      const penaltyConfig = dataList
      const employeeIds = employeeDetails.flatMap(att => att.employeeId);
      const today = new Date().toISOString().split('T')[0];
      for (let k = 0; k < employeeIds.length; k++) {
        const rep = {
          employeeId: employeeIds[k],
          summary: []
        }
        let query = `SELECT * FROM hrm_attendance WHERE "companyId" = $1 AND "date" >= $2 AND "date" <= $3`;
        let queryParams = [companyId, dateFrom, dateTo];
        if (employeeId) {
          query += ` AND "employeeId" = $4`;
          queryParams.push(employeeId);
        }
        const attendance: HrmAttendance[] = await this.dataSource.query(query, queryParams);
        const dateArray = [... new Set(attendance.flatMap(att => att.date))].sort();
        if (type === 'award') {
          const awardId = employeeDetails.find(e => e.employeeId === employeeIds[k]).payrollEmployment.hasOwnProperty('employeeAward') ? 
                          employeeDetails.find(e => e.employeeId === employeeIds[k]).payrollEmployment.employeeAward : '';
          const penaltyList = penaltyConfig.find((item)=>item.awardId === awardId)?.penalties || []
          if (!penaltyList) {
            report.push(rep);
            continue;
          }
          for (let j = 0; j < dateArray.length; j++) {
            const employeeAttendance = attendance.filter(a => a.employeeId === employeeIds[k] && a.date === dateArray[j]);
            const summary = {
              date: dateArray[j],
              total: '0',
              timeEntries: []
            }
            const entries = employeeAttendance.flatMap((a) => 
              a.timeEntries.map(entry => ({
                ...entry,
                date: a.date,
                isOvertime: entry.isOvertime !== undefined ? entry.isOvertime : false
              }))
            ).filter(entry => entry.ongoing === false && entry.isBreak === false);
            if (payrollAwards) {     
              for (let i = 0; i < penaltyList.length; i++) {
                const penalty = penaltyList[i]
                
                if (penalty) {
                  // Initialize total minutes
                  let totalMinutes = 0;
                  
                  // Process each source entry
                  entries.forEach(entry => {
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
  
                    if (penalty.eligibleDays.includes('P') && !penalty.isOvertime && !entry.isOvertime && isPublicHoliday) {
                      
                      overlapMinutes = this.leaveManagementService.timeToMinutes(entry.clockOut) - this.leaveManagementService.timeToMinutes(entry.clockIn);
                      
                    }
                    if (penalty.eligibleDays.includes('P') && penalty.isOvertime && entry.isOvertime && isPublicHoliday ) {
                      overlapMinutes = this.leaveManagementService.timeToMinutes(entry.clockOut) - this.leaveManagementService.timeToMinutes(entry.clockIn);
                    }
                    
                    if (penalty.hasPeriod && penalty.from !== null && penalty.to !== null) {
                      // Convert times to minutes for easier comparison
                      const entryStartMinutes = this.leaveManagementService.timeToMinutes(entry.clockIn);
                      const entryEndMinutes = this.leaveManagementService.timeToMinutes(entry.clockOut);
                      const periodStartMinutes = this.leaveManagementService.timeToMinutes(penalty.from);
                      const periodEndMinutes = this.leaveManagementService.timeToMinutes(penalty.to);
                      
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
                      overlapMinutes = this.leaveManagementService.timeToMinutes(entry.clockOut) - this.leaveManagementService.timeToMinutes(entry.clockIn);
                    }
                    
                    // Apply hour limits if applicable for overtime entries
                    if (entry.isOvertime && !penalty.eligibleDays.includes('P') && penalty.hourLimit !== null && penalty.hourLimitType !== null) {
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
                  const amount = (totalMinutes / 60).toFixed(2);
                  const timeEntry = {
                    id: i,
                    awardPenalty: String(penaltyList[i].id),
                    amount: amount,
                  }
                  summary.total = (parseFloat(summary.total) + parseFloat(amount)).toFixed(2);
                  summary.timeEntries.push(timeEntry);
                   
                }
              }
            }
            else {
              const amount = (entries.reduce((total, entry) => {
                return total + differenceInMinutes(
                  parseISO(`${today}T${entry.clockOut}:00`), 
                  parseISO(`${today}T${entry.clockIn}:00`)
                );
              }, 0) / 60).toFixed(2);
              summary.total = amount;
            }
            rep.summary.push(summary);
          }
        }
        else {
          for (let j = 0; j < dateArray.length; j++) {
            const employeeAttendance = attendance.filter(a => a.employeeId === employeeIds[k] && a.date === dateArray[j]);
            const entries = employeeAttendance.flatMap((a) => 
              a.timeEntries.map(entry => ({
                ...entry,
                date: a.date,
                isOvertime: entry.isOvertime !== undefined ? entry.isOvertime : false
              }))
            ).filter(t => t.ongoing === false
            ).sort((a, b) => a.clockIn.localeCompare(b.clockIn));
            if (entries.length === 0) {
              continue;
            }
            const summary = {
              date: dateArray[j],
              startTime: entries[0].clockIn,
              endTime: entries[entries.length - 1].clockOut,
            }
            rep.summary.push(summary);
          }
        }
        report.push(rep);
      }
      if (pdf) {
        reportFormatted = { 
          companyAddress: company.address,
          companyName: company.companyName,
          companyLogo: await this.s3Service.getLogoLink(company.logoUrl),
          summary: []
        };
        for (let i = 0; i < report.length; i++) {
          const employee = employeeDetails.find((emp) => emp.employeeId === report[i].employeeId);
          const summary = {
            employee_id: employee.employeeId,
            employee_name: employee.fullName.first + ' ' + employee.fullName.last,
            role: employee.jobInformation.find((j) => j.active === true) ? employee.jobInformation.find((j) => j.active === true).jobTitle: '',
            department: employee.jobInformation.find((j) => j.active === true) ? employee.jobInformation.find((j) => j.active === true).department: '',
            logs: this.getWeekRangesBetweenDates(dateFrom, dateTo, type) 
          }
          for (let j = 0; j < report[i].summary.length; j++) {
            for (let k = 0; k < summary.logs.length; k++) {
              if (this.isDateInRange(summary.logs[k].week, report[i].summary[j].date)) {
                if (type === 'award') {
                  const awardId = employeeDetails.find(e => e.employeeId === report[i].employeeId).payrollEmployment.hasOwnProperty('employeeAward') ? 
                  employeeDetails.find(e => e.employeeId === report[i].employeeId).payrollEmployment.employeeAward : '';
                  const penaltyList = penaltyConfig.find((item)=>item.awardId === awardId)?.penalties || [];
                  for (let l = 0; l < penaltyList.length; l++) {
                    const penaltyEntries = report[i].summary[j].timeEntries.filter((entry) => entry.awardPenalty === (penaltyList[l].id).toString());
                    const amount = penaltyEntries.reduce((sum, entry) => { return sum + parseFloat(entry.amount);}, 0.00);
                    if (summary.logs[k].daily_log.hasOwnProperty(this.formatPenaltyName(penaltyList[l].name)) === false) {
                      summary.logs[k].daily_log[this.formatPenaltyName(penaltyList[l].name)] = [];
                    }
                    const entry = {
                      date: report[i].summary[j].date,
                      amount: amount.toFixed(2)
                    }
                    summary.logs[k].daily_log[this.formatPenaltyName(penaltyList[l].name)].push(entry);
                    summary['total_' + this.formatPenaltyName(penaltyList[l].name)] = summary.hasOwnProperty('total_' + this.formatPenaltyName(penaltyList[l].name)) ? 
                                                                (parseFloat(summary['total_' + this.formatPenaltyName(penaltyList[l].name)]) + amount).toFixed(2) : amount.toFixed(2);
                  }
                }
                else {
                  const dailyLog = {};
                  dailyLog['date'] = report[i].summary[j].date;
                  dailyLog['clock_in'] = report[i].summary[j].startTime;
                  dailyLog['clock_out'] = report[i].summary[j].endTime;
                  summary.logs[k].daily_log.push(dailyLog);
                }
              }
            }
          }
          reportFormatted.summary.push(summary);
        }
      }
      return { report: pdf ? reportFormatted : report, message: 'successfully retrieved attendance report' };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unknown error occurred');
    }
  }
  
  getWeekRangesBetweenDates(startDateStr, endDateStr, type) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    const weekOptions = { weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 };
    const firstWeekStart = startOfWeek(startDate, weekOptions);
    
    const weekRanges = [];
    let currentWeekStart = firstWeekStart;
    
    while (!isAfter(currentWeekStart, endDate)) {
      const weekEnd = endOfWeek(currentWeekStart, weekOptions);
      
      weekRanges.push({
        week: `${format(currentWeekStart, 'yyyy-MM-dd')} to ${format(weekEnd, 'yyyy-MM-dd')}`,
        daily_log: type === 'award' ? {} : []
      });
      
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    
    return weekRanges;
  };
  isDateInRange(range, dateStr) {
    // Extract start and end dates from the range string
    const [startStr, endStr] = range.split(' to ');
    
    // Parse all dates
    const startDate = parseISO(startStr);
    const endDate = parseISO(endStr);
    const checkDate = parseISO(dateStr);
    
    // Check if date is within range (inclusive of start and end dates)
    return (
      (isEqual(checkDate, startDate) || isAfter(checkDate, startDate)) && 
      (isEqual(checkDate, endDate) || isBefore(checkDate, endDate))
    );
  };
  formatPenaltyName(name) {
    // Get bracket content if it exists
    let bracketContent = '';
    const bracketMatch = name.match(/\(([^)]*)\)/);
    if (bracketMatch) {
      // Process bracket content to create a suffix
      bracketContent = bracketMatch[1]
        .toLowerCase()
        .replace(/\s+/g, '_');
    }
    
    // Format base name
    let formattedName = name
      .replace(/\([^)]*\)/g, '') // Remove brackets and their contents
      .trim();                    // Trim any leading/trailing whitespace
    
    // Handle hyphens
    formattedName = formattedName.replace(/\s*-\s*/g, '_');
    
    // Replace remaining spaces with underscores and convert to lowercase
    formattedName = formattedName.replace(/\s+/g, '_').toLowerCase();
    
    // Add back distinguishing information from brackets if needed
    if (bracketContent) {
      formattedName += '_' + bracketContent;
    }
    
    return formattedName;
  }

  async checkLocation(checkLocationDto: CheckLocationDto) {
    try {
      const { employeeId, lat, lng , type } = checkLocationDto;
      
  
      if (!lat || !lng) {
        throw new HttpException('Live lat/lng required in request', HttpStatus.BAD_REQUEST);
      }
  
      const employeeInfo = await this.employeeDetailsRepository.findOne({
        where: { employeeId },
      });
  
      if (!employeeInfo || !employeeInfo.attendanceSettings) {
        throw new HttpException('Employee attendance settings not found', HttpStatus.NOT_FOUND);
      }
  
      const workType = await this.attendanceRepository.findOne({
        where: { employeeId },
      });
  
      let address: string;
  
      const settings = employeeInfo.attendanceSettings;
     
  
      const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      if (
        settings.workPlace === 'Remote' ||
        (settings.workPlace === 'Hybrid' && type === 'remote')

        ) {
        const geo = settings.geoLocation?.trim();
          if(!geo){
            throw new HttpException('Remote location not specified', HttpStatus.BAD_REQUEST);
          }

          const [parsedLat, parsedLng] = geo.split(',').map(Number);
          const distance = this.getDistanceFromLatLonInMeters(parsedLat, parsedLng, lat, lng);
          const isWithinRange = distance <= 50;

          return { matched: isWithinRange, distanceInMeters: distance, defaultLocation: `${parsedLat}, ${parsedLng}` };
        //console.log('Remote address:', address);



      } else if 
      (settings.workPlace === 'Office' || 
      (settings.workPlace === 'Hybrid' && type === 'office' )
      ) {
        const officeName = settings.officeLocation;
        console.log('officeName',officeName)
        if (!officeName) {
          throw new HttpException('Office location not specified', HttpStatus.BAD_REQUEST);
        }

       

       /*  const location = await this.commonRepository.findOne({
          where: { type: 'location', companyId: employeeInfo.companyId },
        }); */
        const locations = await this.commonRepository.find({
          where: { type: 'location', companyId: employeeInfo.companyId },
        });
        
        const matchedLocation = locations.find(loc => loc.data?.name === officeName);

        let fullAddress = '';

        if (matchedLocation?.data) {
          const data = matchedLocation.data;

          fullAddress =
            `${data.streetOne ? data.streetOne + ', ' : ''}` +
            `${data.streetTwo ? data.streetTwo + ', ' : ''}` +
            `${data.city ? data.city + ', ' : ''}` +
            `${data.state ? data.state + ', ' : ''}` +
            `${data.zip ? data.zip + ', ' : ''}` +
            `${data.country ? data.country : ''}`; 
          
        }

        console.log('Office address:', fullAddress);


      const encodedAddress = encodeURIComponent(fullAddress);
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`
      );

      if (geoResponse.data.status !== 'OK') {
        throw new HttpException('Failed to resolve address to coordinates', HttpStatus.BAD_REQUEST);
      }

      const storedLat = geoResponse.data.results[0].geometry.location.lat;
      const storedLng = geoResponse.data.results[0].geometry.location.lng;

      const distance = this.getDistanceFromLatLonInMeters(storedLat, storedLng, lat, lng);
      const isWithinRange = distance <= 50;

      return { matched: isWithinRange, distanceInMeters: distance, defaultLocation: `${storedLat}, ${storedLng}` };
        

      }
  
      if (!address) {
        throw new HttpException('Unable to resolve address for geolocation', HttpStatus.BAD_REQUEST);
      }
  
      //console.log('Resolved address:', address);
  
    } catch (error) {
      console.error('Error checking location:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error checking location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  private getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log(distance)
    return distance; // in meters
  }

  async postAttendanceRequest(request: postAttendanceRequestDto, req: Request) {
    const employee: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status"!=$2',
        [request.employeeId,'Non Active'],
      ).then(res => res[0]);
    const company = await this.APIService.getCompanyById(employee.companyId);
    const savedRequest = await this.dataSource.getRepository(HrmAttendanceRequests).save(request);
    const employees: HrmEmployeeDetails[] = await this.dataSource.query(
      `SELECT * FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`,
      [employee.companyId],
    );
    const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1', [employee.companyId]);
    const ADMINACCESS = accessLevels.find((access) =>  access.accessLevelType === 'FULL_ADMIN');
    const eligibleIdList = employees.filter((emp) => emp.accessLevelId === ADMINACCESS.id).flatMap((emp) => emp.employeeId);
    await this.notificationService.addNotifications(
      'attendanceRequest',
      `${employee.fullName.first + ' ' + employee.fullName.last} is requesting for Attendance.`,
      savedRequest['id'],
      request.companyId,
      employee.employeeId,
      eligibleIdList
    );
    
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].accessLevelId === ADMINACCESS.id) {
        const params = { 
          $date$: request.date, 
          $employeeName$: employees[i].fullName.first + ' ' + employees[i].fullName.last, 
          $companyName$: company.companyName, 
          $day$: format(new Date(request.date), 'EEEE'),
          $startTime$: request.startTime,
          $endTime$: request.endTime,
          $domain$: process.env.DOMAIN,
          $companyLogo$: `${process.env.DOMAIN}/assets/romeohr_main.png`
        };
        const body = await timeLogTemplate('timeLogRequest', params)
        const emitBody = { sapCountType:'TimeLogRequest',companyId: employee.companyId, subjects: 'Time Log Request', email: employees[i].email.work, body};
        this.eventEmitter.emit('send.email', emitBody);
        console.log('sent email to ',employees[i].email.work);
      }
    }
    return {
      request: savedRequest,
      message: 'successfully saved attendance request'
    };
  }

  async putAttendanceRequest(attendanceRequestId: string, status: string, attendanceId: string) {
    const request: HrmAttendanceRequests = await this.dataSource.query('SELECT * FROM hrm_attendance_requests WHERE id = $1', [attendanceRequestId]).then(res => res[0]);
    request.status = status;
    const savedRequest = await this.dataSource.getRepository(HrmAttendanceRequests).save(request);
    await this.socketClient.sendNotificationRequest(savedRequest);
    const employee: HrmEmployeeDetails = await this.dataSource.query(
      `SELECT * FROM hrm_employee_details WHERE "employeeId" = $1`,
      [request.employeeId],
    ).then(res => res[0]);
    const company = await this.APIService.getCompanyById(employee.companyId);
    let type = "timeLogRejected";
    let sapCountType = 'TimeLogRejected';
    let subjects = 'Time Log Rejected';
    if (status === "APPROVED") {
      type = "timeLogApproved";
      sapCountType = 'TimeLogApproved';
      subjects = 'Time Log Approved';
      if (attendanceId) {
        const attendance: HrmAttendance = await this.dataSource.query('SELECT * FROM hrm_attendance WHERE id = $1', [attendanceId]).then(res => res[0]);
        if (!attendance) {
          throw new NotFoundException(`Attendance not found for id ${attendanceId}`);
        }
        attendance.timeEntries.push({
          clockIn: request.startTime,
          clockOut: request.endTime,
          ongoing: false,
          isOvertime: request.isOvertime,
          isBreak: false
        })
        await this.dataSource.getRepository(HrmAttendance).save(attendance);
      }
      else {
        const employeeId = request.employeeId;
        const date = request.date;
        const locationType = '';
        const location = '';
        const companyId = request.companyId;
        const isOnline = false
        const isApproved = false
        const timeEntries = [{
          id: 1,
          clockIn: request.startTime,
          clockOut: request.endTime,
          taskId:"",
          ongoing: false,
          isOvertime: request.isOvertime,
          isBreak: false
        }]
        const attendance = this.dataSource.getRepository(HrmAttendance).create({
          employeeId,
          date,
          isOnline,
          isApproved,
          locationType,
          location,
          timeEntries,
          companyId
        })
        await this.attendanceRepository.save(attendance);
      }
    }
    const params = { 
          $date$: request.date, 
          $employeeName$: employee.fullName.first + ' ' + employee.fullName.last, 
          $companyName$: company.companyName,
          $domain$: process.env.DOMAIN,
          $companyLogo$: `${process.env.DOMAIN}/assets/romeohr_main.png`
        };
    const body = await timeLogTemplate(type, params)
    const emitBody = { sapCountType, companyId: employee.companyId, subjects, email: employee.email.work, body};
    this.eventEmitter.emit('send.email', emitBody);
    console.log('sent email to ',employee.email.work);
    await this.notificationService.addNotifications(
      'alert',
      `Your Attendance Request has been ${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}.`,
      savedRequest['id'],
      savedRequest.companyId,
      request.employeeId
    );
    console.log('sent sms');
    return {
      request: savedRequest,
      message: 'successfully updated attendance request'
    };
  }

  async getAttendanceRequest(dateFrom:  string, dateTo: string, companyId: string,  status: string, employeeId?: string) {
    let paramNum = 3;
    const paramArray = [companyId, dateFrom, dateTo];
    let query = 'SELECT * FROM hrm_attendance_requests WHERE "companyId"=$1 AND "date" >= $2 AND "date" <= $3 ';
    if (employeeId) {
       paramNum ++;
       query = query + `AND "employeeId"=$${paramNum} `;
        paramArray.push(employeeId);
    }
    if (status) {
        paramNum ++;
        query = query + `AND "status"=$${paramNum} `;
        paramArray.push(status);
    }
    const response = await this.dataSource.query(query,paramArray);
    return {
      requests: response,
      message: 'successfully retrieved attendance requests'
    }
  }
}
