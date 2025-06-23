
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import e, { Response } from 'express';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';
var Parse = require('fast-json-parse');
import { format } from 'date-fns';
import { AccessLevelsEmployeesService } from '../../settingsAccessLevelsEmployees/service/service';
import { EmployeeService } from '../../employee/service/employee.service';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
@Injectable()
export class ReportsService {
  constructor(
    private timeTrackingService: TimeTrackingService,
    private employeeService: EmployeeService,
    private accessLevelsService: AccessLevelsEmployeesService,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmReports) private reportsRepository: Repository<HrmReports>,
    @InjectRepository(HrmFolders) private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(HrmNotes) private notesRepository: Repository<HrmNotes>,
  ) {}

  async postReports(req: Request, companyId: string) {
    try {
      const reportName = req.body.reportName;
      const type = req.body.type;
      const creatorId = req.body.creatorId;
      const schedule = req.body.schedule;
      const filterBy = req.body.filterBy;
      const sortBy = req.body.sortBy;
      const groupBy = req.body.groupBy;
      const sharedWith = req.body.sharedWith;
      const folderIdList = req.body.folderIdList;
      const recentlyViewed = '';
      const reportRequired = req.body.reportRequired;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newReport = this.reportsRepository.create({
        reportName,
        type,
        creatorId,
        schedule,
        recentlyViewed,
        sharedWith,
        folderIdList,
        reportRequired,
        filterBy,
        sortBy,
        groupBy,
        createdAt,
        modifiedAt,
        companyId,
      });
      const data = {
        reportName: reportName,
        sharedWith: sharedWith,
      };
      if (type === 'my_report') {
        await this.timeTrackingService.activityTrackingFunction(
          req.headers,
          creatorId,
          'ADD',
          'REPORTS',
          '',
          '',
          '',
          '',
          data,
          newReport.companyId,
        );
      }
      const savedReport = await this.reportsRepository.save(newReport);
      const id = savedReport.id;
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: companyId,status: Not('Non Active') }});
      for (let j = 0; j < employeeDetails.length; j++) {
        if (sharedWith.includes(employeeDetails[j].employeeId)) {
          employeeDetails[j].reportAccessLevels.reportsIdList.push(savedReport.id);
          await this.employeeDetailsRepository.save(employeeDetails[j]);
        }
      }
      return newReport;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getReportList(req: Request, companyId: string) {
    try {
      const reports = await this.reportsRepository.find({
        where: { companyId: companyId },
      });
      return reports;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getReports(req: Request, companyId: string) {
    try {
      const activeEmployeeStatus = [];
      const activeJobInformation = [];
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: companyId,status: Not('Non Active') }});
      for (let i = 0; i < employeeDetails.length; i++) {
        const employeeStatus = employeeDetails[i].employeeStatus.find((status) => status.active === true);
        const jobInformation = employeeDetails[i].employeeStatus.find((status) => status.active === true);
        activeEmployeeStatus.push(employeeStatus);
        activeJobInformation.push(jobInformation);
      }
      const reports = await this.reportsRepository.find({
        where: { companyId: companyId },
      });
      if (reports.length != 0) {
        for (let l = 0; l < reports.length; l++) {
          let employees = [];

          let MainEmployeeIdList = [];
          for (let i = 0; i < employees.length; i++) {
            MainEmployeeIdList.push(employees[i].employeeId);
          }
          let employeeIdList = [];
          const employementstatus = activeEmployeeStatus;
          for (let j = 0; j < employementstatus.length; j++) {
            employeeIdList.push(employementstatus[j].employeeId);
          }
          const jobInformation = activeJobInformation;
          for (let j = 0; j < jobInformation.length; j++) {
            employeeIdList.push(jobInformation[j].employeeId);
          }
          MainEmployeeIdList = [...new Set(employeeIdList)];
          employees = [];
          for (let k = 0; k < MainEmployeeIdList.length; k++) {
            const employee = await this.employeeDetailsRepository.findOne({
              where: {
                employeeId: MainEmployeeIdList[k],
                companyId: reports[l].companyId,
                status: Not('Non Active'),
              },
            });
            employee['firstName'] = employee.fullName.first;
            employee['middleName'] = employee.fullName.middle;
            employee['lastName'] = employee.fullName.last;
            employees.push(employee);
          }
          if (reports[l].reportRequired.length != 0) {
            for (let i = 0; i < employees.length; i++) {
              employees[i]['list'] = [];
              for (let j = 0; j < reports[l].reportRequired.length; j++) {
                const emp = employees[i];
                if (
                  reports[l].reportRequired[j]['category'] === 'personal' &&
                  reports[l].reportRequired[j]['subcategory'] === '' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  emp['firstName'] = emp.fullName.first;
                  emp['middleName'] = emp.fullName.middle;
                  emp['lastName'] = emp.fullName.last;
                  const value = emp[reports[l].reportRequired[j]['feildName']];
                  const json = {};
                  json['name'] = reports[l].reportRequired[j]['name'];
                  json['value'] = value;
                  employees[i]['list'].push(json);
                }
                if (
                  reports[l].reportRequired[j]['category'] === 'personal' &&
                  reports[l].reportRequired[j]['subcategory'] === 'education' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const education = emp.education;
                  for (let k = 0; k < education.length; k++) {
                    const value =
                      education[k][reports[l].reportRequired[j]['feildName']];
                    const json = {};
                    json['id'] = education[k].id;
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }

                if (
                  reports[l].reportRequired[j]['category'] === 'personal' &&
                  reports[l].reportRequired[j]['subcategory'] ===
                    'temporaryAddress' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  if (employees[i].temporaryAddress) {
                    const temporaryAddress = emp.temporaryAddress;
                    const value =
                    temporaryAddress[
                      reports[l].reportRequired[j]['feildName']
                    ];
                    const json = {};
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }

                if (
                  reports[l].reportRequired[j]['category'] === 'personal' &&
                  reports[l].reportRequired[j]['subcategory'] ===
                    'permanentAddress' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  if (employees[i].permanentAddress) {
                    const permanentAddress = emp.permanentAddress;
                    const value =
                    permanentAddress[
                      reports[l].reportRequired[j]['feildName']
                    ];
                    const json = {};
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }

                if (
                  reports[l].reportRequired[j]['category'] === 'job' &&
                  reports[l].reportRequired[j]['subcategory'] === '' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const emp = employees[i];
                  const value = emp[reports[l].reportRequired[j]['feildName']];
                  const json = {};
                  json['name'] = reports[l].reportRequired[j]['name'];
                  json['value'] = value;
                  employees[i]['list'].push(json);
                }

                if (
                  reports[l].reportRequired[j]['category'] === 'job' &&
                  reports[l].reportRequired[j]['subcategory'] ===
                    'employementStatus' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const empStatus = emp.employeeStatus.find((status) => status.active === true);
                  if (empStatus) {
                    const value =
                      empStatus[reports[l].reportRequired[j]['feildName']];
                    const json = {};
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }
                if (
                  reports[l].reportRequired[j]['category'] === 'job' &&
                  reports[l].reportRequired[j]['subcategory'] === 'jobInfo' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const jobInfo = emp.jobInformation.find((status) => status.active === true);
                  if (jobInfo) {
                    const value =
                      jobInfo[reports[l].reportRequired[j]['feildName']];
                    const json = {};
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }
                if (
                  reports[l].reportRequired[j]['category'] === 'emergency' &&
                  reports[l].reportRequired[j]['subcategory'] === '' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const emergency = emp.emergencyContacts;
                  for (let k = 0; k < emergency.length; k++) {
                    const value =
                      emergency[k][reports[l].reportRequired[j]['feildName']];
                    const json = {};
                    json['id'] = emergency[k].id;
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }
                if (
                  reports[l].reportRequired[j]['category'] === 'note' &&
                  reports[l].reportRequired[j]['subcategory'] === '' &&
                  reports[l].reportRequired[j]['required'] === true
                ) {
                  const note = await this.notesRepository.find({
                    where: {
                      employeeId: employees[i].employeeId,
                      companyId: companyId,
                    },
                  });
                  for (let k = 0; k < note.length; k++) {
                    const value =
                      note[k][reports[l].reportRequired[j]['feildName']];
                    const json = {};
                    json['id'] = note[k].id;
                    json['name'] = reports[l].reportRequired[j]['name'];
                    json['value'] = value;
                    employees[i]['list'].push(json);
                  }
                }
              }
            }
            employees = employees.sort((a, b) => {
              const a1 = a.fullName.last.toLowerCase();
              const b1 = b.fullName.last.toLowerCase();
              return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
            });
            reports[l]['report'] = employees;
          }
        }
      }
      return reports;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getReportsById(id: string, req: Request, list) {
    try {
      console.log(req.user);
      
      const report = await this.reportsRepository.findOne({
        where: { id: id },
      });
      const activeEmployeeStatus = [];
      const activeJobInformation = [];
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: report.companyId,status: Not('Non Active') }});
      for (let i = 0; i < employeeDetails.length; i++) {
        const employeeStatus = employeeDetails[i].employeeStatus.find((status) => status.active === true);
        const jobInformation = employeeDetails[i].jobInformation.find((status) => status.active === true);
        activeEmployeeStatus.push(employeeStatus);
        activeJobInformation.push(jobInformation);
      }
      report.reportRequired = report.reportRequired;
      report.schedule = report.schedule;
      report.filterBy = report.filterBy;
      let employees = employeeDetails;

      let MainEmployeeIdList = [];
      if (list.length === 0 && report.filterBy.length === 0) {
        for (let i = 0; i < employees.length; i++) {
          MainEmployeeIdList.push(employees[i].employeeId);
        }
        let employeeIdList = [];
        const employementstatus = activeEmployeeStatus
        for (let j = 0; j < employementstatus.length; j++) {
          employeeIdList.push(employementstatus[j].employeeId);
        }
        const jobInformation = activeJobInformation
        for (let j = 0; j < jobInformation.length; j++) {
          employeeIdList.push(jobInformation[j]?.employeeId);
        }
        MainEmployeeIdList = [...new Set(employeeIdList)];
        employees = [];
        MainEmployeeIdList.forEach((employeeId) => {
          employeeDetails.forEach((employee) => {
            if (employeeId === employee.employeeId) {
              employee['firstName'] = employee.fullName.first;
              employee['middleName'] = employee.fullName.middle;
              employee['lastName'] = employee.fullName.last;
              employees.push(employee);
            }
          });
        });
      } else if (list.length === 0) {
        const reqFilterList = report.filterBy;
        for (let i = 0; i < employees.length; i++) {
          MainEmployeeIdList.push(employees[i].employeeId);
        }
        if (reqFilterList.DepartmentList.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < reqFilterList.DepartmentList.length; j++) {
            const empIdsDepartment = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.department === reqFilterList.DepartmentList[j]);

            for (let i = 0; i < empIdsDepartment.length; i++) {
              const employee = employeeDetails.find((e) => e.employeeId === empIdsDepartment[i].employeeId);
              employeeIdList.push(employee.employeeId);
            }
          }
          let filtered = [];
          for (let i = 0; i < employeeIdList.length; i++) {
            if (MainEmployeeIdList.includes(employeeIdList[i])) {
              filtered.push(employeeIdList[i]);
            }
          }
          MainEmployeeIdList = filtered;
        }
        if (reqFilterList.DivisionList.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < reqFilterList.DivisionList.length; j++) {
            const empIdsDivision = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.division === reqFilterList.DivisionList[j]);             
            for (let i = 0; i < empIdsDivision.length; i++) {
              const employee = employeeDetails.find((e) => e.employeeId === empIdsDivision[i].employeeId);
              employeeIdList.push(employee.employeeId);
            }
          }
          let filtered = [];
          for (let i = 0; i < employeeIdList.length; i++) {
            if (MainEmployeeIdList.includes(employeeIdList[i])) {
              filtered.push(employeeIdList[i]);
            }
          }
          MainEmployeeIdList = filtered;
        }
        if (reqFilterList.EmployeeStatus.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < reqFilterList.EmployeeStatus.length; j++) {
            const empIdsEmployementstatus = activeEmployeeStatus.filter((status) => status.active === true && status.status === reqFilterList.EmployeeStatus[j]);
            for (let i = 0; i < empIdsEmployementstatus.length; i++) {
              const employee = employeeDetails.find((e) => e.employeeId === empIdsEmployementstatus[i].employeeId);
              employeeIdList.push(employee.employeeId);
            }
          }
          let filtered = [];
          for (let i = 0; i < employeeIdList.length; i++) {
            if (MainEmployeeIdList.includes(employeeIdList[i])) {
              filtered.push(employeeIdList[i]);
            }
          }
          MainEmployeeIdList = filtered;
        }
        if (reqFilterList.JobTitleList.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < reqFilterList.JobTitleList.length; j++) {
            const empIdsJobtitle = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.jobTitle === reqFilterList.JobTitleList[j]);  
            for (let i = 0; i < empIdsJobtitle.length; i++) {
              const employee = employeeDetails.find((e) => e.employeeId === empIdsJobtitle[i].employeeId);
              employeeIdList.push(employee.employeeId);
            }
          }
          let filtered = [];
          for (let i = 0; i < employeeIdList.length; i++) {
            if (MainEmployeeIdList.includes(employeeIdList[i])) {
              filtered.push(employeeIdList[i]);
            }
          }
          MainEmployeeIdList = filtered;
        }
        if (reqFilterList.LocationList.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < reqFilterList.LocationList.length; j++) {
            const empIdsLocation = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.location === reqFilterList.LocationList[j]); 
            for (let i = 0; i < empIdsLocation.length; i++) {
              const employee = employeeDetails.find((e) => e.employeeId === empIdsLocation[i].employeeId);
              employeeIdList.push(employee.employeeId);
            }
          }
          let filtered = [];
          for (let i = 0; i < employeeIdList.length; i++) {
            if (MainEmployeeIdList.includes(employeeIdList[i])) {
              filtered.push(employeeIdList[i]);
            }
          }
          MainEmployeeIdList = filtered;
        }
        employees = [];
        for (let k = 0; k < MainEmployeeIdList.length; k++) {
          const employee = employeeDetails.find((e) => e.employeeId === MainEmployeeIdList[k]);
          employee['firstName'] = employee.fullName.first;
          employee['middleName'] = employee.fullName.middle;
          employee['lastName'] = employee.fullName.last;
          employees.push(employee);
        }
      } 
      
      if (report.reportRequired.length != 0) {
        for (let i = 0; i < employees.length; i++) {
          employees[i]['list'] = [];
          const emp = employeeDetails.find((e) => e.employeeId === employees[i].employeeId);
          for (let j = 0; j < report.reportRequired.length; j++) {
            if (
              report.reportRequired[j]['category'] === 'personal' &&
              report.reportRequired[j]['subcategory'] === '' &&
              report.reportRequired[j]['required'] === true
            ) {
              emp['firstName'] = emp.fullName.first;
              emp['middleName'] = emp.fullName.middle;
              emp['lastName'] = emp.fullName.last;
              const value = emp[report.reportRequired[j]['feildName']];
              const json = {};
              json['name'] = report.reportRequired[j]['name'];
              value === null ? (json['value'] = " ") : (json['value'] = value);
              employees[i]['list'].push(json);
            }
            if (
              report.reportRequired[j]['category'] === 'personal' &&
              report.reportRequired[j]['subcategory'] === 'education' &&
              report.reportRequired[j]['required'] === true
            ) {
              const education = emp.education;
              for (let k = 0; k < education.length; k++) {
                const value =
                  education[k][report.reportRequired[j]['feildName']];
                const json = {};
                json['id'] = education[k].id;
                json['name'] = report.reportRequired[j]['name'];
                value === null ? (json['value'] = " ") : (json['value'] = value);
                employees[i]['list'].push(json);
              }
            }

            if (
              report.reportRequired[j]['category'] === 'personal' &&
              report.reportRequired[j]['subcategory'] === 'temporaryAddress' &&
              report.reportRequired[j]['required'] === true
            ) {
              if (employees[i].temporaryAddress) {
                const temporaryAddress = emp.temporaryAddress;
                const value =
                temporaryAddress[report.reportRequired[j]['feildName']];
                const json = {};
                json['name'] = report.reportRequired[j]['name'];
                value === null ? (json['value'] = " ") : (json['value'] = value);
                employees[i]['list'].push(json);
              }
            }

            if (
              report.reportRequired[j]['category'] === 'personal' &&
              report.reportRequired[j]['subcategory'] === 'permanentAddress' &&
              report.reportRequired[j]['required'] === true
            ) {
              if (employees[i].permanentAddress) {
                const permanentAddress = emp.permanentAddress;
                const value =
                permanentAddress[report.reportRequired[j]['feildName']];
                const json = {};
                json['name'] = report.reportRequired[j]['name'];
                value === null ? (json['value'] = " ") : (json['value'] = value);
                employees[i]['list'].push(json);
              }
            }
            if (
              report.reportRequired[j]['category'] === 'job' &&
              report.reportRequired[j]['subcategory'] === '' &&
              report.reportRequired[j]['required'] === true
            ) {
              const emp = employeeDetails.find((e) => e.employeeId === employees[i].employeeId);
              const value = emp[report.reportRequired[j]['feildName']];
              const json = {};
              json['name'] = report.reportRequired[j]['name'];
              value === null ? (json['value'] = " ") : (json['value'] = value);
              employees[i]['list'].push(json);
            }
            if (
              report.reportRequired[j]['category'] === 'job' &&
              report.reportRequired[j]['subcategory'] === 'employementStatus' &&
              report.reportRequired[j]['required'] === true
            ) {
              const empStatus = emp.employeeStatus.find((status) => status.active === true);
              if (empStatus) {
                const value = empStatus[report.reportRequired[j]['feildName']];
                const json = {};
                json['name'] = report.reportRequired[j]['name'];
                value === null ? (json['value'] = " ") : (json['value'] = value);
                employees[i]['list'].push(json);
              }
            }
            if (
              report.reportRequired[j]['category'] === 'job' &&
              report.reportRequired[j]['subcategory'] === 'jobInfo' &&
              report.reportRequired[j]['required'] === true
            ) {
              const jobInfo = emp.jobInformation.find((status) => status.active === true);
              let value = '';
              if (jobInfo) {
                value = jobInfo[report.reportRequired[j]['feildName']];
              }
              const json = {};
              json['name'] = report.reportRequired[j]['name'];
              value === null ? (json['value'] = " ") : (json['value'] = value);
              employees[i]['list'].push(json);
            }
            if (
              report.reportRequired[j]['category'] === 'emergency' &&
              report.reportRequired[j]['subcategory'] === 'emergency' &&
              report.reportRequired[j]['required'] === true
            ) {
              const emergency = emp.emergencyContacts;

              for (let k = 0; k < emergency.length; k++) {
                const Emergency = {
                  id: emergency[k].id,
                  employeeId: emergency[k].employeeId,
                  name: emergency[k].name,
                  relationship: emergency[k].relationship,
                  email: emergency[k].email.email,
                  city: emergency[k].address.city,
                  state: emergency[k].address.state,
                  country: emergency[k].address.country,
                  no: emergency[k].address.no,
                  zip: emergency[k].address.zip,
                  street: emergency[k].address.street,
                  home: emergency[k].phone.home,
                  work: emergency[k].phone.work,
                  mobile: emergency[k].phone.mobile,
                  createdAt: emergency[k].createdAt,
                  modifiedAt: emergency[k].modifiedAt,
                };
                const value = Emergency[report.reportRequired[j]['feildName']];
                const json = {};
                json['id'] = Emergency.id;
                json['name'] = report.reportRequired[j]['name'];
                value === null ? (json['value'] = " ") : (json['value'] = value);
                employees[i]['list'].push(json);
              }
            }
            if (
              report.reportRequired[j]['category'] === 'notes' &&
              report.reportRequired[j]['subcategory'] === 'notes' &&
              report.reportRequired[j]['required'] === true
            ) {
              const note = await this.notesRepository.find({
                where: { employeeId: employees[i].employeeId },
              });

              const accessLevel = await this.accessLevelsService
                .getAccessLevelsByEmployeeId(req.user['userId'])
                .then((res) => {
                  return res['access']['themseleves']['notes']['ACCESS'];
                });

              const employeeListUnderRquester = await this.employeeService.getEmployeeListById(
                req.user['userId'],
                req.user['companyId']
              );

              const employeeListUnderRquesterId = employeeListUnderRquester.map(
                (employee) => employee['employeeId'],
              );

              const notesJson = [];
              if (note.length === 0) {
                const json = {};
                json['id'] = '';
                json['name'] = report.reportRequired[j]['name'];
                json['value'] = ' ';
                notesJson.push(json);
              }
              if (accessLevel === 'EDIT') {
                for (let k = 0; k < note.length; k++) {
                  

                  if (
                    note[k]['senderId'] === req.user['userId'] ||
                    employeeListUnderRquesterId.includes(note[k]['senderId'])
                  ) {
                    const value =
                      note[k][report.reportRequired[j]['feildName']];
                    const json = {};
                    json['id'] = note[k].id;
                    json['name'] = report.reportRequired[j]['name'];
                    value === null ? (json['value'] = " ") : (json['value'] = value);
                    notesJson.push(json);
                  }
                }
              }
              employees[i]['list'].push(notesJson);
            }
          }
        }
        employees = employees.sort((a, b) => {
          const a1 = a.fullName.last.toLowerCase();
          const b1 = b.fullName.last.toLowerCase();
          return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
        });
        report['report'] = employees;
      }

      return report;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putReportsById(id: string, req: Request) {
    try {
      const report = await this.reportsRepository.findOne({ where: { id: id }, });
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: report.companyId,status: Not('Non Active') }, });
      const oldReport = report;
      if (req.body.hasOwnProperty('reportName')) {
        report.reportName = req.body['reportName'];
      }
      if (req.body.hasOwnProperty('type')) {
        report.type = req.body['type'];
      }
      if (req.body.hasOwnProperty('creatorId')) {
        report.creatorId = req.body['creatorId'];
      }
      if (req.body.hasOwnProperty('schedule')) {
        report.schedule = req.body['schedule'];
      }
      if (req.body.hasOwnProperty('filterBy')) {
        report.filterBy = req.body['filterBy'];
      }
      if (req.body.hasOwnProperty('sortBy')) {
        report.sortBy = req.body['sortBy'];
      }
      if (req.body.hasOwnProperty('groupBy')) {
        report.groupBy = req.body['groupBy'];
      }
      if (req.body.hasOwnProperty('sharedWith')) {
        report.sharedWith = req.body['sharedWith'];
        for (let j = 0; j < employeeDetails.length; j++) {
          if (report.sharedWith.includes(employeeDetails[j].employeeId)) {
            employeeDetails[j].reportAccessLevels.reportsIdList.push(id);
            await this.employeeDetailsRepository.save(employeeDetails[j]);
          }
        }
      }
      if (req.body.hasOwnProperty('recentlyViewed')) {
        report.recentlyViewed = req.body['recentlyViewed'];
      }
      if (req.body.hasOwnProperty('folderIdList')) {
        report.folderIdList = req.body['folderIdList'];
        let sharedWith = [];
        for (let j = 0; j < report.folderIdList.length; j++) {
          const folder = await this.foldersRepository.findOne({
            where: { id: report.folderIdList[j] },
          });
          for (let k = 0; k < folder.sharedWith.length; k++) {
            sharedWith.push(folder.sharedWith[k]);
          }
        }
        sharedWith = [...new Set(sharedWith)];
        report.sharedWith = sharedWith;

        for (let l = 0; l < employeeDetails.length; l++) {
          if (employeeDetails[l].reportAccessLevels.reportsIdList.includes(report.id)) {
            employeeDetails[l].reportAccessLevels.reportsIdList.pop(report.id);
            await this.employeeDetailsRepository.save(employeeDetails[l]);
          }
        }

        for (let l = 0; l < sharedWith.length; l++) {
          const employee = employeeDetails.find((employee) => employee.reportAccessLevels.statusemployeeId === sharedWith[l]);
          if (!employee.reportAccessLevels.reportsIdList.includes(report.id)) {
            employee.reportAccessLevels.reportsIdList.push(report.id);
            await this.employeeDetailsRepository.save(employee);
          }
        }
      }
      if (req.body.hasOwnProperty('reportRequired')) {
        report.reportRequired = req.body['reportRequired'];
      }
      report.modifiedAt = new Date(Date.now());
      const data = {
        new: {
          reportName: report.reportName,
          creatorId: report.creatorId,
          sharedWith: report.sharedWith,
        },
        old: {
          reportName: oldReport.reportName,
          creatorId: oldReport.creatorId,
          sharedWith: oldReport.sharedWith,
        },
      };
      if (report.recentlyViewed !== oldReport.recentlyViewed) {
      } else {
      }
      return await this.reportsRepository.save(report);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putBulkReportsById(req: Request) {
    try {
      if (
        req.body.hasOwnProperty('idList') &&
        req.body.hasOwnProperty('creatorId')
      ) {
        for (let l = 0; l < req.body.idList.length; l++) {
          const report = await this.reportsRepository.findOne({
            where: { id: req.body.idList[l] },
          });
          const data = {
            new: {
              reportName: report.reportName,
              creatorId: req.body.idList[l].creatorId,
              sharedWith: report.sharedWith,
            },
            old: {
              reportName: report.reportName,
              creatorId: report.creatorId,
              sharedWith: report.sharedWith,
            },
          };
          report.creatorId = req.body.creatorId;
          await this.timeTrackingService.activityTrackingFunction(
            req.headers,
            report.creatorId,
            'EDIT',
            'REPORTS',
            '',
            '',
            '',
            '',
            data,
            report.companyId,
          );
          return await this.reportsRepository.save(report);
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteReportsById(id: string, req: Request) {
    try {
      const report = await this.reportsRepository.findOne({
        where: { id: id },
      });
      await this.timeTrackingService.activityTrackingFunction(
        req.headers,
        report.creatorId,
        'DELETE',
        'REPORTS',
        '',
        '',
        '',
        '',
        report.reportName,
        report.companyId,
      );
      await this.reportsRepository.remove(report);
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: report.companyId,status: Not('Non Active') }, });
      for (let i = 0; i < employeeDetails.length; i++) {
        for (let j = 0; j < employeeDetails[i].reportAccessLevels.reportsIdList.length; j++) {
          employeeDetails[i].reportAccessLevels.reportsIdList = employeeDetails[i].reportAccessLevels.reportsIdList.filter((e) => e !== id);
        }
        await this.employeeDetailsRepository.save(employeeDetails);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async deleteReportsByCompanyId(companyId: string, req: Request) {
    try {
      const report = await this.reportsRepository.find({
        where: { companyId: companyId },
      });
      await this.reportsRepository.remove(report);

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteBulkReportsById(req: Request) {
    try {
      for (let l = 0; l < req.body.idList.length; l++) {
        const report = await this.reportsRepository.findOne({
          where: { id: req.body.idList[l] },
        });
        await this.timeTrackingService.activityTrackingFunction(
          req.headers,
          report.creatorId,
          'DELETE',
          'REPORTS',
          '',
          '',
          '',
          '',
          report.reportName,
          report.companyId,
        );
        await this.reportsRepository.remove(report);
      }
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: req.body.companyId }, });
      for (let i = 0; i < employeeDetails.length; i++) {
        for (let j = 0; j < employeeDetails[i].reportAccessLevels.reportsIdList.length; j++) {
          for (let k = 0; k < req.body.idList.length; k++) {
            employeeDetails[i].reportAccessLevels.reportsIdList = employeeDetails[i].reportAccessLevels.reportsIdList.filter((e) => e !== req.body.idList[k]);
          }
        }
      }
      return await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postFolders(req: Request, companyId: string) {
    try {
      const folderName = req.body.name;
      const creatorId = req.body.creatorId;
      const sharedwith = [];
      sharedwith.push(req.body.creatorId);
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newFolder = {
        folderType: '',
        type: 'reportFolders',
        folderName,
        creatorId,
        sharedwith,
        createdAt,
        modifiedAt,
        companyId,
      };
      const savedFolder = await this.foldersRepository.save(newFolder);
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: companyId,status: Not('Non Active') }, });

      for (let j = 0; j < employeeDetails.length; j++) {
        if (sharedwith.includes(employeeDetails[j].employeeId)) {
          employeeDetails[j].reportAccessLevels.folderIdList.push(savedFolder.id);
          await this.employeeDetailsRepository.save(employeeDetails[j]);
        }
      }
      const reports = await this.reportsRepository.find();
      for (let j = 0; j < reports.length; j++) {
        if (reports[j].folderIdList.includes(savedFolder.id)) {
          for (let k = 0; k < employeeDetails.length; k++) {
            if (
              reports[j].sharedWith.includes(employeeDetails[k].employeeId)
            ) {
              employeeDetails[k].reportAccessLevels.folderIdList.push(savedFolder.id);
              await this.employeeDetailsRepository.save(employeeDetails[k]);
            }
          }
        }
      }
      return savedFolder;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getFolders(companyId: string) {
    try {
      const folders = await this.foldersRepository.find({
        where: { companyId: companyId, type: 'reportFolders' },
      });
      return folders;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putFolderById(id: string, req: Request) {
    try {
      const newFolder = await this.foldersRepository.findOne({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('sharedwith')) {
        const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: newFolder.companyId,status: Not('Non Active') }, });
        for (let j = 0; j < employeeDetails.length; j++) {
          if (newFolder.sharedWith.includes(employeeDetails[j].employeeId)) {
            employeeDetails[j].reportAccessLevels.folderIdList.push(id);
            await this.employeeDetailsRepository.save(employeeDetails[j]);
          }
        }
        const reportss = await this.reportsRepository.find();
        for (let j = 0; j < reportss.length; j++) {
          if (reportss[j].folderIdList.includes(id)) {
            for (let k = 0; k < employeeDetails.length; k++) {
              if (reportss[j].sharedWith.includes(employeeDetails[k].employeeId)) {
                employeeDetails[k].reportAccessLevels.folderIdList.push(id);
                await this.employeeDetailsRepository.save(employeeDetails[k]);
              }
            }
          }
        }

        const add = req.body['sharedwith'].filter(
          (x) => !newFolder.sharedWith.includes(x),
        );
        const remove = newFolder.sharedWith.filter(
          (x) => !req.body['sharedwith'].includes(x),
        );
        for (let i = 0; i < add.length; i++) {
          const employee = employeeDetails.find((employee) => employee.employeeId === add[i]);
          if (!employee.reportAccessLevels.folderIdList.includes(id)) {
            employee.reportAccessLevels.folderIdList.push(id);
            await this.employeeDetailsRepository.save(employee);
          }
        }
        for (let i = 0; i < remove.length; i++) {
          const employee = employeeDetails.find((employee) => employee.employeeId === remove[i]);
          if (employee.reportAccessLevels.folderIdList.includes(id)) {
            employee.reportAccessLevels.folderIdList.pop(id);
            await this.employeeDetailsRepository.save(employee);
          }
        }
        const reports = await this.reportsRepository.find();
        for (let i = 0; i < reports.length; i++) {
          let sharedWith = [];
          for (let j = 0; j < reports[i].folderIdList.length; j++) {
            const folder = await this.foldersRepository.findOne({
              where: { id: reports[i].folderIdList[j] },
            });
            for (let k = 0; k < folder.sharedWith.length; k++) {
              sharedWith.push(folder.sharedWith[k]);
            }
          }
          sharedWith = [...new Set(sharedWith)];
          reports[i].sharedWith = sharedWith;
          await this.reportsRepository.save(reports[i]);

          for (let l = 0; l < employeeDetails.length; l++) {
            if (employeeDetails[l].reportAccessLevels.reportsIdList.includes(reports[i].id)) {
              employeeDetails[l].reportAccessLevels.reportsIdList.pop(reports[i].id);
              await this.employeeDetailsRepository.save(employeeDetails[l]);
            }
          }

          for (let l = 0; l < sharedWith.length; l++) {
            const employee = employeeDetails.find((employee) => employee.employeeId === sharedWith[l]);
            if (!employee.reportAccessLevels.reportsIdList.includes(reports[i].id)) {
              employee.reportAccessLevels.reportsIdList.push(reports[i].id);
              await this.employeeDetailsRepository.save(employee);
            }
          }
        }
        newFolder.sharedWith = req.body['sharedwith'];
      }
      newFolder.modifiedAt = new Date(Date.now());
      newFolder.folderName = req.body['name'];
      newFolder.creatorId = req.body['creatorId'];
      return await this.foldersRepository.save(newFolder);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteFolderById(id: string) {
    try {
      const newFolder = await this.foldersRepository.findOne({
        where: { id: id },
      });
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: newFolder.companyId,status: Not('Non Active') }, });
      for (let i = 0; i < newFolder.sharedWith.length; i++) {
        const employee = employeeDetails.find((employee) => employee.employeeId === newFolder.sharedWith[i]);
        if (employee.reportAccessLevels.folderIdList.includes(id)) {
          employee.reportAccessLevels.folderIdList.pop(id);
          await this.employeeDetailsRepository.save(employee);
        }
      }
      const reports = await this.reportsRepository.find();
      for (let i = 0; i < reports.length; i++) {
        if (reports[i].folderIdList.includes(id)) {
          reports[i].folderIdList.pop(id);
          let sharedWith = [];
          for (let j = 0; j < reports[i].folderIdList.length; j++) {
            const folder = await this.foldersRepository.findOne({
              where: { id: reports[i].folderIdList[j] },
            });
            for (let k = 0; k < folder.sharedWith.length; k++) {
              sharedWith.push(folder.sharedWith[k]);
            }
          }
          sharedWith = [...new Set(sharedWith)];
          reports[i].sharedWith = sharedWith;
          await this.reportsRepository.save(reports[i]);
        }
      }
      for (let i = 0; i < employeeDetails.length; i++) {
        for (let j = 0; j < employeeDetails[i].reportAccessLevels.folderIdList.length; j++) {
          employeeDetails[i].reportAccessLevels.folderIdList = employeeDetails[i].reportAccessLevels.folderIdList.filter((e) => e !== id);
        }
        await this.employeeDetailsRepository.save(employeeDetails);
      }
      await this.foldersRepository.remove(newFolder);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAccessLevels(req: Request, companyId: string) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: req.body.employeeId,status: Not('Non Active') },
      });
      const employeeId = req.body.employeeId;
      const reportsIdList = req.body.reportsIdList;
      const folderIdList = req.body.folderIdList;
      const showReports = req.body.showReports;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newAccessLevel = {
        employeeId,
        reportsIdList,
        folderIdList,
        showReports,
        createdAt,
        modifiedAt,
        companyId,
      };
      employeeDetails.reportAccessLevels = newAccessLevel;
      await this.employeeDetailsRepository.save(employeeDetails);
      return newAccessLevel;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAccessLevels(companyId: string) {
    try {
      const res = [];
      const employeeDetails = await this.employeeDetailsRepository.find({
        where: { companyId: companyId,status: Not('Non Active') },
      });
      for (let i = 0; i < employeeDetails.length; i++) {
        if (
          employeeDetails[i].reportAccessLevels.folderIdList.length > 0 ||
          employeeDetails[i].reportAccessLevels.reportsIdList.length > 0
        ) {
          employeeDetails[i].reportAccessLevels.showReports = true;
        }
        res.push(employeeDetails[i].reportAccessLevels);
      }
      return res;
    } catch (error) {
      console.log('GET_ACCESS_LEVELS',error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putAccessLevels(id: string, req: Request) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: req.body['employeeId'],status: Not('Non Active') },
      });
      if (req.body.hasOwnProperty('reportsIdList')) {
        employeeDetails.reportAccessLevels.reportsIdList = req.body['reportsIdList'];
      }
      if (req.body.hasOwnProperty('folderIdList')) {
        employeeDetails.reportAccessLevels.folderIdList = req.body['folderIdList'];
      }
      if (req.body.hasOwnProperty('showReports')) {
        employeeDetails.reportAccessLevels.showReports = req.body['showReports'];
      }
      employeeDetails.reportAccessLevels['modifiedAt'] = new Date(Date.now());
      return await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
