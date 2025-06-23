import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource,Repository,Between } from 'typeorm';
import { HrmRosterEmployees,HrmRosterPositions,HrmRosterSites,HrmRosterShifts,HrmRosterTemplates } from '@flows/allEntities/hrmRoster.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';
import { getRosterEmployeesDto, getRosterPositionsDto, getRosterSitesDto, HrmRosterEmployeesDto, HrmRosterPositionsDto, HrmRosterShiftsDto, HrmRosterSitesDto, HrmRosterTemplatesDto, updateRosterSitesDto } from '@flows/allDtos/hrmRoster.dto';
import { ConfigService } from '@nestjs/config';
import { timeout } from 'cron';
const axios = require('axios')
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Buffer } from 'buffer';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { S3Service } from '@flows/s3/service/service';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
@Injectable()
export class RosterService {
  private readonly API;
  constructor(
    @InjectRepository(HrmRosterEmployees) private rosterEmployeesRepository: Repository<HrmRosterEmployees>,
    @InjectRepository(HrmRosterSites) private rosterSitesRepository: Repository<HrmRosterSites>,
    @InjectRepository(HrmRosterPositions) private rosterPositionsRepository: Repository<HrmRosterPositions>,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmRosterShifts) private rosterShiftsRepository: Repository<HrmRosterShifts>,
    @InjectRepository(HrmRosterTemplates) private rosterTemplatesRepository: Repository<HrmRosterTemplates>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly configService: ConfigService,
    private notificationService: NotificationService,
     private eventEmitter: EventEmitter2,
     private s3Service: S3Service,
     private readonly APIService: APIService,

  ) {
    this.API = axios.create({
      baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
    })
  }

  async addEmployeeToRoster(req, params){
    try {
      const employeeIds = req.body.employeeIds;
      const site = req.body.siteId;
      const position = req.body.positionId;
      const siteInfo = await this.dataSource.query('SELECT * FROM hrm_roster_sites WHERE "id" = $1', [site]).then((res) => res[0]);
      const positionInfo = await this.dataSource.query('SELECT * FROM hrm_roster_positions WHERE "id" = $1', [position]).then((res) => res[0]);
      

      let response: HrmRosterEmployees[] = [];
      for (let i = 0; i < employeeIds.length; i++) {
        const employeeId = employeeIds[i];
        const rosterEmployee = new HrmRosterEmployees();
        rosterEmployee.employeeId = employeeId;
        rosterEmployee.sites =[{id: siteInfo.id ,siteId:siteInfo.siteId, name: siteInfo.name, default: true}] ;
        rosterEmployee.positions = [{id: positionInfo.id, positionId: positionInfo.positionId, name: positionInfo.name,color:positionInfo.color, default: true}];
        rosterEmployee.companyId = req.body.companyId;
        const res = await this.rosterEmployeesRepository.save(rosterEmployee);
        response.push(res);
      }
      return {
        message: 'Employee added to roster successfully',
        rosterEmployees: response,
      }
      
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRosterEmployees(companyId: string){
    try {   
      const employees = await this.dataSource.query('SELECT r.*,e."weeklyHourLimit" FROM hrm_roster_employees r JOIN hrm_employee_details e ON r."employeeId"= e."employeeId" WHERE r."companyId" = $1', [companyId]);
      return {
        message: 'Roster employees fetched successfully',
        rosterEmployees: employees,
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRosterEmployee(req){
    try {
    
      const sites = req.body.sites;
      const positions = req.body.positions;
      const employee = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "id" = $1', [req.body.id]).then((res) => res[0]);
      
      if (!employee) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }

      employee.sites = sites;
      employee.positions = positions;
      if(req.body.hasOwnProperty('active')){
        employee.active = req.body.active;
      }
      const res: HrmRosterEmployees = await this.rosterEmployeesRepository.save(employee);
      return {
        message: 'Employee roster updated successfully',
        rosterEmployee: res,
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteRosterEmployee(id){
    try {
      const res:HrmRosterEmployeesDto = await this.dataSource.query('DELETE FROM hrm_roster_employees WHERE "id" = $1', [id]);
      return {
        message: 'Employee deleted successfully',
        rosterEmployee: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  async checkEmployeeInactivity(id){
    try {
      const employee: HrmRosterEmployeesDto = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "id" = $1', [id]).then((res) => res[0]);
      if (!employee) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }
      const shifts: HrmRosterShiftsDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "employeeId" = $1', [employee.employeeId]);
      const templates: HrmRosterTemplatesDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "shifts" @> $1', [`[{"employeeId": "${employee.employeeId}"}]`]);
     
      const shiftTemplates = templates.map((item) => {
        return {id: item.id, name: item.name}
      });
      
      const shiftsToRemove = shifts.filter((item) => {
        if (item.date >= new Date().toISOString()) {
          return item.date;
        }
      });
     
      const shiftSitesToRemove = employee.sites
      const shiftPositionsToRemove = employee.positions
      const shiftTemplatesToRemove = shiftTemplates;

      const canInactivate = shiftsToRemove.length === 0 && shiftSitesToRemove.length === 0 && shiftPositionsToRemove.length === 0 && shiftTemplatesToRemove.length === 0;
      if (!canInactivate) {
        return {
          message: 'Employee cannot be inactivated',
          canInactivate: false,
          shiftsToRemove,
          shiftSitesToRemove,
          shiftPositionsToRemove,
          shiftTemplatesToRemove,
        }
      }
      return {
        message: 'Employee can be inactivated',
        canInactivate: true,
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addSite(req){
    try {

      const site = new HrmRosterSites();
      site.name = req.body.name;
      site.siteId = req.body.siteId;
      site.phone = req.body.phone;
      site.address = req.body.address;
      site.companyId = req.body.companyId;
      site.breaks = req.body.hasOwnProperty('breaks') ? req.body.breaks : [];
      const res = await this.rosterSitesRepository.save(site);
        let selectedEmployees: HrmRosterEmployeesDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "employeeId" = ANY($1)', [req.body.employeeIds]);
        for (let i = 0; i < selectedEmployees.length; i++) {
          selectedEmployees[i].sites.push({id: res.id,siteId:res.siteId, name: res.name, default: false});
        }
        await this.rosterEmployeesRepository.save(selectedEmployees);
      
      return {
        message: 'Site added successfully',
        rosterSite: {...res, employeeIds: req.body.employeeIds},
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRosterSites(companyId: string){
    try {
      const query = `
      SELECT
      s.*,
      COALESCE(JSONB_AGG(e.id) FILTER (WHERE e.id IS NOT NULL), '[]') AS "employeeIds"
  FROM
      hrm_roster_sites s
  LEFT JOIN LATERAL (
      SELECT e."employeeId" AS id
      FROM hrm_roster_employees e,
      LATERAL jsonb_array_elements(e.sites) AS site_obj
      WHERE e."companyId" = $1
      AND (site_obj->>'id')::UUID = s.id
  ) AS e ON true
  WHERE s."companyId" = $1
  GROUP BY s.id, s.name;
`;
      const sites: getRosterSitesDto[] = await this.dataSource.query(query, [companyId]);

    
      return {
        message: 'Roster sites fetched successfully',
        rosterSites: sites,
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRosterSite(req){
    try {
      const site = await this.dataSource.query('SELECT * FROM hrm_roster_sites WHERE "id" = $1', [req.body.id]).then((res) => res[0]);
      if (!site) {
        throw new HttpException('Site not found', HttpStatus.NOT_FOUND);
      }
      
      if (req.body.employeeIds) {
        
        const currentEmployees = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "sites" @> $1::jsonb',[`[{"id": "${site.id}"}]`]);
        const removedEmployees = currentEmployees.filter((item) => !req.body.employeeIds.includes(item.employeeId));
        console.log(currentEmployees);
        for (let i = 0; i < removedEmployees.length; i++) {
          removedEmployees[i].sites = removedEmployees[i].sites.filter((item) => item.id !== site.id);
          await this.rosterEmployeesRepository.save(removedEmployees[i]);
        }
        
        const selectedEmployees = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "employeeId" = ANY($1)',[req.body.employeeIds]);
        const newEmployees = selectedEmployees.filter((item) => !currentEmployees.map((item) => item.employeeId).includes(item.employeeId));
        for (let i = 0; i < newEmployees.length; i++) {
          const employee = newEmployees[i];
          const siteExists = employee.sites.some  (
            (s) => s.id === site.id
          );
          if (!siteExists) {
            employee.sites.push({
              id: site.id,
              siteId: site.siteId,
              name: site.name,
              default: false
            });
            await this.rosterEmployeesRepository.save(employee);
          }

        
        }
      }
      if (req.body.hasOwnProperty('active')) {
        site.active = req.body.active;
      }
      site.name = req.body.name;
      site.locationId = req.body.locationId;
      site.phone = req.body.phone;
      site.address = req.body.address;
      site.companyId = req.body.companyId;
      site.employeeIds = req.body.employeeIds;
      site.breaks = req.body.breaks;

      const res: updateRosterSitesDto = await this.rosterSitesRepository.save(site);
      
      return {
        message: 'Site updated successfully',
        rosterSite: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteRosterSite(id){
    try {
      const res: HrmRosterSitesDto = await this.dataSource.query('DELETE FROM hrm_roster_sites WHERE "id" = $1', [id]);
      console.log(id,res);
      return {
        message: 'Site deleted successfully',
        rosterSite: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkSiteInactivity(id){
    try {
      const site = await this.dataSource.query('SELECT * FROM hrm_roster_sites WHERE "id" = $1', [id]).then((res) => res[0]);
      if (!site) {
        throw new HttpException('Site not found', HttpStatus.NOT_FOUND);
      }
      const shifts: HrmRosterShiftsDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "site" @> $1', [`{"siteId": "${site.id}"}`]);
      const employees: HrmRosterEmployeesDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "sites" @> $1', [`[{"id": "${site.id}"}]`]);
      const templates: HrmRosterTemplatesDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "shifts" @> $1', [`[{"siteId": "${site.id}"}]`]);
      
      const shiftToRemove = shifts.filter((item) => {
        if (item.date >= new Date().toISOString()) {
          return item.date;
        }
      });

      const canInactivate = shiftToRemove.length === 0 && templates.length === 0 && employees.length === 0;
      if (!canInactivate) {
        return {
          message: 'Site cannot be inactivated',
          canInactivate: false,
          shifts:shiftToRemove,
          employees,
          templates,
        }
      }
      return {
        message: 'Site can be inactivated',
        canInactivate: true,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

 

  async addPosition(req){
    try {
      const position = new HrmRosterPositions();
      position.name = req.body.name;
      position.positionId = req.body.positionId;
      position.description = req.body.description;
      position.companyId = req.body.companyId;
      const res: HrmRosterPositionsDto = await this.rosterPositionsRepository.save(position);
      const selectedEmployees = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "employeeId" = ANY($1)', [req.body.employeeIds]);
      for (let i = 0; i < selectedEmployees.length; i++) {
        selectedEmployees[i].positions.push({id: res.id, positionId: res.positionId, name: res.name, default: false});
        await this.rosterEmployeesRepository.save(selectedEmployees[i]);
      }
      const employeeIds: string[] = req.body.employeeIds;
      return {
        message: 'Position added successfully',
        rosterPosition: {...res, employeeIds: employeeIds}
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRosterPositions(companyId: string){
    try {
     
          const query = `
      SELECT
          p.*,
          COALESCE(JSONB_AGG(e.id) FILTER (WHERE e.id IS NOT NULL), '[]') AS "employeeIds"
      FROM
        hrm_roster_positions p
      LEFT JOIN LATERAL (
        SELECT e."employeeId" AS id
        FROM hrm_roster_employees e,
        LATERAL jsonb_array_elements(e.positions) AS position_obj
        WHERE e."companyId" = $1
        AND (position_obj->>'id')::UUID = p.id
      ) AS e ON true
      WHERE p."companyId" = $1
      GROUP BY p.id, p.name;
    `;
      const positions: getRosterPositionsDto[] = await this.dataSource.query(query, [companyId]);    

      return {
        message: 'Roster positions fetched successfully',
        rosterPositions: positions,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRosterPosition(req){
    try {
      const position = await this.dataSource.query('SELECT * FROM hrm_roster_positions WHERE "id" = $1', [req.body.id]).then((res) => res[0]);
      
      if (!position) {
        throw new HttpException('Position not found', HttpStatus.NOT_FOUND);
      }
      if (req.body.employeeIds) {
        const positionIdJson = JSON.stringify({ id: position.id });
        const currentEmployees = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "positions" @> $1::jsonb',[`[{"id": "${position.id}"}]`]);
        const removedEmployees = currentEmployees.filter((item) => !req.body.employeeIds.includes(item.employeeId));
        for (let i = 0; i < removedEmployees.length; i++) {
          removedEmployees[i].positions = removedEmployees[i].positions.filter((item) => item.id !== position.id);
          await this.rosterEmployeesRepository.save(removedEmployees[i]);
        }
        const selectedEmployees = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "employeeId" = ANY($1)',[req.body.employeeIds]);
        const newEmployees = selectedEmployees.filter((item) => !currentEmployees.map((item) => item.employeeId).includes(item.employeeId));

        for (let i = 0; i < newEmployees.length; i++) {
          const employee = newEmployees[i];
          const positionExists = employee.positions.some  (
            (p) => p.id === position.id
          );
          if (!positionExists) {
            employee.positions.push({
              id: position.id,
              positionId: position.positionId,
              name: position.name,
              color: position.color,
              default: false
            });
            await this.rosterEmployeesRepository.save(employee);
          }
         }
      }
      if (req.body.hasOwnProperty('active')) {
        position.active = req.body.active;
      }

      position.name = req.body.name;
      position.companyId = req.body.companyId;
      position.employeeIds = req.body.employeeIds;
      position.positionId = req.body.positionId;
      position.description = req.body.description;
      const res: HrmRosterPositions = await this.rosterPositionsRepository.save(position);
     
      return {
        message: 'Position updated successfully',
        rosterPosition: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteRosterPosition(id){
    try {
      const res: HrmRosterPositionsDto[] =   await this.dataSource.query('DELETE FROM hrm_roster_positions WHERE "id" = $1', [id]);
      return {
        message: 'Position deleted successfully',
        rosterPosition: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkPositionInactivity(id){
    try {
      const position = await this.dataSource.query('SELECT * FROM hrm_roster_positions WHERE "id" = $1', [id]).then((res) => res[0]);
      if (!position) {
        throw new HttpException('Position not found', HttpStatus.NOT_FOUND);
      }
      
      const shifts: HrmRosterShifts[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "position" @> $1', [`{"positionId": "${position.positionId}"}`]);
      const employees: HrmRosterEmployees[] = await this.dataSource.query('SELECT * FROM hrm_roster_employees WHERE "positions" @> $1', [`[{"id": "${position.id}"}]`]);
      const templates: HrmRosterTemplates[] = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "shifts" @> $1', [`[{"id": "${position.id}"}]`]);
      const shiftToRemove = shifts.filter((item) => {
        if (item.date >= new Date().toISOString()) {
          return item.date;
        }
      });

      const canInactivate = shiftToRemove.length === 0 && templates.length === 0 && employees.length === 0;
      if (!canInactivate) {
        return {
          message: 'Position cannot be inactivated',
          canInactivate: false,
          shifts:shiftToRemove,
          employees,
          templates,
        }
      }
      return {
        message: 'Position can be inactivated',
        canInactivate: true,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async addRosterShift(req){
    try {
      const shift = new HrmRosterShifts();
      shift.date = req.body.date;
      shift.site = req.body.site;
      shift.startTime = req.body.startTime;
      shift.endTime = req.body.endTime;
      shift.notes = req.body.notes;
      shift.allDay = req.body.allDay;
      shift.companyId = req.body.companyId;
      shift.active = req.body.active;
      shift.color = req.body.color;
      shift.breaks = req.body.hasOwnProperty('breaks') ? req.body.breaks : [];
      shift.isOvertime = req.body.hasOwnProperty('isOvertime') ? req.body.isOvertime : false;
      const site = await this.dataSource.query('SELECT * FROM hrm_roster_sites WHERE "id" = $1', [req.body.siteId]).then((res) => res[0]);
      const position = await this.dataSource.query('SELECT * FROM hrm_roster_positions WHERE "id" = $1', [req.body.positionId]).then((res) => res[0]);
      shift.site = {siteId: site.id, siteName: site.name};
      shift.position = {positionId: position.id, positionName: position.name};

      let resposes: HrmRosterShiftsDto[] = [];
      if(req.body.employeeIds.length){ 

        for (let i = 0; i < req.body.employeeIds.length; i++) {
          const shift = new HrmRosterShifts();
          shift.employeeId = req.body.employeeIds[i];
          shift.date = req.body.date;
          shift.site = { siteId: site.id, siteName: site.name };
          shift.position = { positionId: position.id, positionName: position.name };
          shift.startTime = req.body.startTime;
          shift.endTime = req.body.endTime;
          shift.notes = req.body.notes;
          shift.allDay = req.body.allDay;
          shift.companyId = req.body.companyId;
          shift.active = req.body.active;
          shift.color = req.body.color;
          shift.breaks = req.body.hasOwnProperty('breaks') ? req.body.breaks : [];
          shift.isOvertime = req.body.hasOwnProperty('isOvertime') ? req.body.isOvertime : false;
          const res = await this.rosterShiftsRepository.save(shift);
          resposes.push(res);
        }
      }
     
      const employeeDetails = await this.employeeDetailsRepository.query(
        `
        SELECT 
          "employeeId",
          "fullName" ->> 'first' AS "firstName",
          "email" ->> 'work' AS "workEmail"
        FROM "hrm_employee_details"
        WHERE "employeeId" = ANY($1)
          AND "email" ->> 'work' IS NOT NULL
        `,
        [req.body.employeeIds]
      );


    const shiftDate = new Date(req.body.date);
    const dayOfWeek = shiftDate.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

    const weekStart = new Date(shiftDate);
    weekStart.setDate(shiftDate.getDate() + diffToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartDate = weekStart.toISOString().split('T')[0];
    const weekEndDate = weekEnd.toISOString().split('T')[0];

    const companyId = shift.companyId;
    const company = await this.APIService.getCompanyById(companyId);
    const day = shiftDate.toLocaleDateString('en-US', { weekday: 'long' });
    //console.log(day)
    const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`;

  
    for (const emp of employeeDetails) {
      const employeeName = emp.firstName;
      const workEmail = emp.workEmail;

      const shiftBody = await this.shfiftAssignEmailTemplate(
        employeeName,
        weekStartDate,
        weekEndDate,
        company.companyName,
        day,
        shift.date,
        shift.startTime,
        shift.endTime,
        process.env.DOMAIN,
        companyLogo,
        shift.date
      );

      const emitBody = {
        sapCountType: 'shiftAssigned',
        companyId,
        subjects: 'Shift Assigned',
        email: [workEmail],
        body: shiftBody
      };

      console.log(`Sending email to: ${workEmail}`);
      this.eventEmitter.emit('send.email', emitBody);
}

      
      return {
        message: 'Shifts added successfully',
        rosterShifts: resposes,
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRosterShifts(companyId: string,employeeId:string, timePeriod: string, startDate: string, endDate: string){
    try {
     if(employeeId){
      const shifts: HrmRosterShiftsDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "companyId" = $1 AND "employeeId" = $2', [companyId,employeeId]);
      return {
        message: 'Roster shifts fetched successfully',
        rosterShifts: shifts,
      }
     }
      const shifts: HrmRosterShiftsDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "companyId" = $1 AND "date" BETWEEN $2 AND $3', [companyId, startDate, endDate]);
      return {
        message: 'Roster shifts fetched successfully',
        rosterShifts: shifts,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRosterShiftEmailTemplate(
    name: string,
    Shift_Opened_Date: string,
    companyName: string,
    Day: string,
    Date: string,
    Starting_Time:string,
    Ending_Time:string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      selfAccessGranted: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Updated Shift: Time Changed</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Please note that the shift time for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Shift_Opened_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span> has been updated.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Updated Shift</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$Day$, $Date$ from $Starting_Time$ to $Ending_Time$</h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48" style="width:100%;"><tr><td class="t47" style="overflow:hidden;background-color:#ADBAFF;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:11px;padding:0 15px 0 15px;border-radius:40px 40px 40px 40px;"><a class="t46" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:9px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#433869;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">View</a></td></tr></table>
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:47px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["selfAccessGranted"];
   
    const replacements = {
      "$name$": name,
      "$Shift_Opened_Date$":Shift_Opened_Date,
      "$Company_Name$": companyName,
      "$Day$": Day,
      "$Date$": Date,
      "$Starting_Time$":Starting_Time,
      "$Ending_Time$":Ending_Time,
      "$domain$":domain,
      "$companyLogo$":companyLogo,
     
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }

  async updateRosterShift(req){
    try {
      const shift: HrmRosterShiftsDto = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "id" = $1', [req.body.id]).then((res) => res[0]);
      if (!shift) {
        throw new HttpException('Shift not found', HttpStatus.NOT_FOUND);
      }
      shift.date = req.body.date;
      shift.site = req.body.site;
      shift.position = req.body.position;
      shift.startTime = req.body.startTime;
      shift.endTime = req.body.endTime;
      shift.notes = req.body.notes;
      shift.active = req.body.active;
      shift.breaks = req.body.hasOwnProperty('breaks') ? req.body.breaks : shift.breaks;

      const res = await this.rosterShiftsRepository.save(shift);

      await this.notificationService.addNotifications(
        'Rostershift',
        `Your roster shift has been updated. You are now assigned to shift on ${res.date} at ${res.site}, from ${res.startTime} to ${res.endTime}.`,
        res.id,
        res.companyId,
        res.employeeId,
        [res.employeeId]
      );
      const getemployeeDetails = await this.employeeDetailsRepository.query(
        `
        SELECT 
            "fullName" ->> 'first' AS "firstName",
             "email" ->> 'work' AS "workEmail"
        FROM "hrm_employee_details"
        WHERE "employeeId" = $1
        `,
        [res.employeeId]
      );
      ;
      const workEmail = getemployeeDetails[0]?.workEmail;
      const employeeName = getemployeeDetails[0]?.firstName;
    
      const companyId = res.companyId
      const company = await this.APIService.getCompanyById(companyId);
      const dateObj = new Date(res.date); 
      const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); 
      const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`
      console.log(workEmail)
      //console.log('employeeName',employeeName,'date',res.date,'company.companyName',company.companyName,res.date,'day',day, res.startTime,res.endTime)
      const shiftUpdatdBody = await this.updateRosterShiftEmailTemplate(employeeName,res.date,company.companyName,day,res.date,res.startTime,res.endTime,process.env.DOMAIN,companyLogo);
      const emitBody = { sapCountType:'Rostershift',companyId, subjects: 'Roster Shift Update', email: workEmail, body: shiftUpdatdBody,};

      console.log("before calling update Roster shift")
      this.eventEmitter.emit('send.email', emitBody);
      console.log("after calling update Roster shift")
      return {
        message: 'Shift updated successfully',
        rosterShift: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteRosterShift(id){
    try {
      const res: HrmRosterShiftsDto =   await this.dataSource.query('DELETE FROM hrm_roster_shifts WHERE "id" = $1', [id]);
      return {
        message: 'Shift deleted successfully',
        rosterShift: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  async addRosterTemplate(req){
    try {
      const template = new HrmRosterTemplates();
      template.name = req.body.name;
      template.description = req.body.description;
      template.shifts = req.body.shifts;
      template.companyId = req.body.companyId;
      template.active = req.body.active;
      const res = await this.rosterTemplatesRepository.save(template);
      return {
        message: 'Template added successfully',
        rosterTemplate: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRosterTemplates(companyId: string, id: string){
    try {
      if (id) {
        const template:HrmRosterTemplatesDto = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "id" = $1', [id]).then((res) => res[0]);
        return {
          message: 'Roster template fetched successfully',
          rosterTemplate: template,
        }
      }
      const templates:HrmRosterTemplatesDto[] = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "companyId" = $1', [companyId]);
      return {
        message: 'Roster templates fetched successfully',
        rosterTemplates: templates,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRosterTemplate(req){
    try {
      const template:HrmRosterTemplates = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "id" = $1', [req.body.id]).then((res) => res[0]);
      if (!template) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }
      template.name = req.body.name;
      template.description = req.body.description;
      template.shifts = req.body.shifts;
      template.active = req.body.active;
      const res = await this.rosterTemplatesRepository.save(template);
      return {
        message: 'Template updated successfully',
        rosterTemplate: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteRosterTemplate(id){
    try {
      const res:HrmRosterTemplates[] =   await this.dataSource.query('DELETE FROM hrm_roster_templates WHERE "id" = $1', [id]);
      return {
        message: 'Template deleted successfully',
        rosterTemplate: res,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
   
  async importTemplate(req) {
    try {
      const { method, templateId, startDate, endDate, companyId } = req.body;
      let templateData;
  
      if (method === 'direct') {

        templateData = await this.dataSource.query('SELECT * FROM hrm_roster_templates WHERE "id" = $1', [templateId])
          .then((res) => res[0]);
  
      
        if (!templateData) {
          throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
        }
  
        
        if (!templateData.shifts) {
          templateData.shifts = await this.dataSource.query('SELECT * FROM hrm_roster_shifts WHERE "templateId" = $1', [templateId]);
        }
      } else if (method === 'manual') {

        templateData = req.body.template;
      } else {
        throw new HttpException('Invalid method', HttpStatus.BAD_REQUEST);
      }

      const sites = await this.dataSource.query('SELECT * FROM hrm_roster_sites WHERE "companyId" = $1', [companyId]);
      const positions = await this.dataSource.query('SELECT * FROM hrm_roster_positions WHERE "companyId" = $1', [companyId]);
  
      const dateRange = [];
      let currentDate = parseISO(startDate);
      while (currentDate <= parseISO(endDate)) {
        dateRange.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }
      
      let response = [];
      for (let i = 0; i < dateRange.length; i++) {
        const date = dateRange[i];
        const day = date.getDay();
        

        const dayShifts = templateData.shifts.filter(
          (shift) => parseInt(shift.day) === day /* ((day + 1) % 7) */
        );
  
        for (let j = 0; j < dayShifts.length; j++) {
          const shift = dayShifts[j];
          const rosterShift = new HrmRosterShifts();
          rosterShift.date = format(date, 'yyyy-MM-dd');
  
          const site = sites.find((s) => s.id === shift.siteId);
          rosterShift.site = { siteId: site.id, siteName: site.name };
  
          const position = positions.find((p) => p.id === shift.positionId);
          rosterShift.position = {
            positionId: position.id,
            positionName: position.name
          };
  
          rosterShift.startTime = shift.startTime;
          rosterShift.endTime = shift.endTime;
          rosterShift.notes = shift.notes || '';
          rosterShift.color = shift.color;
          rosterShift.employeeId = shift.employeeId;
          rosterShift.companyId = shift.companyId;
          rosterShift.breaks = shift.hasOwnProperty('breaks') ? shift.breaks:[]
          rosterShift.isOvertime = shift.hasOwnProperty('isOvertime') ? shift.isOvertime : false;
          //rosterShift.allDay = shift.allDay || false;
  
          const res = await this.rosterShiftsRepository.save(rosterShift);
          response.push(res);
        }
      }
  
      return { message: 'Template imported successfully', shifts: response };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  getDateFromWeekdayNumber(startDate: string, endDate: string, weekdayNumber: number): Date {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
  
    if (weekdayNumber < 0 || weekdayNumber > 6) {
      throw new Error('Weekday number is out of range');
    }
    
    let currentDate = start;
    while (currentDate.getDay() !== weekdayNumber) {
      currentDate = addDays(currentDate, 1);
    }
  
    if (isWithinInterval(currentDate, { start, end })) {
      return currentDate;
    } else {
      
      throw new Error('No matching weekday found in the given range');
    }
  }
  

  async  generateRoster(req){
    try {
       console.log(req.body);

       const response = await this.API.post('/roster/description', req.body, {timeout: 600000});
        console.log(response.data);
        return response.data
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
 
  

    
  async getScheduleData(companyId: string, startDate: string, endDate: string): Promise<ScheduleDataItem[]> {
    const shifts = await this.rosterShiftsRepository.find({
      where: {
        companyId,
        active: true,
        date: Between(startDate, endDate),
      },
    });

  
    
    const siteIds = [...new Set(shifts.map(shift => shift.site.siteId))];
   
    const positionIds = [...new Set(shifts.map(shift => shift.position.positionId))];
    console.log(positionIds);
    const employeeIds = [...new Set(shifts.map(shift => shift.employeeId))];
    const employees = await this.employeeDetailsRepository.findByIds(employeeIds);
    const sites = await this.rosterSitesRepository.findByIds(siteIds);
    const positions = await this.rosterPositionsRepository.findByIds(positionIds);
  
    return shifts.map(shift => {
      const site = sites.find(s => s.id === shift.site.siteId);
      const position = positions.find(p => p.id === shift.position.positionId);
     
      const employee = employees.find(emp => emp.employeeId === shift.employeeId);
      const employeeFullName = employee
        ? `${employee.fullName?.first || ''} ${employee.fullName?.middle || ''} ${employee.fullName?.last || ''}`.trim()
        : 'Unknown';
     
      return {
        site_name:  site?.name ,
        employee_name: employeeFullName,
        date: shift.date,
        shift_start: shift.startTime,
        shift_end: shift.endTime,
      } ;
    });
  }
  
  async generateExcelFile(scheduleData: ScheduleDataItem[]): Promise<Uint8Array> {
    if (!scheduleData || scheduleData.length === 0) {
      throw new HttpException('No schedule data found for the provided criteria.', HttpStatus.NOT_FOUND);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    // Group data by site_name
    const groupedData = scheduleData.reduce((acc, curr) => {
      if (!acc[curr.site_name]) {
        acc[curr.site_name] = [];
      }
      acc[curr.site_name].push(curr);
      return acc;
    }, {} as GroupedScheduleData);

    const dates = [...new Set(scheduleData.map(item => item.date))].sort();
    let rowIndex = 1;

    for (const [siteName, siteData] of Object.entries(groupedData)) {
      // Add site name header
      const siteNameCell = worksheet.getCell(`A${rowIndex}`);
      siteNameCell.value = siteName as ExcelJS.CellValue;
      siteNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4EBA53' },
      };
      siteNameCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Include Total column in merge
      worksheet.mergeCells(`A${rowIndex}:${String.fromCharCode(66 + dates.length)}${rowIndex}`);
      rowIndex++;

      // Add column headers
      worksheet.getCell(`A${rowIndex}`).value = 'Name' as ExcelJS.CellValue;
      const nameHeaderCell = worksheet.getCell(`A${rowIndex}`);
      nameHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB7A9CF' },
      };
      
      
      nameHeaderCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      dates.forEach((date, index) => {
        const cell = worksheet.getCell(`${String.fromCharCode(66 + index)}${rowIndex}`);
        cell.value = date as ExcelJS.CellValue;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFB7A9CF' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Add Total Hours header
      const totalHeaderCell = worksheet.getCell(`${String.fromCharCode(66 + dates.length)}${rowIndex}`);
      totalHeaderCell.value = 'Total Hours' as ExcelJS.CellValue;
      totalHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB7A9CF' },
      };
      totalHeaderCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      rowIndex++;

      const employees = [...new Set(siteData.map(item => item.employee_name))].sort();

      employees.forEach(employee => {
        const nameCell = worksheet.getCell(`A${rowIndex}`);
        nameCell.value = employee as ExcelJS.CellValue;
        /* nameCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFB7A9CF' }, 
        }; */
        
        nameCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        let totalHours = 0;

        dates.forEach((date, index) => {
          const shifts = siteData.filter(
            item => item.employee_name === employee && item.date === date,
          );

          const cell = worksheet.getCell(`${String.fromCharCode(66 + index)}${rowIndex}`);

          if (shifts && shifts.length > 0) {
            const shiftString = shifts
              .map(shift => `${shift.shift_start} - ${shift.shift_end}`)
              .join(' / ');
            cell.value = shiftString as ExcelJS.CellValue;
            cell.alignment = { vertical: 'top', wrapText: true };

            // Calculate total hours for each shift
            shifts.forEach(shift => {
              totalHours += calculateShiftHours(shift.shift_start, shift.shift_end);
            });
          } else {
            cell.value = '' as ExcelJS.CellValue;
          }

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // total hours cell
        const totalCell = worksheet.getCell(`${String.fromCharCode(66 + dates.length)}${rowIndex}`);
        totalCell.value = formatTotalHours(totalHours) as ExcelJS.CellValue;
        totalCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        totalCell.fill = {
          type: 'pattern',
          pattern: 'none',
          
        };

        const maxShifts = Math.max(
          ...dates.map(
            date =>
              siteData.filter(item => item.employee_name === employee && item.date === date)
                .length,
          ),
        );
        worksheet.getRow(rowIndex).height = Math.max(20, 15 * maxShifts);

        rowIndex++;
      });

      rowIndex++;
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
  
  async exportSchedule(companyId: string, startDate: string, endDate: string): Promise<ExcelExportResult> {
    try {
      const scheduleData = await this.getScheduleData(companyId, startDate, endDate);
      const excelBuffer = await this.generateExcelFile(scheduleData);
        
      return {
        buffer: excelBuffer,
        filename: 'schedule.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while exporting the schedule.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async shfiftAssignEmailTemplate(
    name: string,
    Week_Start_Date: string,
    Week_End_Date:string,
    companyName: string,
    Day: string,
    Date: string,
    Starting_Time:string,
    Ending_Time:string,
    domain:string,
    companyLogo:string,
    Shift_Opened_Date:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      shiftAssign: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Shift Assigned: on $Shift_Opened_Date$</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Good news! You’ve been assigned a shift for the week of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Week_Start_Date$ to $Week_End_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span>.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Assigned Shift Details</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$Day$, $Date$ from $Starting_Time$ to $Ending_Time$</h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48" style="width:100%;"><tr><td class="t47" style="overflow:hidden;background-color:#ADBAFF;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:11px;padding:0 15px 0 15px;border-radius:40px 40px 40px 40px;"><a class="t46" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:9px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#433869;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">View</a></td></tr></table>
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:47px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["shiftAssign"];
   
    const replacements = {
      "$name$": name,
      "$Week_Start_Date$":Week_Start_Date,
      "$Week_End_Date$":Week_End_Date,
      "$Company_Name$": companyName,
      "$Day$": Day,
      "$Date$": Date,
      "$Starting_Time$":Starting_Time,
      "$Ending_Time$":Ending_Time,
      "$domain$":domain,
      "$companyLogo$": companyLogo,
      "$Shift_Opened_Date$":Shift_Opened_Date
     
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }

  

 
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function calculateShiftHours(start: string, end: string): number {
  const startTime = parseTime(start);
  let endTime = parseTime(end);
  
  // Handle cases where end time is on the next day
  if (endTime < startTime) {
    endTime += 24;
  }
  
  return endTime - startTime;
}

function formatTotalHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}
export interface EmployeeFullName {
  first?: string;
  middle?: string;
  last?: string;
}

export interface Employee {
  employeeId: string;
  fullName?: EmployeeFullName;
}

export interface RosterShift {
  employeeId: string;
  site: {
    siteName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  companyId: string;
  active: boolean;
}

export interface ScheduleDataItem {
  site_name: string;
  employee_name: string;
  date: string;
  shift_start: string;
  shift_end: string;
}

export interface GroupedScheduleData {
  [siteName: string]: ScheduleDataItem[];
}

export interface ExcelExportResult {
  buffer: Uint8Array;
  filename: string;
  contentType: string;
}