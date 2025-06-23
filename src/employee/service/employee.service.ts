import {
  BadRequestException,
  Body,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import { EmployeeDto } from '../dto/employee.dto';
import { Locations } from 'aws-sdk/clients/directconnect';
import { TerminateReason } from 'aws-sdk/clients/swf';
import * as AWS from 'aws-sdk';
import { format, compareAsc, addDays } from 'date-fns';
import * as argon2 from 'argon2';
import { CompanyService } from '../../company/service/company.service'
import enGB from 'date-fns/locale/en-GB';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { ImageCompressorService } from '../../image-compressor/image-compressor.service';
import { S3Service } from '../../s3/service/service';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { EmailsNewService } from '@flows/ses/service/emails.service';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
const dnsPromises = require('dns').promises;
import {v4 as uuidv4} from 'uuid';
import { payrollEmploymentDto } from '@flows/allDtos/payrollEmployment.dto';
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';
import { HrmLeaveCategories } from '@flows/allEntities/leaveCategories.entity';
import { HrmLeaveBalances } from '@flows/allEntities/leaveBalances.entity';
import { HrmUsers } from '@flows/allEntities/users.entity';
import { AccAssets } from '@flows/allEntities/assets.entity';
import { AccClaims } from '@flows/allEntities/claims.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';

const axios = require('axios')
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SpecialUser } from '@flows/allEntities/specialUser.entity';
import {JobInformationService} from '../../jobInformation/service/jobInformation.service'
import { Candidate } from '@flows/allEntities/candidate.entity';
import { getAppraisalDto } from '@flows/allDtos/appraisal.dto';
import { HrmRosterEmployees } from '@flows/allEntities/hrmRoster.entity';
import { HrmTimesheetRequests } from '@flows/allEntities/timesheetRequests.entity';
import { HrmTimeEntries } from '@flows/allEntities/timeEntries.entity';
import { Appraisal } from '@flows/allEntities/appraisal.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
const moment = require('moment-timezone');
import { formatInTimeZone } from 'date-fns-tz';
import { HrmLeaveRequests } from '@flows/allEntities/leaveRequests.entity';
import { da } from 'date-fns/locale';
import { accountCreationTemplate, complianceEmailTemplate, selfAccessGrantedEmailTemplate, selfAccessRevokedEmailTemplate, specialUserEmailTemplate, verificationTemplate } from 'emailTemplate.util';
@Injectable()
export class EmployeeService {
  private readonly PayrollAPI;
  private readonly AtlasAPI;
  private readonly adminAPI;
  constructor(
    private readonly notificationService: NotificationService,
    private readonly ImageCompressorService: ImageCompressorService,
    private readonly APIService: APIService,
   
    private s3Service: S3Service,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(SpecialUser) private SpecialUserDetailsRepository: Repository<SpecialUser>,
    @InjectRepository(HrmNotifications) private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmReports) private reportsRepository: Repository<HrmReports>,
    @InjectRepository(HrmFiles) private filesRepository: Repository<HrmFiles>,
    @InjectRepository(HrmFolders)
    private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(HrmNotes) private notesRepository: Repository<HrmNotes>,
    @InjectRepository(HrmVerification) private verificationRepository: Repository<HrmVerification>,
    @InjectRepository(HrmActivityTracking) private activityTrackingRepository: Repository<HrmActivityTracking>,
    @InjectRepository(HrmAnnouncements) private AnnouncementsRepository: Repository<HrmAnnouncements>,
    @InjectRepository(HrmAttendance) private attendanceRepository: Repository<HrmAttendance>,
    @InjectRepository(HrmBoardingTaskEmployees) private boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
    @InjectRepository(HrmCustomerSupport) private customerSupportRepository: Repository<HrmCustomerSupport>,
    @InjectRepository(HrmOfferLetter) private offerLetterRepository: Repository<HrmOfferLetter>,
    @InjectRepository(HrmPerformanceTask) private performanceTaskRepository: Repository<HrmPerformanceTask>,
    @InjectRepository(HrmTalentPools) private TalentPoolsRepository: Repository<HrmTalentPools>,
    @InjectRepository(HrmTrainingComplete) private TrainingCompleteRepository: Repository<HrmTrainingComplete>,
    private readonly mailService: EmailsNewService,
    private readonly timeTrackingService: TimeTrackingService,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(hrmPayroll)
    private HrmPayrollRepository: Repository<hrmPayroll>,
    private readonly configService: ConfigService,
    @InjectRepository(hrmPayroll)
    private hrmPayrollRepository: Repository<hrmPayroll>,
    private eventEmitter: EventEmitter2,
    private readonly jobInformationService: JobInformationService,
    @InjectRepository(Candidate)
    private readonly candidateRepository:Repository<Candidate>,
  ) {
    this.PayrollAPI = axios.create({
      baseURL: this.configService.get<string>('PAYROLLBACKEND'),
    })
    this.AtlasAPI = axios.create({
      baseURL: 'https://atlas.microsoft.com/',
    })
    this.adminAPI = axios.create({
      baseURL: this.configService.get<string>('SAPDOMAIN'),
    })
  }

  private savedEmployee: HrmEmployeeDetails;

  async fisherYatesShuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  async generatePassword() {
    var passwordDataA = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var passwordDataB = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    var passwordDataC = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];
    var passwordDataD = [
      ' ',
      '!',
      '"',
      '#',
      '$',
      '%',
      '&',
      "'",
      '(',
      ')',
      '*',
      '+',
      ',',
      '-',
      '.',
      '/',
      ':',
      ';',
      '<',
      '=',
      '>',
      '?',
      '@',
      '[',
      ']',
      '^',
      '_',
      '`',
      '{',
      '|',
      '}',
      '~',
    ];
    var passwordDataE = [
      '!',
      '"',
      '#',
      '$',
      '%',
      '&',
      "'",
      '(',
      ')',
      '*',
      '+',
      ',',
      '-',
      '.',
      '/',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      ':',
      ';',
      '<',
      '=',
      '>',
      '?',
      '@',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '[',
      ']',
      '^',
      '_',
      '`',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      '{',
      '|',
      '}',
      '~',
    ];
    var password = '';
    var number = false;
    var uppercase = false;
    var lowercase = false;
    var symbol = false;

    while (password.length < 21) {
      await this.fisherYatesShuffle(passwordDataE);
      password = password + passwordDataE[0];
      if (password.length === 20) {
        const arr = password.split('');
        for (var i = 0; i < arr.length; i++) {
          if (passwordDataA.includes(arr[i])) {
            number = true;
          }
        }
        for (var i = 0; i < arr.length; i++) {
          if (passwordDataB.includes(arr[i])) {
            uppercase = true;
          }
        }
        for (var i = 0; i < arr.length; i++) {
          if (passwordDataC.includes(arr[i])) {
            lowercase = true;
          }
        }
        for (var i = 0; i < arr.length; i++) {
          if (passwordDataD.includes(arr[i])) {
            symbol = true;
          }
        }
        if (number && uppercase && lowercase && symbol) {
        } else {
          password = '';
        }
      }
    }
    return password;
  }

  async changeUserId(employeeId, req: Request) {
    const employee = await this.employeeDetailsRepository.findOne({
      where: { employeeId: employeeId },
    });

    const result = await this.employeeDetailsRepository.query(
      `SELECT 
          email ->> 'work' AS "userName",
          "fullName" ->> 'first' AS "firstName",
          "companyId"
       FROM "hrm_employee_details"
       WHERE "employeeId" = $1`,
      [employeeId]
    );

    const userName = result[0]?.userName;
    const firstName = result[0]?.firstName;
    const companyId = result[0]?.companyId;
    employee.userId = req.body.userId;

    
    const body = await specialUserEmailTemplate(firstName,userName, req.body.password);
    const emitBody = { sapCountType:'AccountCreation',companyId, subjects: 'special User', email: userName, body};
    this.eventEmitter.emit('send.email', emitBody);

    return  await this.employeeDetailsRepository.save(employee);
  }

  async changeUserAccess(employeeId, req: Request) {
    const result = await this.employeeDetailsRepository.query(
      `SELECT 
          email ->> 'work' AS "userName",
          "fullName" ->> 'first' AS "firstName",
          "companyId"
       FROM "hrm_employee_details"
       WHERE "employeeId" = $1`,
      [employeeId]
    );
    const companyId = result[0]?.companyId;
    const userName = result[0]?.firstName;
    const email = result[0]?.userName;

    
    const company = await this.APIService.getCompanyById(companyId);
    //console.log(userName,email,company.companyName)
    const employee = await this.employeeDetailsRepository.findOne({
      where: { employeeId: employeeId, status: Not('Non Active') },
    });
    employee.access = req.body.access;

    
    

    if(employee.access == true){
      const selfAccessGrantedBody = await selfAccessGrantedEmailTemplate(company.companyName, userName);
      const emitBody = { sapCountType:'selfAccessGranted',companyId, subjects: 'self-Access Granted', email: email, selfAccessGrantedBody};
      this.eventEmitter.emit('send.email', emitBody);
    }
    else{
      const selfAccessRevokedBody = await selfAccessRevokedEmailTemplate(company.companyName, userName);
      const emitBody = { sapCountType:'selfAccessRevoked',companyId, subjects: 'self-Access Revoked  ', email: email, selfAccessRevokedBody};
      this.eventEmitter.emit('send.email', emitBody);
    } 

    
    return  await this.employeeDetailsRepository.save(employee);
  }

  async postJobInformation(job, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active')},
      });
      const reporterId = job.reportTo.reporterId;
      const reporterName = job.reportTo.reporterName;

      let active = false;
      const date = new Date(Date.now());
      const effectiveDate = new Date(job.effectiveDate);
      if (effectiveDate <= date) {
        active = true;
      }

      const jobTitle = job.jobTitle;
      const location = job.location;
      const department = job.department;
      const division = job.division;
      const companyId = this.savedEmployee.companyId;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newReportTo = {
        employeeId,
        reporterId,
        reporterName,
      };
      const newJobInformation = {
        id: uuidv4(),
        employeeId,
        effectiveDate,
        jobTitle,
        location,
        department,
        division,
        active,
        reportTo: newReportTo,
        createdAt,
        modifiedAt,
        companyId,
      };
      employeeDetails.jobInformation.push(newJobInformation);
      const res = await this.employeeDetailsRepository.save(employeeDetails);
      return res.jobInformation;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async addingOnboardingToEmployees() {
    try {
      const onBoardingsTasks = await this.commonRepository.find({
        where: {
          companyId: this.savedEmployee.companyId,
          type: 'onboardingTask',
        },
      });
      for (let i = 0; i < onBoardingsTasks.length; i++) {
        let reqFilterEmployees = [];
        const reqFilterList = onBoardingsTasks[i].data.eligible;
        for (let k = 0; k < reqFilterList.length; k++) {
          if (reqFilterList[k]['name'] === 'department') {
            for (let l = 0; l < reqFilterList[k]['list'].length; l++) {
              let jobInformationActives = [];
              const employeeDetails = await this.employeeDetailsRepository.find(
                { where: { companyId: this.savedEmployee.companyId, status: Not('Non Active') } },
              );
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeJobInfo = employeeDetails[i].jobInformation.find(
                  (jobInfo) => jobInfo.active === true,
                );
                jobInformationActives.push(activeJobInfo);
              }
              const empIds = jobInformationActives.filter(
                (jobInfo) => jobInfo.department === reqFilterList[k]['list'],
              );
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]['name'] === 'division') {
            for (let l = 0; l < reqFilterList[k]['list'].length; l++) {
              let jobInformationActives = [];
              const employeeDetails = await this.employeeDetailsRepository.find(
                { where: { companyId: this.savedEmployee.companyId, status: Not('Non Active')} },
              );
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeJobInfo = employeeDetails[i].jobInformation.find(
                  (jobInfo) => jobInfo.active === true,
                );
                jobInformationActives.push(activeJobInfo);
              }
              const empIds = jobInformationActives.filter(
                (jobInfo) => jobInfo.division === reqFilterList[k]['list'][l],
              );
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]['name'] === 'employement_status') {
            for (let l = 0; l < reqFilterList[k]['list'].length; l++) {
              let employeeStatusActives = [];
              const employeeDetails = await this.employeeDetailsRepository.find(
                { where: { companyId: this.savedEmployee.companyId, status: Not('Non Active') } },
              );
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeEmployeeStatus = employeeDetails[
                  i
                ].employeeStatus.find(
                  (employeeStatus) => employeeStatus.active === true,
                );
                employeeStatusActives.push(activeEmployeeStatus);
              }
              const empIds = employeeStatusActives.filter(
                (employeeStatus) =>
                  employeeStatus.status === reqFilterList[k]['list'][l],
              );
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]['name'] === 'job_title') {
            for (let l = 0; l < reqFilterList[k]['list'].length; l++) {
              let jobInformationActives = [];
              const employeeDetails = await this.employeeDetailsRepository.find(
                { where: { companyId: this.savedEmployee.companyId, status: Not('Non Active') } },
              );
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeJobInfo = employeeDetails[i].jobInformation.find(
                  (jobInfo) => jobInfo.active === true,
                );
                jobInformationActives.push(activeJobInfo);
              }
              const empIds = jobInformationActives.filter(
                (jobInfo) => jobInfo.jobTitle === reqFilterList[k]['list'][l],
              );
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]['name'] === 'location') {
            for (let l = 0; l < reqFilterList[k]['list'].length; l++) {
              let jobInformationActives = [];
              const employeeDetails = await this.employeeDetailsRepository.find(
                { where: { companyId: this.savedEmployee.companyId, status: Not('Non Active') } },
              );
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeJobInfo = employeeDetails[i].jobInformation.find(
                  (jobInfo) => jobInfo.active === true,
                );
                jobInformationActives.push(activeJobInfo);
              }
              const empIds = jobInformationActives.filter(
                (jobInfo) => jobInfo.location === reqFilterList[k]['list'][l],
              );
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
        }

        reqFilterEmployees = [...new Set(reqFilterEmployees)];
        if (reqFilterEmployees.includes(this.savedEmployee.employeeId)) {
          const json = {};
          json['name'] =
            this.savedEmployee.fullName.first +
            ' ' +
            this.savedEmployee.fullName.last;
          json['assignTo'] = onBoardingsTasks[i].data.assignTo;
          json['hireDate'] = this.savedEmployee.hireDate;
          json['description'] = onBoardingsTasks[i].data.description;
          json['categoryId'] = onBoardingsTasks[i].data.categoryId;
          json['attachFiles'] = onBoardingsTasks[i].data.attachFiles;
          const form = json;
          const employeeId = this.savedEmployee.employeeId;
          const preDefined = true;
          const taskId = onBoardingsTasks[i].id;
          const completed = false;
          const completedBy = '';
          const completedDate = '';
          const companyId = this.savedEmployee.companyId;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const newOnboardingEmployee =
            this.boardingTaskEmployeesRepository.create({
              employeeId,
              preDefined,
              taskId,
              form,
              completed,
              completedBy,
              completedDate,
              createdAt,
              modifiedAt,
              companyId,
            });
          const savedTaskEmployee =
            await this.boardingTaskEmployeesRepository.save(
              newOnboardingEmployee,
            );
          newOnboardingEmployee.form = newOnboardingEmployee.form;

          if (
            onBoardingsTasks[i].data.sendNotification ===
            'Soon After Task Is Imported'
          ) {
            const type = 'onBoarding';
            const hidden = false;
            const createdAt = new Date(Date.now());
            const modifiedAt = new Date(Date.now());
            const companyId = this.savedEmployee.companyId;

            const onBoardingTaskEmployeeId = savedTaskEmployee.id;
            const mainData = {
              onBoardingTaskEmployeeId,
              createdAt,
              modifiedAt,
            };
            mainData['data'] = newOnboardingEmployee;
            const data = mainData;
            const newTimeOffNotification = {
              mainType: 'request',
              data,
              type,
              hidden,
              createdAt,
              modifiedAt,
              companyId,
            };
            await this.notificationService.addNotifications('onBoarding', 'onBoarding message', savedTaskEmployee['id'], companyId, employeeId);
          }
        }
      }
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEmployeeStatus(status: string, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      const active = true;
      const effectiveDate = format(new Date(Date.now()), 'yyyy-MM-dd');
      const incomeType = 'SALARYANDWAGES';
      const contractorAbn = '';
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const companyId = this.savedEmployee.companyId;
      const newEmployeeStatus = {
        id: uuidv4(),
        employeeId,
        effectiveDate,
        status,
        active,
        createdAt,
        modifiedAt,
        companyId,
        incomeType,
        contractorAbn
      };
      employeeDetails.employeeStatus.push(newEmployeeStatus);
      const res = await this.employeeDetailsRepository.save(employeeDetails);
      return {employeeStatus:res.employeeStatus};
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postPermanentAdress(permanentAdress, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      const no = permanentAdress.no;
      const street = permanentAdress.street;
      const streetTwo = permanentAdress?.streetTwo || '';
      const city = permanentAdress.city;
      const state = permanentAdress.state;
      const zip = permanentAdress.zip;
      const country = permanentAdress.country;
      const accepted = permanentAdress.accepted;
      const newAddressPermenent = {
        no,
        street,
        streetTwo,
        city,
        state,
        zip,
        country,
        accepted,
      };
      employeeDetails.permanentAddress = newAddressPermenent;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postTemporaryAdress(temporaryAdressress, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId, status: Not('Non Active') },
      });
      const no = temporaryAdressress.no;
      const street = temporaryAdressress.street;
      const city = temporaryAdressress.city;
      const state = temporaryAdressress.state;
      const zip = temporaryAdressress.zip;
      const country = temporaryAdressress.country;
      const accepted = temporaryAdressress.accepted;
      const period = temporaryAdressress.period;
      const newAddressTemporary = {
        no,
        street,
        city,
        state,
        zip,
        country,
        accepted,
        period,
      };
      employeeDetails.temporaryAddress = newAddressTemporary;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postPhone(phone, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId, status: Not('Non Active') },
      });
      const work = phone.work.toString();
      const mobile = phone.mobile.toString();
      const code = phone.code.toString();
      const home = phone.home.toString();
      const newPhone = {
        work,
        mobile,
        code,
        home,
      };
      employeeDetails.phone = newPhone;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEmail(email, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      const work = email.work;
      const personal = email.personal;
      const newEmail = { work, personal };
      employeeDetails.email = newEmail;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postFullName(fullName, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      const first = fullName.first;
      const middle = fullName.middle;
      const last = fullName.last;

      const newFullName = {
        first,
        middle,
        last,
      };
      employeeDetails.fullName = newFullName;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postSocial(social, employeeId) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      const facebook = social.facebook;
      const twitter = social.twitter;
      const linkedin = social.linkedin;
      const instagram = social.instagram;
      const pinterest = social.pinterest;
      const newSocial = {
        facebook,
        twitter,
        linkedin,
        instagram,
        pinterest,
      };
      employeeDetails.social = newSocial;
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEducation(education, employeeId) {
    const employeeDetails = await this.employeeDetailsRepository.findOne({
      where: { employeeId: employeeId, status: Not('Non Active') },
    });
    for (let i = 0; i < education.length; i++) {
      try {
        const institute = education[i].institute;
        const degree = education[i].degree;
        const feild = education[i].feild;
        const grade = education[i].grade;
        const startDate = education[i].startDate;
        const endDate = education[i].endDate;
        const newEducation = {
          employeeId,
          institute,
          degree,
          feild,
          grade,
          startDate,
          endDate,
        };
        employeeDetails.education.push(newEducation);
        await this.employeeDetailsRepository.save(employeeDetails);
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
  }

  async getEmployeeWorkAddress(employeeId: string) {
    const employeeDetails = await this.employeeDetailsRepository.findOne({
      where: { employeeId: this.savedEmployee.employeeId, status: Not('Non Active') },
    });
    const jobInformation = employeeDetails.jobInformation.find(
      (jobInfo) => jobInfo.active === true,
    );
    const common = await this.commonRepository.find({
      where: { companyId: jobInformation.companyId, type: 'locations' },
    });
    const location = common.find(
      (location) => location.data.name === jobInformation.location,
    );
    return location;
  }

  async postEmployee(userId, employee, companyId: string, accessLevel: string, Owner: boolean, dummyData, trial:boolean, dummy: boolean) {
    try {
      let createEmployee = false;
      const getStarted = false;
      let payment = false;
      const json = {
        id: '',
        name: '',
        payment: false,
      };
      const Company = await this.APIService.getCompanyById(companyId);
      if (Company.trialActive) {
        createEmployee = true;
      } else {
        let count = 0;
        const superAdminCompanyFeaturesPackage =
          await this.APIService.getActivePackageSuperAdminCompanyFeatures(companyId);
        const subscription = await this.APIService.getStripeSubscription(
          superAdminCompanyFeaturesPackage.stripeSubscriptionId,
        );
        const items = [];
        const superAdminPackages =
          await this.APIService.getSuperAdminPackagesById(
            superAdminCompanyFeaturesPackage.packageId,
          );
        for (let i = 0; i < subscription.items.data.length; i++) {
          if (
            subscription.items.data[i].price.product ===
            superAdminPackages.productId
          ) {
            count = subscription.items.data[i].quantity;
          }
        }
        const employees = await this.employeeDetailsRepository.find({
          where: { companyId: companyId, status: 'Active' },
        });
        if (employees.length <= count) {
          createEmployee = true;
        }
      }
      if (createEmployee) {
        let username;
        if (dummyData.username) {
          username = dummyData.username;
        }
        else {
          username = employee.username;
        }
        const companyTz = await this.APIService.getCompanyById(companyId);
        const timezone = companyTz.timezone;
        const employeeNo = employee.employeeNo;
        const access = employee.access;
        const status = employee.status;
        const birthday = employee.birthday;
        const gender = employee.gender;
        const maritalStatus = employee.maritalStatus;
        const passportNumber = employee.passportNumber;
        const taxfileNumber = employee.taxfileNumber;
        const nin = employee.nin;
        const hireDate = employee.hireDate;
        const ethnicity = employee.ethnicity;
        const eeoCategory = employee.eeoCategory;
        const shirtSize = employee.shirtSize;
        const allergies = employee.allergies;
        const dietaryRestric = employee.dietaryRestric;
        const secondaryLang = employee.secondaryLang;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const preferedName = employee.preferedName;
        const profileImage = employee.profileImage;
        const vaccinated = employee.vaccinated;
        const doses = employee.doses;
        const owner = employee.owner;
        const reason = employee.reason;
        const whatsappVerify = employee.whatsappVerify;
        var emailVerified = false;
        if (Owner === false) {
          emailVerified = true;
        }
        let education = dummyData.personal.education;
        if (Owner) {
          education = [];
        }
        let payrollEmployment = new payrollEmploymentDto();
        payrollEmployment.startDate = employee.hireDate;
        payrollEmployment.payrollCalendar = '';
        payrollEmployment.employeeGroup = '';
        payrollEmployment.holidayGroup = '';
        payrollEmployment.includePayslip = false;
        payrollEmployment.superannuationMemberships = [];
        payrollEmployment.epfEtfMemberships = [];
        payrollEmployment.bankAccounts = [];
        payrollEmployment.active = true;
        payrollEmployment.isTerminated = false;
        payrollEmployment.terminationDate = '';
        payrollEmployment.terminationReasonCode = '';
        payrollEmployment.averageEarnings = '';
        payrollEmployment.employeeAward = '';
        payrollEmployment.employeeAwardLevel = '';
        payrollEmployment.employeeAwardPayrateId = '';
        payrollEmployment.employeeAwardPayrate = '';
        payrollEmployment.employeeAwardCalculateRate = '';
        payrollEmployment.employeeAwardPayrateType = '';
        
        const accesslevel: accessLevels = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId" = $1 AND "accessLevelType" = $2', [companyId, accessLevel]).then(res => res[0]);
        const newEmployee = this.employeeDetailsRepository.create({
          employeeId: uuidv4(),
          dummy,
          accessLevelId: accesslevel.id,
          userId,
          getStarted,
          timezone,
          employeeNo,
          access,
          status,
          birthday,
          gender,
          maritalStatus,
          passportNumber,
          taxfileNumber,
          nin,
          hireDate,
          ethnicity,
          eeoCategory,
          shirtSize,
          allergies,
          dietaryRestric,
          secondaryLang,
          createdAt,
          modifiedAt,
          preferedName,
          profileImage,
          whatsappVerify,
          vaccinated,
          doses,
          owner,
          reason,
          companyId,
          permanentAddress: dummyData.personal.address.permenent,
          temporaryAddress: dummyData.personal.address.temporary,
          phone: dummyData.personal.phone,
          email: dummyData.personal.email,
          fullName: dummyData.personal.fullName,
          social: dummyData.personal.social,
          education: education,
          jobInformation: [],
          payrollEmployment
        });
        this.savedEmployee = await this.employeeDetailsRepository.save(
          newEmployee,
        );
        const employeeId = this.savedEmployee.employeeId;    
        if(Owner && dummy.hasOwnProperty('job')) {
          const jobInformation = await this.postJobInformation(dummyData.job, this.savedEmployee.employeeId);
          newEmployee.jobInformation = jobInformation;
        }
        const res = await this.postEmployeeStatus(dummyData.employmentStatus, this.savedEmployee.employeeId);
        let savedRecoverPassword;
        const company = await this.APIService.getCompanyById(companyId);
        const Employee = await this.employeeDetailsRepository.findOne({
          where: { employeeId: this.savedEmployee.employeeId, status: Not('Non Active') },
        });
        if (access === true && !dummy && !Owner) {
          const body = await accountCreationTemplate(this.savedEmployee.fullName.first,username,employee.password);
          const emitBody = { sapCountType:'accountCreation', companyId, subjects: 'account created successfully', email: username, body};
          this.eventEmitter.emit('send.email', emitBody);
          // await this.mailService.sendUserConfirmation(
          //   'accountCreation',
          //   companyId,
          //   'account created successfully',
          //   username,
          //   await this.accountCreationTemplate(
          //     Employee.fullName.first,
          //     username,
          //     employee.password,
          //   ),
          // );
        }
        await this.employeeDetailsRepository.save(newEmployee);
        const reportsIdList = [];
        const folderIdList = [];
        const showReports = false;
        const newAccessLevel = {
          employeeId,
          reportsIdList,
          folderIdList,
          showReports,
          createdAt,
          modifiedAt,
          companyId,
        };
        newEmployee.reportAccessLevels = newAccessLevel;
        newEmployee.employeeStatus = res.employeeStatus;
        await this.employeeDetailsRepository.save(newEmployee);
        json.id = this.savedEmployee.employeeId;
        json.name =
          this.savedEmployee.fullName.first +
          ' ' +
          this.savedEmployee.fullName.last;

        const leaveCategories: HrmLeaveCategories[] = await this.dataSource.query(
            'SELECT * FROM hrm_leave_categories WHERE "companyId"=$1',
            [companyId],
          );
        for (let i=0;i<leaveCategories.length;i++) {
          if (leaveCategories[i].assignees.everyoneIncludingNew) {
            leaveCategories[i].assignees.employeeIds.push(this.savedEmployee.employeeId);
            const leaveBalance = {
              "categoryId": leaveCategories[i]['id'],
              "employeeId":this.savedEmployee.employeeId,
              "companyId":companyId,
              "total": leaveCategories[i].automaticAccrual.amount,
              "used": "0",
          } 
          await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
          }
        }
        await this.dataSource.getRepository(HrmLeaveCategories).save(leaveCategories);
      }

      json.payment = payment;
      return json;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployees(companyId: string) {
    try {
      const leaveInformations = await this.dataSource.query(
        `SELECT b.*, p."name", p."color", p."icon", p."assignees", p."timeUnit", p."approve", p."carryOver", p."allowHalfDay", p."allowNegativeBalance", p."coverupPerson", p."requireUploadFile"
        FROM hrm_leave_balances b
        JOIN hrm_leave_categories p ON b."categoryId" = p."id" AND b."companyId"='${companyId}'`
      );
      const employees = await this.employeeDetailsRepository.find({
        where: { companyId: companyId },
      });

      for (let i = 0; i < employees.length; i++) {
        for (let j = 0; j < leaveInformations.length; j++) {
          if (leaveInformations[j].employeeId === employees[i].employeeId) {
            delete leaveInformations[j]['assignees'];
            delete leaveInformations[j]['automaticAccrual'];
            employees[i]['leaveInformation'] = leaveInformations[i];
          }
        }
        delete employees[i]['password'];
      }
      return employees;
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeesDirectory(companyId: string, all?: string) {
    try {
      let employees;
      if(all === 'false') {
        employees = await this.employeeDetailsRepository.find({
          where: { companyId: companyId, status:'Active' },
        });
      }else {
        employees = await this.employeeDetailsRepository.find({
          where: { companyId: companyId},
        });
      }
   
      
      const employeeStatus = [];

      for (let i = 0; i < employees.length; i++) {
        delete employees[i]['satisfaction'];
        delete employees[i]['timeoffInformation'];
        delete employees[i]['wellbeing'];
        const status = employees[i].employeeStatus.find(
          (status) => status.active === true,
        );
        if (status !== undefined) {
          employeeStatus.push(status);
        }
      }
      for (let i = 0; i < employeeStatus.length; i++) {
        employeeStatus[i]['employeementStatus'] = employeeStatus[i].status;
        delete employeeStatus[i].status;
      }
      const jobInfoArray = [];
      const reportTo = [];
      for (let i = 0; i < employees.length; i++) {
        const jobInfo = employees[i].jobInformation.find(
          (info) => info.active === true,
        );
        if (jobInfo) {
          reportTo.push(jobInfo.reportTo);
        }
        jobInfoArray.push(jobInfo);
      }
      let merged = [];
      let reportersCount = 0;

      for (let i = 0; i < employees.length; i++) {
        let empStatus = employeeStatus.find(
          (itmInner) => itmInner.employeeId === employees[i].employeeId,
        );
        if (!empStatus) {
          empStatus = {
            employeementStatus: 'Not Available',
          };
        }
        let jobInfo = jobInfoArray.find((itmInner) => {
          return itmInner
            ? itmInner.employeeId === employees[i].employeeId
            : undefined;
        });
        if (!jobInfo) {
          jobInfo = {
            jobTitle: '',
            location: '',
            department: '',
            division: '',
            reportTo: {
              reporterId: '',
              reporterName: '',
            },
          };
        }

        merged.push({
          ...employees[i],
          reportersCount,
          ...empStatus,
          ...jobInfo,
          userType: "EMPLOYEE"
        });
      }
      for (let i = 0; i < merged.length; i++) {
        delete merged[i].password;
        if (merged[i].profileImage === '') {
          if (merged[i].gender === 'Female') {
            merged[i].profileImage ===
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyODAgMjgwIiBmaWxsPSJub25lIiBzaGFwZS1yZW5kZXJpbmc9ImF1dG8iIHdpZHRoPSIxNzAiIGhlaWdodD0iMTcwIj48ZGVzYz4iQXZhdGFhYXJzIiBieSAiUGFibG8gU3RhbmxleSIsIGxpY2Vuc2VkIHVuZGVyICJGcmVlIGZvciBwZXJzb25hbCBhbmQgY29tbWVyY2lhbCB1c2UiLiAvIFJlbWl4IG9mIHRoZSBvcmlnaW5hbC4gLSBDcmVhdGVkIHdpdGggZGljZWJlYXIuY29tPC9kZXNjPjxtZXRhZGF0YSB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpSREY+PGNjOldvcms+PGRjOnRpdGxlPkF2YXRhYWFyczwvZGM6dGl0bGU+PGRjOmNyZWF0b3I+PGNjOkFnZW50IHJkZjphYm91dD0iaHR0cHM6Ly90d2l0dGVyLmNvbS9wYWJsb3N0YW5sZXkiPjxkYzp0aXRsZT5QYWJsbyBTdGFubGV5PC9kYzp0aXRsZT48L2NjOkFnZW50PjwvZGM6Y3JlYXRvcj48ZGM6c291cmNlPmh0dHBzOi8vYXZhdGFhYXJzLmNvbS88L2RjOnNvdXJjZT48Y2M6bGljZW5zZSByZGY6cmVzb3VyY2U9Imh0dHBzOi8vYXZhdGFhYXJzLmNvbS8iIC8+PC9jYzpXb3JrPjwvcmRmOlJERj48L21ldGFkYXRhPjxtYXNrIGlkPSJ2aWV3Ym94TWFzayI+PHJlY3Qgd2lkdGg9IjI4MCIgaGVpZ2h0PSIyODAiIHJ4PSIwIiByeT0iMCIgeD0iMCIgeT0iMCIgZmlsbD0iI2ZmZiIgLz48L21hc2s+PGcgbWFzaz0idXJsKCN2aWV3Ym94TWFzaykiPjxyZWN0IGZpbGw9InVybCgjYmFja2dyb3VuZExpbmVhcikiIHdpZHRoPSIyODAiIGhlaWdodD0iMjgwIiB4PSIwIiB5PSIwIiAvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYmFja2dyb3VuZExpbmVhciIgZ3JhZGllbnRUcmFuc2Zvcm09InJvdGF0ZSgxMTYgMC41IDAuNSkiPjxzdG9wIHN0b3AtY29sb3I9IiM0MTU4RDAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNDODUwQzAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4KSI+PHBhdGggZD0iTTEzMiAzNmE1NiA1NiAwIDAgMC01NiA1NnY2LjE3QTEyIDEyIDAgMCAwIDY2IDExMHYxNGExMiAxMiAwIDAgMCAxMC4zIDExLjg4IDU2LjA0IDU2LjA0IDAgMCAwIDMxLjcgNDQuNzN2MTguNGgtNGE3MiA3MiAwIDAgMC03MiA3MnY5aDIwMHYtOWE3MiA3MiAwIDAgMC03Mi03MmgtNHYtMTguMzlhNTYuMDQgNTYuMDQgMCAwIDAgMzEuNy00NC43M0ExMiAxMiAwIDAgMCAxOTggMTI0di0xNGExMiAxMiAwIDAgMC0xMC0xMS44M1Y5MmE1NiA1NiAwIDAgMC01Ni01NloiIGZpbGw9IiNEMEM2QUMiLz48bWFzayBpZD0ic3R5bGVEZWZhdWx0LWEiIHN0eWxlPSJtYXNrLXR5cGU6YWxwaGEiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjMyIiB5PSIzNiIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNDQiPjxwYXRoIGQ9Ik0xMzIgMzZhNTYgNTYgMCAwIDAtNTYgNTZ2Ni4xN0ExMiAxMiAwIDAgMCA2NiAxMTB2MTRhMTIgMTIgMCAwIDAgMTAuMyAxMS44OCA1Ni4wNCA1Ni4wNCAwIDAgMCAzMS43IDQ0LjczdjE4LjRoLTRhNzIgNzIgMCAwIDAtNzIgNzJ2OWgyMDB2LTlhNzIgNzIgMCAwIDAtNzItNzJoLTR2LTE4LjM5YTU2LjA0IDU2LjA0IDAgMCAwIDMxLjctNDQuNzNBMTIgMTIgMCAwIDAgMTk4IDEyNHYtMTRhMTIgMTIgMCAwIDAtMTAtMTEuODNWOTJhNTYgNTYgMCAwIDAtNTYtNTZaIiBmaWxsPSIjRDBDNkFDIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjc3R5bGVEZWZhdWx0LWEpIj48cGF0aCBmaWxsPSIjZWRiOThhIiBkPSJNMCAzNmgyNjR2MjQ0SDB6Ii8+PHBhdGggZD0iTTc2IDEzMHY4YTU2IDU2IDAgMSAwIDExMiAwdi04YTU2IDU2IDAgMSAxLTExMiAwWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDE3MCkiPjxwYXRoIGQ9Ik0xMzIuNSA1MS44M2MxOC41IDAgMzMuNS05LjYyIDMzLjUtMjEuNDggMC0uMzYtLjAxLS43LS4wNC0xLjA2QTcyIDcyIDAgMCAxIDIzMiAxMDEuMDRWMTEwSDMydi04Ljk1YTcyIDcyIDAgMCAxIDY3LjA1LTcxLjgzYy0uMDMuMzctLjA1Ljc1LS4wNSAxLjEzIDAgMTEuODYgMTUgMjEuNDggMzMuNSAyMS40OFoiIGZpbGw9IiNFNkU2RTYiLz48cGF0aCBkPSJNMTMyLjUgNTguNzZjMjEuODkgMCAzOS42My0xMi4wNSAzOS42My0yNi45MSAwLS42LS4wMi0xLjItLjA4LTEuOC0yLS4zMy00LjAzLS41OS02LjEtLjc2LjA0LjM1LjA1LjcuMDUgMS4wNiAwIDExLjg2LTE1IDIxLjQ4LTMzLjUgMjEuNDhTOTkgNDIuMiA5OSAzMC4zNWMwLS4zOC4wMi0uNzYuMDUtMS4xMy0yLjA2LjE0LTQuMDguMzYtNi4wOC42Ny0uMDcuNjUtLjEgMS4zLS4xIDEuOTYgMCAxNC44NiAxNy43NCAyNi45MSAzOS42MyAyNi45MVoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjE2Ii8+PHBhdGggZD0iTTEwMC43OCAyOS4xMiAxMDEgMjhjLTIuOTYuMDUtNiAxLTYgMWwtLjQyLjY2QTcyLjAxIDcyLjAxIDAgMCAwIDMyIDEwMS4wNlYxMTBoNzRzLTEwLjctNTEuNTYtNS4yNC04MC44bC4wMi0uMDhaTTE1OCAxMTBzMTEtNTMgNS04MmMyLjk2LjA1IDYgMSA2IDFsLjQyLjY2YTcyLjAxIDcyLjAxIDAgMCAxIDYyLjU4IDcxLjRWMTEwaC03NFoiIGZpbGw9IiMzNzk1QkQiLz48cGF0aCBkPSJNMTAxIDI4Yy02IDI5IDUgODIgNSA4Mkg5MEw3NiA3NGw2LTktNi02IDE5LTMwczMuMDQtLjk1IDYtMVpNMTYzIDI4YzYgMjktNSA4Mi01IDgyaDE2bDE0LTM2LTYtOSA2LTYtMTktMzBzLTMuMDQtLjk1LTYtMVoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Im0xODMuNDIgODUuNzcuODctMi4yNCA2LjI3LTQuN2E0IDQgMCAwIDEgNC44NS4wNWw2LjYgNS4xMi0xOC41OSAxLjc3WiIgZmlsbD0iI0U2RTZFNiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OCAxMzQpIj48cGF0aCBkPSJNNDAgMTZjMCA1LjM3IDYuMTYgOSAxNCA5czE0LTMuNjMgMTQtOWMwLTEuMS0uOTUtMi0yLTItMS4zIDAtMS44Ny45LTIgMi0xLjI0IDIuOTQtNC4zMiA0LjcyLTEwIDUtNS42OC0uMjgtOC43Ni0yLjA2LTEwLTUtLjEzLTEuMS0uNy0yLTItMi0xLjA1IDAtMiAuOS0yIDJaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii42Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNCAxMjIpIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDhjMCA0LjQyIDUuMzcgOCAxMiA4czEyLTMuNTggMTItOCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMTYiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzYgOTApIj48cGF0aCBkPSJNMzYgMjJhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDBaTTg4IDIyYTYgNiAwIDEgMS0xMiAwIDYgNiAwIDAgMSAxMiAwWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3NiA4MikiPjxwYXRoIGQ9Ik0xNS42IDE0LjE2YzQuNDktNi4zMiAxNC05LjUgMjMuNzUtNi4zNmEyIDIgMCAxIDAgMS4yMy0zLjgxYy0xMS40MS0zLjY4LTIyLjc0LjEtMjguMjUgNy44NWEyIDIgMCAxIDAgMy4yNiAyLjMyWk05Ni4zOCAyMS4xNmMtMy45Mi01LjUxLTE0LjY1LTguNi0yMy45LTYuMzNhMiAyIDAgMCAxLS45NS0zLjg4YzEwLjc0LTIuNjQgMjMuMTcuOTQgMjguMSA3LjlhMiAyIDAgMSAxLTMuMjUgMi4zWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNiIvPjwvZz48bWFzayBpZD0ic3R5bGVEZWZhdWx0LWIiIHN0eWxlPSJtYXNrLXR5cGU6bHVtaW5hbmNlIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjY0IiBoZWlnaHQ9IjI4MCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyNjR2MjgwSDB6Ii8+PC9tYXNrPjxnIG1hc2s9InVybCgjc3R5bGVEZWZhdWx0LWIpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSkiPjxwYXRoIGQ9Ik04OS40IDg0LjJjLTQuODggMS4zLTkuNjUgMi43OC0xNC40IDQuMzQtMTEuMTMgMy42NC02LjY4LTYuMS0zLTE0LjA0bDExMS43OS05LjUyYzYuMDIgNy4zMyAyNC44MiA0MSA3LjEyIDI3LTMuMS0yLjQ1LTkuNTctNC40NS0xMi42Ni03LjI3LTIuMzQtMi4xMi01LjE2LTEuNzgtNi4yOC00LjQ4bC0yLjU1LjlhMzc1LjEyIDM3NS4xMiAwIDAgMS0xMS45Ny00LjEybC0uNTUtMS4wNy0xLjY3LjY0LTkuMTItLjMzYy0yLjYzLS4wMy0xMy43My4yMi0xNi4yOC40MyAwIDAtMS4yMy0uOTItMi45NC0yLjY4bC0xLjMzIDMuMjJzLTExLjkyIDEuOC0xNC4wOCAxLjk2bC0xLjA2LTEuOTUtMi43NCAyLjk3Yy0zLjkuOS0xMy44NCAyLjgzLTE4LjMgNC4wMVoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjE2Ii8+PHBhdGggZD0iTTQ4LjYgMTIzLjA0Yy01LjctMTcuODYgMi43NS0zNy4xMyAxMS4xMi00Ny4yNyAxLjQ4LTEuOCAzLjA2LTUuMTEgNS4wNi05LjMgOC4zNC0xNy40NyAyMy45LTUwLjA1IDY5LjgtNTAuMjcgNDkuOTMtLjI0IDU5Ljc1IDM2LjAyIDYzLjY2IDUwLjQzIDEuNjQgNi4wOCA0LjU1IDExLjU5IDcuMzggMTcuMjEgNCA4IDguNCAxNi43NCA5LjkgMjMuMDUgMS4wOSA0LjU0IDEuNyA5LjA1IDEuMTcgMTMuNy0uMTIgMS4wNi0xLjA4IDQuMjItLjQ4IDQuODUuNTQuNTcgMS44OCAxLjE1IDMuMSAxLjY3IDkuMDEgMy45IDE2LjEgMTAuNCAxOS44IDE5LjYyIDQuNzEgMTEuNzItLjk5IDI1LjQ3LTExLjI2IDMyLjE3LTEuNC45LS43NCAyLjctLjc2IDQuMWE3NC4yMiA3NC4yMiAwIDAgMS00LjMzIDIzLjVjLTEuNDIgMy45NC0zLjE3IDcuOTItNi41MyAxMC45OC0yLjg1IDIuNTgtNi45NCA0LjQyLTEwLjg2IDUuNTItMS4zNS4zOC0xLjMzLjc4LTEuNDEgMS4xNy0xLjE1IDUuNzYgMi43IDEzLjEyIDQuNiAxOC41NiAxLjUgNC4yOSAzIDguNTkgMy44IDEzIDEuMTggNi40Mi0zLjAyIDI3LjgyLTE0LjEyIDIyLjggNS41Mi0yLjY0IDUuNzYtOC4yNiAzLjg4LTkuODQtNC4zNC0zLjYyLTExLjc2LTEuNTktMTYuOS0uNzQtMy43LjYxLTcuNjMgMS4yNS0xMS4xNS40M2EzMS4zNCAzMS4zNCAwIDAgMS0xMC42LTQuODRjLTE3LjY1LTEzLjk3LTEzLjg0LTM3LjA0IDEuMDctNjQuNGwtLjU1LS4wM2MtMS4xLS4wNi0xLjY3LS4xLTMtLjFoLTR2LTE4LjM5QTU2IDU2IDAgMCAwIDE4OSAxMzBWOTJjMC0xLjQ3LS4wNS0yLjk0LS4xNi00LjM4YTY4LjA5IDY4LjA5IDAgMCAwLTMuNjYtMS44NmMtMi41OC0xLjI0LTUuMjQtMi41My02LjkxLTQuMDVhMTAuMiAxMC4yIDAgMCAwLTMtMS43NmMtMS4zOS0uNi0yLjYyLTEuMTQtMy4yOC0yLjcybC0yLjU1LjlhMzczLjk0IDM3My45NCAwIDAgMS0xMS45Ny00LjEybC0uNTUtMS4wNy0xLjY3LjY0LTkuMTItLjMzYy0yLjYzLS4wMy0xMy43My4yMi0xNi4yOC40MyAwIDAtMS4yMy0uOTItMi45NC0yLjY4bC0xLjMzIDMuMjJzLTExLjkyIDEuOC0xNC4wOCAxLjk2bC0xLjA2LTEuOTUtMi43NCAyLjk3Yy0xLjQzLjMzLTMuNjYuOC02LjEzIDEuMzEtNC4zLjktOS4zNCAxLjk1LTEyLjE3IDIuN2EyNDguMTUgMjQ4LjE1IDAgMCAwLTExLjkzIDMuNTNjLS4zMSAyLjM4LS40NyA0LjgtLjQ3IDcuMjd2MzhhNTYgNTYgMCAwIDAgMzIgNTAuNjFWMTk5aC00YTcyLjIgNzIuMiAwIDAgMC0xNi40IDEuODdjLS4xLjE3LS4yMi4zMi0uMzIuNS00Ljc4IDYuOTUtMTMuODcgMTIuMzktMTcuNDYgMTkuNS0xLjQ3IDIuOS4xOSA3LjgyIDEuNjYgMTAuNTUgMy4yIDUuOSAxMS4xNSA4LjY2IDE5LjUyIDcuMzMtMi41MyAyLjEyLTcuNTUgMy44Mi0xMC45NSAzLjk0LTQuNjMuMTctMTAuMjktMS42Mi0xNC4yNi0zLjU4LjYgMy42IDIuNjggNS42MiA0LjYyIDguNi01LjUyLS4yOC0xMC44OC03LjA2LTEyLjY4LTEyLjA1LTIuMiA0LjUxLTMuNDQgMTYuNjQtMi4zNSAyMC4wMy0xNC4xNC02LjM0LTI1LjEzLTE5LjQ0LTI0LjMtMzUuNjYuNTQtMTAuNTYgNy4xNS0xOC45IDkuNDgtMjguOS40Ni0xLjk2LjE0LTIuMzgtMS4wNS0zLjk0bC0uMDUtLjA3Yy00LjM4LTUuNzMtOS42Mi0xMC42OS0xMi40My0xNy40OC0yLjU0LTYuMTMtMi42My0xMy4xOC0uNjQtMTkuNSAyLjIxLTcuMDggOS4wNi0xNC4xNiAxNC44NC0yMC4xNGExMDUuNSAxMDUuNSAwIDAgMCA2LjM3LTYuOTVaIiBmaWxsPSIjNGYxYTAwIi8+PHBhdGggZD0ibTE2NC41IDE5OS4yLjI2LS4wNnM0LjQ0LTkuMDIgMTEuMjUtMTcuMzhjLTEuMzMtMTAuNDMgNS44Ni0yMy43MSA1Ljg2LTIzLjcxbC0uMzUtLjA4QTU2LjI1IDU2LjI1IDAgMCAxIDE1NyAxODAuNjJWMTk5aDRjMS4zMiAwIDEuODguMDQgMyAuMWwuNTQuMDQtLjA0LjA3Wk04Mi4yNyAxNTMuNzRsLS4xNC4wNmM2LjAyIDkuOTkgMTMuNjMgMzYuOTUgNi41NSA0Ni42NmwuMjUuMzRBNzIuMjUgNzIuMjUgMCAwIDEgMTA1IDE5OWg0di0xOC4zOWE1Ni4yMyA1Ni4yMyAwIDAgMS0yNi43My0yNi44N1oiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjI0Ii8+PGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuNiI+PHBhdGggZD0iTTExOC4zOCA1MC4zN2MxLjUxLTEuODUgMi44OS0zLjgzIDMuNS02LjE2LjIzLS44Ny40Ny0xLjc3Ljg5LTIuMy00Ljc2IDQuOTktOC44IDkuOTEtMTIuMyAxNS42My43Ny0xLjAyIDIuNzMtMi4wMiAzLjc2LTIuOTFhMzQuOTQgMzQuOTQgMCAwIDAgNC4xNS00LjI1Wk0xNzEuNSA0MS45OGMtLjMgMy41LjQ3IDYuOTQuNjMgMTAuNCAwLS4zNC4zNC0uOTIuNjUtMS40N2E2Ljk4IDYuOTggMCAwIDAgLjkyLTQuNDJjLS4xNC0xLS41NS0xLjk1LTEuMDctMi44NS0uMi0uMzYtMS4xMi0xLjMzLTEuMTItMS42NlpNNTYuNCAxMjAuMzhhODguNjEgODguNjEgMCAwIDAgNC40NyAxOGMyLjA2IDUuNzIgNC40MiAxMS40NiA3LjggMTYuNjkgMy4xNyA0Ljg3IDYuOTMgOS40MiA5Ljk2IDE0LjM2LS40Ni0uNTUtMS4yMi0xLjE3LTEuOS0xLjczLS40OS0uNC0uOTQtLjc2LTEuMi0xLjA1LTMuMjMtMy40LTUuODItNy4yLTguMjktMTEuMDQtMy4yNS01LjA3LTUuNjktMTAuNTgtNy44LTE2LjA4LTQuMTQtMTAuNzgtOC4zLTIzLjg1LTQuNy0zNS4yNC0uMi43Ny41IDIuNDMuNiAzLjIuNjIgNC4yNy40OCA4LjYgMS4wNyAxMi44OFpNNTQuNzcgMTA0LjJhLjc2Ljc2IDAgMCAwLS4wMi4wOWwuMDItLjA5Wk03OC42MyAxNjkuNDNjLjUuNTguMzUuNTYgMCAwWk02OC44NiAxNjUuMDRjLTIuNDYtMy41NC01LjA1LTcuMTYtNy4wOS0xMC45LTEuNzgtMy4yNy0zLjA1LTYuODUtNS4yOS05Ljg1LS4zMi0uNDQtLjcyLS45Ny0uOC0xLjMyLjY4IDYuMTUgMy40NSAxMi43NCA3LjczIDE3LjMgMS41NiAxLjY3IDQuMDkgMy4wNCA1LjQ1IDQuNzdaTTY0LjA4IDE3MS4zMmMzLjU1IDMuODIgNi45NCA3Ljc2IDkuNDUgMTIuMTggMS43NSAzLjA3IDMuMjIgNi42NCAzLjQ2IDEwLjIxLjA0LjUzLjA4IDEuMi4yIDEuNTctMi4yMi00LjI5LTMuOTEtOC44My02LjU1LTEyLjk0LTIuNi00LjA1LTUuOTUtNy43OC05LjQ0LTExLjI4LTMuNy0zLjctNy40MS03LjE4LTkuNC0xMS44NWEyNS41MyAyNS41MyAwIDAgMS0xLjk5LTEyLjU1Yy4wMiAxLjI0Ljc2IDIuODIgMS40NCA0LjI4IDEuNDcgMy4xNCAyLjA3IDYuNiAzLjY3IDkuNyAyLjEzIDQuMDggNS45NiA3LjI0IDkuMTcgMTAuNjhaTTU5LjIzIDE3NC4xOGMtLjUtLjQ5LTIuNDEtMS42OS0yLjc1LTIuM2wtLjAzLS4wNi4wMy4wNmMuNyAxLjUgMS40OCAyLjk1IDIuMjIgNC40MyAxLjUzIDMuMDggMy43MSA1LjcxIDUuOTMgOC40bDEuMDggMS4zYy0uOC0xLjAyLTEuMDItMy4yOS0xLjUzLTQuNWEyMS40MyAyMS40MyAwIDAgMC00Ljk1LTcuMzNaTTQ4LjkgMTgwLjUzYTgzLjY3IDgzLjY3IDAgMCAwIDMuNzMgNS4wMmMxLjkgMi40MyAzLjggNC44NiA1LjI1IDcuNSAyLjgzIDUuMiA0LjA3IDEwLjgxIDQuMzIgMTYuNTUuMTIgMi43LjEyIDUuNDYtLjI1IDguMTYtLjI0IDEuNzctLjU0IDMuNi0xLjIyIDUuMjUtLjI1LjYtLjU0IDEuMzItLjYzIDEuODQtLjA2LTIuMzItLjAzLTQuNjQgMC02Ljk1LjEzLTguMi4yNS0xNi4zLTQuMDItMjMuOTYtMS41OC0yLjgzLTMuNjgtNS40LTUuNzgtNy45OWE5MC4zNyA5MC4zNyAwIDAgMS0zLjktNS4wMmMtMi43OC0zLjk2LTUuNS03Ljg1LTcuNzItMTIuMDggMS4zNiAxLjcyIDMuOCAzLjA3IDUuMzIgNC43NyAxLjkgMi4xMyAzLjM1IDQuNTggNC45IDYuOVoiLz48cGF0aCBkPSJNNjAuMSAyMjQuODVjLS4wOC41My4wMS40IDAgMFpNNTAuNTQgMjA0bC4wMi0xLjVjMCAuNS44MiAxLjUxIDEuMDQgMi4wMyAxLjYxIDMuNzUgMS41NyA3LjUuMDkgMTEuMzItMS45IDQuOS00Ljg4IDkuMjUtOC42MiAxMy4zLjgzLTEuMDkgMS4zNS0yLjYgMS44NS00LjA2IDEuMDEtMi45NCAyLjYtNS42MiAzLjgtOC40OSAxLjY4LTQuMDEgMS43My04LjMyIDEuODEtMTIuNlpNNDEuOTIgMjIxLjJhOS40NiA5LjQ2IDAgMCAwIDIuMjUtNC4xM2MuMi0uOS0uNDEtMi42OCAwLTMuMzhhMTMuNjYgMTMuNjYgMCAwIDAtMS44NSAzLjY0Yy0uMi42OSAwIDMuMzItLjQgMy44N1pNODQuODYgNjQuMzJhNjMuMyA2My4zIDAgMCAwIDkuNzctMTEuMiAzNC42IDM0LjYgMCAwIDAgMy4yMi01LjZjLjEzLS4yOC4zLS44Ny40OC0xLjU0LjMtMS4wOS42NS0yLjQgMS4wNC0yLjk3LTIuNyAyLjktNC44NCA2LTcuMDMgOS4xNy0xLjQ1IDIuMTItMi45OSA0LjE4LTQuMzQgNi4zNy0uMzYuNTgtLjY4IDEuMzUtMS4wMyAyLjE0LS41OSAxLjM3LTEuMjIgMi44My0yLjEgMy42M1pNODMuODQgNTUuNjljLjE0LS42Mi4yNy0xLjIyLjQ3LTEuNTcuNzUtMS4zMiAxLjktMi40NSAzLjE4LTMuNDEtLjM1LjMtLjU4IDEuMTYtLjc5IDEuOTUtLjE1LjU0LS4yOCAxLjA1LS40NCAxLjMzYTE1LjggMTUuOCAwIDAgMS0zLjE3IDMuNzVjLjM2LS4zNS41Ni0xLjIyLjc0LTIuMDRaTTgzLjA3IDU3Ljc1bC4wMy0uMDItLjAzLjAyWk0yMDMuOCAxNTAuNmMuNi0zLjMzIDEuMjUtNi44NCAyLjk0LTkuODQuNzYtMS4zNiAxLjY4LTIuNjggMi42LTMuOTguNDgtLjcuOTQtMS4zOCAxLjM1LTIuMTEuNjYtMS4xNiAxLjQ2LTIuNTYgMi4yNi0zLjAzLTQuMTYgMi40My03LjQyIDUuNTQtOS4xNiA5LjY0LS44OCAyLjA3LTEuMiA0LjItMS4wOSA2LjM5LjA4IDEuNTcuNzYgMy4yNC43NyA0Ljc3LjA4LS42Mi4yLTEuMjMuMzItMS44NVpNMjAyIDEzMC40OGEyMi44OCAyMi44OCAwIDAgMS0xIDMuNjMgMjUuMTQgMjUuMTQgMCAwIDEtMS43NyAzLjc0Yy0uNDMuNzUtMS45OCAyLjMyLTEuOTggMy4xNS0uMDktNC45IDEuNzMtOS4zMyA1LjE3LTEzLjI1LS4zOC42NS0uMjggMi4wMy0uNDIgMi43NFpNMjAxLjIgMTY1LjcyYzIuMjgtLjAzIDQuODIgMi41MiA2LjUxIDQuMjIgMi40MiAyLjQzIDUuMTQgNC41NiA3LjIgNy4zMWwuMDYuMDctLjA1LS4wN2MtLjY4LS45Ni0uNy0yLjc0LTEuMjMtMy44NS0uNzItMS41LTEuODItMi45LTMuMDYtNC4xMy0yLjMyLTIuMjktNS43Ny00LjA3LTkuNDItMy41NVpNMjAwLjQyIDE3Ni4xYy0uMTgtLjA2LTEuNzgtLjUyLTIuMjgtLjM1LjU5LS4yNiAxLjMtLjU3IDEuOTMtLjY1IDQuMjgtLjU3IDkuNSAzLjE0IDEwLjA3IDYuNzItLjQ4LTEuMjMtMy4wMy0yLjI0LTQuMTgtMi44NS0xLjgyLS45Ny0zLjU2LTIuMTQtNS41NC0yLjg3Wk0xOTguMTQgMTc1Ljc1bC0uMDYuMDMuMDMtLjAyaC4wM1pNMjAyLjIzIDE4My45YTcuNiA3LjYgMCAwIDAtMy43OS0uMTNjLS40Ny4xMy0xLjQ0LjQyLTEuNTYuMzkgMi44Mi42NiA1LjQ3Ljk4IDguNC45MS0uNDQgMC0xLjE2LS4zNC0xLjg0LS42Ni0uNDctLjIyLS45LS40My0xLjIxLS41Wk0xOTEuMDEgMTk3Ljc2Yy0uMTMgMC0uMTMuMDEgMCAwWk0xOTEuMDEgMTk3Ljc2YzQuMjYtLjIyIDkuMjUuNCAxMy4zIDEuNDJhMjIuMyAyMi4zIDAgMCAxIDUuNyAyLjNjMS40LjgxIDMuOTMgMS45MyA0Ljg3IDMuMTMtMy43NC02LjQ0LTExLjg1LTkuNzktMjAuMTYtOC4xMy0xLjA2LjIyLTIuNjcgMS4yLTMuNyAxLjI5Wk0xOTIuNzYgMjEwLjI3YzMuMjMuNDIgNi41NS0uMDcgOS43Ny0uNDQgMS4zOC0uMTUgMy4wMy0uODYgNC4zOC0uNDlhMjMuNTUgMjMuNTUgMCAwIDAtOC40LTEuMTdjLTIuOTMuMTMtNS45IDEuMDYtOC41OSAyLjAzLjY4LS4yIDEuODEtLjA2IDIuODQuMDdaTTE3OS4zNiAyMjAuNjdjLS4wNiAyLjIzLS4wNCA0LjUyLjEgNi43NC4yNSAzLjk3IDIuNTUgNy40NCA1LjkzIDEwLjA4YTMyLjM2IDMyLjM2IDAgMCAwIDQuMzQgMi43MmMyLjUxIDEuMzkgNSAyLjc2IDYuNjMgNS4xIDIuMTUgMy4xIDIuMzMgNi45Ni44MiAxMC4zNi0uMjUuNTYtLjUxIDEuMTYtLjUyIDEuNTh2LS4wNWMuMDMtMy44Ny4wNy04LjM2LTIuNjQtMTEuNi0xLjU5LTEuOS0zLjg3LTMuMS02LjE2LTQuMjktMS42My0uODUtMy4yOC0xLjctNC42Ny0yLjgzLTMuMjctMi42NC01Ljc2LTYuMS02LjMyLTkuOTgtLjQ1LTMuMTMtLjIzLTguNTggMi45OC0xMC43My0uNi40NS0uNDggMi4zNS0uNSAyLjlaTTE3OS45IDIxNy43NGEuNDMuNDMgMCAwIDAtLjA0LjAzbC4wNS0uMDNaTTE3NyAyNDIuNjdsLjA4LjA4YS42OS42OSAwIDAgMS0uMDctLjA4Wk0xODguMTUgMjU1LjUyYy0uMi01LjExLTMuNy04Ljk2LTcuOTQtMTEuMzQtLjYtLjM0LTIuNi0uOTMtMy4xMy0xLjQzIDIuOTYgMy4yNCA2LjMyIDYuMjEgOC45NiA5LjczLjQ2LjYgMi4wNiAyLjMgMi4xMSAzLjA0Wk0xODguMTUgMjU1LjU1di0uMDMuMDNaTTIyOS4xNyAxNTMuOGExMS40NSAxMS40NSAwIDAgMSAyLjY3IDMuNyAxMi42MiAxMi42MiAwIDAgMSAuNiAxMGMuMTQtLjUyLS4xNS0xLjQ3LS4zOC0yLjIyLS41NS0xLjc2LTEuMDctMy41LTEuNzYtNS4yMi0xLjE4LTIuOTEtMi4xNC01LjY0LTQuMTgtOC4yLjU0LjY3IDIuMzIgMS4zIDMuMDUgMS45M1pNMTc5LjE1IDQ4LjhhNS43MiA1LjcyIDAgMCAxLS45NyAzLjc1Yy4wOS0uMi0uMTItMS4xLS4yOC0xLjg0LS4zNC0xLjQ3LS4xNC0yLjk2LS4wNC00LjQ3IDAgLjY0IDEuMTggMS43NyAxLjI5IDIuNTdaTTEyNy41NyA1MC4wN2MtLjczIDEuMTYtMiAyLjExLTMuMyAyLjc4LjU4LS4zMyAxLjEtMiAxLjU0LTIuNTUuNzMtLjk0IDEuNjMtMS44NCAyLjU4LTIuNjMtLjIxLjIyLS42MSAyLjA1LS44MyAyLjRaIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ5IDcyKSI+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYyIDg1KSI+PC9nPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=';
          } else {
            merged[i].profileImage ===
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyODAgMjgwIiBmaWxsPSJub25lIiBzaGFwZS1yZW5kZXJpbmc9ImF1dG8iIHdpZHRoPSIxNzAiIGhlaWdodD0iMTcwIj48ZGVzYz4iQXZhdGFhYXJzIiBieSAiUGFibG8gU3RhbmxleSIsIGxpY2Vuc2VkIHVuZGVyICJGcmVlIGZvciBwZXJzb25hbCBhbmQgY29tbWVyY2lhbCB1c2UiLiAvIFJlbWl4IG9mIHRoZSBvcmlnaW5hbC4gLSBDcmVhdGVkIHdpdGggZGljZWJlYXIuY29tPC9kZXNjPjxtZXRhZGF0YSB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpSREY+PGNjOldvcms+PGRjOnRpdGxlPkF2YXRhYWFyczwvZGM6dGl0bGU+PGRjOmNyZWF0b3I+PGNjOkFnZW50IHJkZjphYm91dD0iaHR0cHM6Ly90d2l0dGVyLmNvbS9wYWJsb3N0YW5sZXkiPjxkYzp0aXRsZT5QYWJsbyBTdGFubGV5PC9kYzp0aXRsZT48L2NjOkFnZW50PjwvZGM6Y3JlYXRvcj48ZGM6c291cmNlPmh0dHBzOi8vYXZhdGFhYXJzLmNvbS88L2RjOnNvdXJjZT48Y2M6bGljZW5zZSByZGY6cmVzb3VyY2U9Imh0dHBzOi8vYXZhdGFhYXJzLmNvbS8iIC8+PC9jYzpXb3JrPjwvcmRmOlJERj48L21ldGFkYXRhPjxtYXNrIGlkPSJ2aWV3Ym94TWFzayI+PHJlY3Qgd2lkdGg9IjI4MCIgaGVpZ2h0PSIyODAiIHJ4PSIwIiByeT0iMCIgeD0iMCIgeT0iMCIgZmlsbD0iI2ZmZiIgLz48L21hc2s+PGcgbWFzaz0idXJsKCN2aWV3Ym94TWFzaykiPjxyZWN0IGZpbGw9InVybCgjYmFja2dyb3VuZExpbmVhcikiIHdpZHRoPSIyODAiIGhlaWdodD0iMjgwIiB4PSIwIiB5PSIwIiAvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYmFja2dyb3VuZExpbmVhciIgZ3JhZGllbnRUcmFuc2Zvcm09InJvdGF0ZSgxMTYgMC41IDAuNSkiPjxzdG9wIHN0b3AtY29sb3I9IiM0MTU4RDAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNDODUwQzAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4KSI+PHBhdGggZD0iTTEzMiAzNmE1NiA1NiAwIDAgMC01NiA1NnY2LjE3QTEyIDEyIDAgMCAwIDY2IDExMHYxNGExMiAxMiAwIDAgMCAxMC4zIDExLjg4IDU2LjA0IDU2LjA0IDAgMCAwIDMxLjcgNDQuNzN2MTguNGgtNGE3MiA3MiAwIDAgMC03MiA3MnY5aDIwMHYtOWE3MiA3MiAwIDAgMC03Mi03MmgtNHYtMTguMzlhNTYuMDQgNTYuMDQgMCAwIDAgMzEuNy00NC43M0ExMiAxMiAwIDAgMCAxOTggMTI0di0xNGExMiAxMiAwIDAgMC0xMC0xMS44M1Y5MmE1NiA1NiAwIDAgMC01Ni01NloiIGZpbGw9IiNEMEM2QUMiLz48bWFzayBpZD0ic3R5bGVEZWZhdWx0LWEiIHN0eWxlPSJtYXNrLXR5cGU6YWxwaGEiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjMyIiB5PSIzNiIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNDQiPjxwYXRoIGQ9Ik0xMzIgMzZhNTYgNTYgMCAwIDAtNTYgNTZ2Ni4xN0ExMiAxMiAwIDAgMCA2NiAxMTB2MTRhMTIgMTIgMCAwIDAgMTAuMyAxMS44OCA1Ni4wNCA1Ni4wNCAwIDAgMCAzMS43IDQ0LjczdjE4LjRoLTRhNzIgNzIgMCAwIDAtNzIgNzJ2OWgyMDB2LTlhNzIgNzIgMCAwIDAtNzItNzJoLTR2LTE4LjM5YTU2LjA0IDU2LjA0IDAgMCAwIDMxLjctNDQuNzNBMTIgMTIgMCAwIDAgMTk4IDEyNHYtMTRhMTIgMTIgMCAwIDAtMTAtMTEuODNWOTJhNTYgNTYgMCAwIDAtNTYtNTZaIiBmaWxsPSIjRDBDNkFDIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjc3R5bGVEZWZhdWx0LWEpIj48cGF0aCBmaWxsPSIjZWRiOThhIiBkPSJNMCAzNmgyNjR2MjQ0SDB6Ii8+PHBhdGggZD0iTTc2IDEzMHY4YTU2IDU2IDAgMSAwIDExMiAwdi04YTU2IDU2IDAgMSAxLTExMiAwWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDE3MCkiPjxwYXRoIGQ9Ik0xMzIuNSA1MS44M2MxOC41IDAgMzMuNS05LjYyIDMzLjUtMjEuNDggMC0uMzYtLjAxLS43LS4wNC0xLjA2QTcyIDcyIDAgMCAxIDIzMiAxMDEuMDRWMTEwSDMydi04Ljk1YTcyIDcyIDAgMCAxIDY3LjA1LTcxLjgzYy0uMDMuMzctLjA1Ljc1LS4wNSAxLjEzIDAgMTEuODYgMTUgMjEuNDggMzMuNSAyMS40OFoiIGZpbGw9IiNFNkU2RTYiLz48cGF0aCBkPSJNMTMyLjUgNTguNzZjMjEuODkgMCAzOS42My0xMi4wNSAzOS42My0yNi45MSAwLS42LS4wMi0xLjItLjA4LTEuOC0yLS4zMy00LjAzLS41OS02LjEtLjc2LjA0LjM1LjA1LjcuMDUgMS4wNiAwIDExLjg2LTE1IDIxLjQ4LTMzLjUgMjEuNDhTOTkgNDIuMiA5OSAzMC4zNWMwLS4zOC4wMi0uNzYuMDUtMS4xMy0yLjA2LjE0LTQuMDguMzYtNi4wOC42Ny0uMDcuNjUtLjEgMS4zLS4xIDEuOTYgMCAxNC44NiAxNy43NCAyNi45MSAzOS42MyAyNi45MVoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjE2Ii8+PHBhdGggZD0iTTEwMC43OCAyOS4xMiAxMDEgMjhjLTIuOTYuMDUtNiAxLTYgMWwtLjQyLjY2QTcyLjAxIDcyLjAxIDAgMCAwIDMyIDEwMS4wNlYxMTBoNzRzLTEwLjctNTEuNTYtNS4yNC04MC44bC4wMi0uMDhaTTE1OCAxMTBzMTEtNTMgNS04MmMyLjk2LjA1IDYgMSA2IDFsLjQyLjY2YTcyLjAxIDcyLjAxIDAgMCAxIDYyLjU4IDcxLjRWMTEwaC03NFoiIGZpbGw9IiMzNzk1QkQiLz48cGF0aCBkPSJNMTAxIDI4Yy02IDI5IDUgODIgNSA4Mkg5MEw3NiA3NGw2LTktNi02IDE5LTMwczMuMDQtLjk1IDYtMVpNMTYzIDI4YzYgMjktNSA4Mi01IDgyaDE2bDE0LTM2LTYtOSA2LTYtMTktMzBzLTMuMDQtLjk1LTYtMVoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Im0xODMuNDIgODUuNzcuODctMi4yNCA2LjI3LTQuN2E0IDQgMCAwIDEgNC44NS4wNWw2LjYgNS4xMi0xOC41OSAxLjc3WiIgZmlsbD0iI0U2RTZFNiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OCAxMzQpIj48cGF0aCBkPSJNNDAgMTZjMCA1LjM3IDYuMTYgOSAxNCA5czE0LTMuNjMgMTQtOWMwLTEuMS0uOTUtMi0yLTItMS4zIDAtMS44Ny45LTIgMi0xLjI0IDIuOTQtNC4zMiA0LjcyLTEwIDUtNS42OC0uMjgtOC43Ni0yLjA2LTEwLTUtLjEzLTEuMS0uNy0yLTItMi0xLjA1IDAtMiAuOS0yIDJaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii42Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNCAxMjIpIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDhjMCA0LjQyIDUuMzcgOCAxMiA4czEyLTMuNTggMTItOCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMTYiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzYgOTApIj48cGF0aCBkPSJNMzYgMjJhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDBaTTg4IDIyYTYgNiAwIDEgMS0xMiAwIDYgNiAwIDAgMSAxMiAwWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3NiA4MikiPjxwYXRoIGQ9Ik0xNS42IDE0LjE2YzQuNDktNi4zMiAxNC05LjUgMjMuNzUtNi4zNmEyIDIgMCAxIDAgMS4yMy0zLjgxYy0xMS40MS0zLjY4LTIyLjc0LjEtMjguMjUgNy44NWEyIDIgMCAxIDAgMy4yNiAyLjMyWk05Ni4zOCAyMS4xNmMtMy45Mi01LjUxLTE0LjY1LTguNi0yMy45LTYuMzNhMiAyIDAgMCAxLS45NS0zLjg4YzEwLjc0LTIuNjQgMjMuMTcuOTQgMjguMSA3LjlhMiAyIDAgMSAxLTMuMjUgMi4zWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNiIvPjwvZz48bWFzayBpZD0ic3R5bGVEZWZhdWx0LWIiIHN0eWxlPSJtYXNrLXR5cGU6bHVtaW5hbmNlIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjY0IiBoZWlnaHQ9IjI4MCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyNjR2MjgwSDB6Ii8+PC9tYXNrPjxnIG1hc2s9InVybCgjc3R5bGVEZWZhdWx0LWIpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSkiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ5IDcyKSI+PC9nPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTgwLjE1IDM5LjkyYy0yLjc2LTIuODItNS45Ni01LjIxLTkuMDgtNy42MS0uNjktLjUzLTEuMzktMS4wNS0yLjA2LTEuNi0uMTUtLjEyLTEuNzItMS4yNC0xLjktMS42Ni0uNDUtLjk5LS4xOS0uMjItLjEyLTEuNC4wOC0xLjUgMy4xMy01LjczLjg1LTYuNy0xLS40My0yLjguNy0zLjc1IDEuMDhhNTkuNTYgNTkuNTYgMCAwIDEtNS43MyAxLjljLjkzLTEuODUgMi43LTUuNTctLjYzLTQuNTgtMi42Ljc4LTUuMDMgMi43Ny03LjY0IDMuNy44Ni0xLjQgNC4zMi01LjggMS4yLTYuMDUtLjk4LS4wNy0zLjggMS43NS00Ljg2IDIuMTRhNTUuODEgNTUuODEgMCAwIDEtOS42MyAyLjUxYy0xMS4yIDIuMDItMjQuMyAxLjQ1LTM0LjY1IDYuNTQtOCAzLjkzLTE1Ljg4IDEwLjAzLTIwLjUgMTcuOC00LjQ0IDcuNDgtNi4xIDE1LjY3LTcuMDMgMjQuMjUtLjY5IDYuMy0uNzQgMTIuOC0uNDIgMTkuMTIuMSAyLjA3LjM0IDExLjYxIDMuMzQgOC43MiAxLjUtMS40NCAxLjQ5LTcuMjUgMS44Ny05LjIyLjc1LTMuOTEgMS40Ny03Ljg1IDIuNzItMTEuNjQgMi4yLTYuNjggNC44MS0xMy44IDEwLjMtMTguNCAzLjUzLTIuOTQgNi4wMS02LjkzIDkuMzktOS45IDEuNTEtMS4zNS4zNi0xLjIgMi44LTEuMDMgMS42My4xMiAzLjI4LjE2IDQuOTIuMiAzLjguMSA3LjYuMDggMTEuNC4xIDcuNjQgMCAxNS4yNS4xMiAyMi44OS0uMjggMy40LS4xOCA2LjgtLjI4IDEwLjE4LS42IDEuOS0uMTcgNS4yNS0xLjM4IDYuOC0uNDUgMS40My44NCAyLjkxIDMuNjEgMy45NCA0Ljc1IDIuNDEgMi42NyA1LjMgNC43MiA4LjEyIDYuOTIgNS45IDQuNTcgOC44NyAxMC4zMyAxMC42NiAxNy40OCAxLjc5IDcuMTMgMS4yOSAxMy43NSAzLjUgMjAuNzYuMzggMS4yNCAxLjQgMy4zNiAyLjY3IDEuNDYuMjQtLjM2LjE4LTIuMy4xOC0zLjQyIDAtNC41MiAxLjE0LTcuOTEgMS4xMy0xMi40Ni0uMDYtMTMuODMtLjUtMzEuODctMTAuODUtNDIuNDRaIiBmaWxsPSIjNGYxYTAwIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjIgODUpIj48L2c+PC9nPjwvZz48L2c+PC9nPjwvc3ZnPg==';
          }
        }
        if (!merged[i].hasOwnProperty('jobTitle')) {
          merged[i].jobTitle = '';
        }
        if (!merged[i].hasOwnProperty('location')) {
          merged[i].location = '';
        }
        if (!merged[i].hasOwnProperty('department')) {
          merged[i].department = '';
        }
        if (!merged[i].hasOwnProperty('division')) {
          merged[i].division = '';
        }
        if (
          !merged[i].hasOwnProperty('reportTo') ||
          merged[i].reportTo === null
        ) {
          merged[i]['reportTo'] = {
            employeeId: '',
            reporterId: '',
            reporterName: '',
          };
        }
        for (let j = 0; j < reportTo.length; j++) {
          if (reportTo[j].reporterId === merged[i].employeeId) {
            merged[i].reportersCount++;
          }
        }
      }

      const specialUsersFormatted = []

      const specialUsers: SpecialUser[] = await this.dataSource.query(
        `SELECT "firstName", "lastName", "type", "id"
        FROM special_user WHERE companies @> '[{"companyId": "${companyId}"}]';`
      )

      for (let i=0; i<specialUsers.length; i++) {
        specialUsersFormatted.push({employeeId: specialUsers[i].id, userType: specialUsers[i].type, fullName: { first: specialUsers[i].firstName, middle: "", last: specialUsers[i].lastName }});
      }

      merged = merged.concat(specialUsersFormatted);

      return merged;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeesOrgChart(companyId: string) {
    try {
      const employees = await this.employeeDetailsRepository.find({
        select: ['employeeId'],
        where: { companyId: companyId },
      });

      for (let i = 0; i < employees.length; i++) {
        const jobInfo = employees[i].jobInformation.find(
          (jobInformation) => jobInformation.active === true,
        );
        if (employees[i].employeeId !== jobInfo.reportTo.reporterId) {
          employees[i]['pid'] = jobInfo.reportTo.reporterId;
        } else {
          employees[i]['pid'] = '';
        }
      }
      return employees;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeeById(id: string) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: id },
      });
      if(!employee){

      }
      const hrmUser =  await this.dataSource.query('SELECT * FROM hrm_users WHERE "userId" = $1', [employee.userId]);
      employee['leaveInformation'] = await this.dataSource.query(
        `SELECT b.*, p."name", p."color", p."icon", p."assignees", p."timeUnit", p."approve", p."carryOver", p."allowHalfDay", p."allowNegativeBalance", p."coverupPerson", p."requireUploadFile"
        FROM hrm_leave_balances b
        JOIN hrm_leave_categories p ON b."categoryId" = p."id" AND "employeeId"='${id}'`
      );
      for (let i=0;i<employee['leaveInformation'].length;i++) {
        delete employee['leaveInformation'][i]['assignees'];
        delete employee['leaveInformation'][i]['automaticAccrual'];
      }
      employee['informationRequest'] = await this.dataSource.query(
        `SELECT * FROM hrm_information_request WHERE "employeeId" = $1 AND "status" = 'pending'`,
        [id],
      )
      if(hrmUser[0]?.username){
        employee['username']=hrmUser[0]?.username;
      }
     
      delete employee['password'];
      return employee;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmployeeListById(id: string, companyId) {
    const employees = [];
    const reportTo = {
      employeeId: '',
      reporterId: '',
      reporterName: '',
    };
    try {
      const employee = await this.employeeDetailsRepository.findOne({ where: { employeeId: id }});
      let accessLevelId;
      if (!employee) {
        const specialUser = await this.SpecialUserDetailsRepository.findOne({ 
          where: { id: id }
        });
        
        if (!specialUser) {
          throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        }

        
        const companyEntry = specialUser.companies.find(
          company => company.companyId === companyId 
        );

        if (!companyEntry) {
          throw new HttpException('User not associated with this company!', HttpStatus.FORBIDDEN);
        }

        
        accessLevelId = companyEntry.accessLevelId;
        
      } else {
        accessLevelId = employee.accessLevelId;
      }
      /* employee['leaveInformation'] = await this.dataSource.query(
        `SELECT b.*, p."name", p."color", p."icon", p."assignees", p."timeUnit", p."approve", p."carryOver", p."allowHalfDay", p."allowNegativeBalance", p."coverupPerson", p."requireUploadFile"
        FROM hrm_leave_balances b
        JOIN hrm_leave_categories p ON b."categoryId" = p."id" AND "employeeId"='${id}'`
      );
      for (let i=0;i<employee['leaveInformation'].length;i++) {
        delete employee['leaveInformation'][i]['assignees'];
        delete employee['leaveInformation'][i]['automaticAccrual'];
      } */
      const employeesAll = await this.employeeDetailsRepository.find({ where: { companyId: companyId }});

      const requesterAccessLevel: accessLevels = await this.dataSource.query('SELECT * FROM access_levels WHERE "id" = $1', [accessLevelId]).then(res => res[0]);
      if (true) {
        if (requesterAccessLevel.access.team.profile.all)
         { const employeeIds = await this.employeeDetailsRepository.find({
          select: ['employeeId'], where: { companyId: companyId }
        });
        
        const employeeIdsList = [];
        for (let i = 0; i < employeeIds.length; i++) {
          employeeIdsList.push(employeeIds[i]['employeeId']);
        }
        var uniqEmployeeIds = [...new Set(employeeIdsList)];
        
          for (let i = 0; i < uniqEmployeeIds.length; i++) {
            const employeeTable = employeesAll.find(
              (employee) => employee.employeeId === uniqEmployeeIds[i],
            );
            const jobInformationTable = employeeTable.jobInformation.find(
              (jobInformation) => jobInformation.active === true,
            );

            const employeementStatusTable = employeeTable.employeeStatus.find(
              (employeeStatus) => employeeStatus.active === true,
            ) || { status: '' };
            const employee = {
              employeeId: uniqEmployeeIds[i],
              employeeNo: employeeTable.employeeNo,
              status: employeeTable.status,
              fullName: employeeTable.fullName,
              preferedName: employeeTable.preferedName,
              profileImage: employeeTable.profileImage,
              birthday: employeeTable.birthday,
              gender: employeeTable.gender,
              maritalStatus: employeeTable.maritalStatus,
              hireDate: employeeTable.hireDate,
              ethnicity: employeeTable.ethnicity,
              eeoCategory: employeeTable.eeoCategory,
              shirtSize: employeeTable.shirtSize,
              employementStatus: employeementStatusTable.status,
              jobTitle: '',
              location: '',
              department: '',
              division: '',
            };
            if (jobInformationTable) {
              if (jobInformationTable.jobTitle == null) {
                employee.jobTitle = '';
              } else {
                employee.jobTitle = jobInformationTable.jobTitle;
              }

              if (jobInformationTable.location == null) {
                employee.location = '';
              } else {
                employee.location = jobInformationTable.location;
              }

              if (jobInformationTable.department == null) {
                employee.department = '';
              } else {
                employee.department = jobInformationTable.department;
              }

              if (jobInformationTable.division == null) {
                employee.division = '';
              } else {
                employee.division = jobInformationTable.division;
              }

              const jobInformation = employeeTable.jobInformation;
              jobInformation.forEach((jobInformation) => {
                if (
                  jobInformation.reportTo.reporterId === id &&
                  jobInformation.active === true
                ) {
                  employee['reportTo'] = jobInformation.reportTo;
                }
              });
            } else {
              employee.jobTitle = '';
              employee.location = '';
              employee.department = '';
              employee.division = '';
              employee['reportTo'] = reportTo;
            }
            employees.push(employee);
          }
        } else if (
          requesterAccessLevel.access.team.profile.under
        ) {
          const employeeDetails = employeesAll
          const employeeIdsList = [];
          for (let i = 0; i < employeeDetails.length; i++) {
            const activeJobInformation = employeeDetails[i].jobInformation.find(
              (jobInformation) => jobInformation.active === true,
            );
            if (activeJobInformation && activeJobInformation.reportTo.reporterId === id) {
              employeeIdsList.push(activeJobInformation.reportTo.employeeId);
            }
          }
          const uniqEmployeeIds = [...new Set(employeeIdsList)];
          for (let i = 0; i < uniqEmployeeIds.length; i++) {
            const employeeTable = employeesAll.find((employee) => employee.employeeId === uniqEmployeeIds[i]);

            const jobInformationTable = employeeTable.jobInformation.find(
              (jobInformation) => jobInformation.active === true,
            );

            const employeementStatusTable = employeeTable.employeeStatus.find(
              (employeeStatus) => employeeStatus.active === true,
            ) || { status: '' };

            const employee = {
              employeeId: uniqEmployeeIds[i],
              employeeNo: employeeTable.employeeNo,
              status: employeeTable.status,
              fullName: employeeTable.fullName,
              preferedName: employeeTable.preferedName,
              profileImage: employeeTable.profileImage,
              birthday: employeeTable.birthday,
              gender: employeeTable.gender,
              maritalStatus: employeeTable.maritalStatus,
              hireDate: employeeTable.hireDate,
              ethnicity: employeeTable.ethnicity,
              eeoCategory: employeeTable.eeoCategory,
              shirtSize: employeeTable.shirtSize,
              employementStatus: employeementStatusTable.status,
            };
            if (jobInformationTable) {
              if (jobInformationTable.jobTitle == null) {
                employee['jobTitle'] = '';
              } else {
                employee['jobTitle'] = jobInformationTable.jobTitle;
              }
              if (jobInformationTable.location == null) {
                employee['location'] = '';
              } else {
                employee['location'] = jobInformationTable.location;
              }
              if (jobInformationTable.department == null) {
                employee['department'] = '';
              } else {
                employee['department'] = jobInformationTable.department;
              }
              if (jobInformationTable.division == null) {
                employee['division'] = '';
              } else {
                employee['division'] = jobInformationTable.division;
              }

              const jobInformation = employeeTable.jobInformation;
              jobInformation.forEach((jobInformation) => {
                if (
                  jobInformation.reportTo.reporterId === id &&
                  jobInformation.active === true
                ) {
                  employee['reportTo'] = jobInformation.reportTo;
                }
              });
            } else {
              employee['jobTitle'] = '';
              employee['location'] = '';
              employee['department'] = '';
              employee['division'] = '';
              employee['reportTo'] = reportTo;
            }
            employees.push(employee);
          }
        }
      } else {
      }
      return employees;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  async putEmployeeById(id: string, req: Request) {
    try {
      const data = {
        added: [],
        edited: [],
        old: [],
      };
      const json = {
        FieldName: '',
        Value: '',
      };
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: id },
      });
      if (!employee) { throw new HttpException('Employee not Found!', HttpStatus.BAD_REQUEST) }
      if (req.body.hasOwnProperty('getStarted')) {
        employee.getStarted = req.body['getStarted'];
      }
      if (req.body.hasOwnProperty('whatsappVerify')) {
        employee.whatsappVerify = req.body['whatsappVerify'];
      }
      if (req.body.hasOwnProperty('preferedName')) {
        if (employee.preferedName) {
          json.FieldName = 'preferedName';
          json.Value = req.body['preferedName'];
          data.added.push(json);
        } else if (employee.preferedName !== req.body['preferedName']) {
          json.FieldName = 'preferedName';
          json.Value = req.body['preferedName'];
          data.edited.push(json);
          json.FieldName = 'preferedName';
          json.Value = employee.preferedName;
          data.old.push(json);
        }
        employee.preferedName = req.body['preferedName'];
      }
      if (req.body.hasOwnProperty('profileImage')) {
        if (employee.profileImage === '' || employee.profileImage === null) {
          json.FieldName = 'profileImage';
          json.Value = req.body['profileImage'];
          data.added.push(json);
        } else if (employee.profileImage !== req.body['profileImage']) {
          json.FieldName = 'profileImage';
          json.Value = req.body['profileImage'];
          data.edited.push(json);
          json.FieldName = 'profileImage';
          json.Value = employee.profileImage;
          data.old.push(json);
        }
        employee.profileImage = req.body['profileImage'];
      }
      if (req.body.hasOwnProperty('employeeNo')) {
        if (employee.employeeNo === null) {
          json.FieldName = 'employeeNo';
          json.Value = req.body['employeeNo'];
          data.added.push(json);
        } else if (employee.employeeNo !== req.body['employeeNo']) {
          json.FieldName = 'employeeNo';
          json.Value = req.body['employeeNo'];
          data.edited.push(json);
          json.FieldName = 'employeeNo';
          json.Value = employee.employeeNo.toString();
          data.old.push(json);
        }
        employee.employeeNo = req.body['employeeNo'];
      }
      if (req.body.hasOwnProperty('access')) {
        if (employee.access === null) {
          json.FieldName = 'access';
          json.Value = req.body['access'];
          data.added.push(json);
        } else if (employee.access !== req.body['access']) {
          json.FieldName = 'access';
          json.Value = req.body['access'];
          data.edited.push(json);
          json.FieldName = 'access';
          json.Value = employee.access.toString();
          data.old.push(json);
        }
        employee.access = req.body['access'];
      }
      if (req.body.hasOwnProperty('status')) {
        if (employee.status === '' || employee.status === null) {
          json.FieldName = 'status';
          json.Value = req.body['status'];
          data.added.push(json);
        } else if (employee.status !== req.body['status']) {
          json.FieldName = 'status';
          json.Value = req.body['status'];
          data.edited.push(json);
          json.FieldName = 'status';
          json.Value = employee.status;
          data.old.push(json);
        }
        employee.status = req.body['status'];
      }
      if (req.body.hasOwnProperty('birthday')) {
        if (employee.birthday === '' || employee.birthday === null) {
          json.FieldName = 'birthday';
          json.Value = req.body['birthday'];
          data.added.push(json);
        } else if (employee.birthday !== req.body['birthday']) {
          json.FieldName = 'birthday';
          json.Value = req.body['birthday'];
          data.edited.push(json);
          json.FieldName = 'birthday';
          json.Value = employee.birthday;
          data.old.push(json);
        }
        employee.birthday = req.body['birthday'];
      }
      if (req.body.hasOwnProperty('gender')) {
        if (employee.gender === '' || employee.gender === null) {
          json.FieldName = 'gender';
          json.Value = req.body['gender'];
          data.added.push(json);
        } else if (employee.gender !== req.body['gender']) {
          json.FieldName = 'gender';
          json.Value = req.body['gender'];
          data.edited.push(json);
          json.FieldName = 'gender';
          json.Value = employee.gender;
          data.old.push(json);
        }
        employee.gender = req.body['gender'];
      }
      if (req.body.hasOwnProperty('maritalStatus')) {
        if (employee.maritalStatus === '' || employee.maritalStatus === null) {
          json.FieldName = 'maritalStatus';
          json.Value = req.body['maritalStatus'];
          data.added.push(json);
        } else if (employee.maritalStatus !== req.body['maritalStatus']) {
          json.FieldName = 'maritalStatus';
          json.Value = req.body['maritalStatus'];
          data.edited.push(json);
          json.FieldName = 'maritalStatus';
          json.Value = employee.maritalStatus;
          data.old.push(json);
        }
        employee.maritalStatus = req.body['maritalStatus'];
      }
      if (req.body.hasOwnProperty('passportNumber')) {
        if (
          employee.passportNumber === '' ||
          employee.passportNumber === null
        ) {
          json.FieldName = 'passportNumber';
          json.Value = req.body['passportNumber'];
          data.added.push(json);
        } else if (employee.passportNumber !== req.body['passportNumber']) {
          json.FieldName = 'passportNumber';
          json.Value = req.body['passportNumber'];
          data.edited.push(json);
          json.FieldName = 'passportNumber';
          json.Value = employee.passportNumber;
          data.old.push(json);
        }
        employee.passportNumber = req.body['passportNumber'];
      }
      if (req.body.hasOwnProperty('taxfileNumber')) {
        if (employee.taxfileNumber === '' || employee.taxfileNumber === null) {
          json.FieldName = 'taxfileNumber';
          json.Value = req.body['taxfileNumber'];
          data.added.push(json);
        } else if (employee.taxfileNumber !== req.body['taxfileNumber']) {
          json.FieldName = 'taxfileNumber';
          json.Value = req.body['taxfileNumber'];
          data.edited.push(json);
          json.FieldName = 'taxfileNumber';
          json.Value = employee.taxfileNumber;
          data.old.push(json);
        }
        employee.taxfileNumber = req.body['taxfileNumber'];
      }
      if (req.body.hasOwnProperty('nin')) {
        if (employee.nin === '' || employee.nin === null) {
          json.FieldName = 'nin';
          json.Value = req.body['nin'];
          data.added.push(json);
        } else if (employee.nin !== req.body['nin']) {
          json.FieldName = 'nin';
          json.Value = req.body['nin'];
          data.edited.push(json);
          json.FieldName = 'nin';
          json.Value = employee.nin;
          data.old.push(json);
        }
        employee.nin = req.body['nin'];
      }
      if (req.body.hasOwnProperty('hireDate')) {
        if (employee.hireDate === '' || employee.hireDate === null) {
          json.FieldName = 'hireDate';
          json.Value = req.body['hireDate'];
          data.added.push(json);
        } else if (employee.hireDate !== req.body['hireDate']) {
          json.FieldName = 'hireDate';
          json.Value = req.body['hireDate'];
          data.edited.push(json);
          json.FieldName = 'hireDate';
          json.Value = employee.hireDate;
          data.old.push(json);
        }
        employee.hireDate = req.body['hireDate'];
      }
      if (req.body.hasOwnProperty('ethnicity')) {
        if (employee.ethnicity === '' || employee.ethnicity === null) {
          json.FieldName = 'ethnicity';
          json.Value = req.body['ethnicity'];
          data.added.push(json);
        } else if (employee.ethnicity !== req.body['ethnicity']) {
          json.FieldName = 'ethnicity';
          json.Value = req.body['ethnicity'];
          data.edited.push(json);
          json.FieldName = 'ethnicity';
          json.Value = employee.ethnicity;
          data.old.push(json);
        }
        employee.ethnicity = req.body['ethnicity'];
      }
      if (req.body.hasOwnProperty('eeoCategory')) {
        if (employee.eeoCategory === '' || employee.eeoCategory === null) {
          json.FieldName = 'eeoCategory';
          json.Value = req.body['eeoCategory'];
          data.added.push(json);
        } else if (employee.eeoCategory !== req.body['eeeoCategory']) {
          json.FieldName = 'eeoCategory';
          json.Value = req.body['eeeoCategory'];
          data.edited.push(json);
          json.FieldName = 'eeoCategory';
          json.Value = employee.eeoCategory;
          data.old.push(json);
        }
        employee.eeoCategory = req.body['eeoCategory'];
      }
      if (req.body.hasOwnProperty('shirtSize')) {
        if (employee.shirtSize === '' || employee.shirtSize === null) {
          json.FieldName = 'shirtSize';
          json.Value = req.body['shirtSize'];
          data.added.push(json);
        } else if (employee.shirtSize !== req.body['shirtSize']) {
          json.FieldName = 'shirtSize';
          json.Value = req.body['shirtSize'];
          data.edited.push(json);
          json.FieldName = 'shirtSize';
          json.Value = employee.shirtSize;
          data.old.push(json);
        }
        employee.shirtSize = req.body['shirtSize'];
      }
      if (req.body.hasOwnProperty('allergies')) {
        if (employee.allergies === '' || employee.allergies === null) {
          json.FieldName = 'allergies';
          json.Value = req.body['allergies'];
          data.added.push(json);
        } else if (employee.allergies !== req.body['allergies']) {
          json.FieldName = 'allergies';
          json.Value = req.body['allergies'];
          data.edited.push(json);
          json.FieldName = 'allergies';
          json.Value = employee.allergies;
          data.old.push(json);
        }
        employee.allergies = req.body['allergies'];
      }
      if (req.body.hasOwnProperty('dietaryRestric')) {
        if (
          employee.dietaryRestric === '' ||
          employee.dietaryRestric === null
        ) {
          json.FieldName = 'dietaryRestric';
          json.Value = req.body['dietaryRestric'];
          data.added.push(json);
        } else if (employee.dietaryRestric !== req.body['dietaryRestric']) {
          json.FieldName = 'dietaryRestric';
          json.Value = req.body['dietaryRestric'];
          data.edited.push(json);
          json.FieldName = 'dietaryRestric';
          json.Value = employee.dietaryRestric;
          data.old.push(json);
        }
        employee.dietaryRestric = req.body['dietaryRestric'];
      }
      if (req.body.hasOwnProperty('secondaryLang')) {
        if (employee.secondaryLang === '' || employee.secondaryLang === null) {
          json.FieldName = 'secondaryLang';
          json.Value = req.body['secondaryLang'];
          data.added.push(json);
        } else if (employee.secondaryLang !== req.body['secondaryLang']) {
          json.FieldName = 'secondaryLang';
          json.Value = req.body['secondaryLang'];
          data.edited.push(json);
          json.FieldName = 'secondaryLang';
          json.Value = employee.secondaryLang;
          data.old.push(json);
        }
        employee.secondaryLang = req.body['secondaryLang'];
      }
      if (req.body.hasOwnProperty('vaccinated')) {
        if (employee.vaccinated === null) {
          json.FieldName = 'vaccinated';
          json.Value = req.body['vaccinated'];
          data.added.push(json);
        } else if (employee.vaccinated !== req.body['vaccinated']) {
          json.FieldName = 'vaccinated';
          json.Value = req.body['vaccinated'];
          data.edited.push(json);
          json.FieldName = 'vaccinated';
          json.Value = employee.vaccinated.toString();
          data.old.push(json);
        }
        employee.vaccinated = req.body['vaccinated'];
      }
      if (req.body.hasOwnProperty('doses')) {
        if (employee.doses === null) {
          json.FieldName = 'doses';
          json.Value = req.body['doses'];
          data.added.push(json);
        } else if (employee.doses !== req.body['doses']) {
          json.FieldName = 'doses';
          json.Value = req.body['doses'];
          data.edited.push(json);
          json.FieldName = 'doses';
          json.Value = employee.doses.toString();
          data.old.push(json);
        }
        employee.doses = req.body['doses'];
      }
      if (req.body.hasOwnProperty('reason')) {
        if (employee.reason === '' || employee.reason === null) {
          json.FieldName = 'reason';
          json.Value = req.body['reason'];
          data.added.push(json);
        } else if (employee.reason !== req.body['reason']) {
          json.FieldName = 'reason';
          json.Value = req.body['reason'];
          data.edited.push(json);
          json.FieldName = 'reason';
          json.Value = employee.reason;
          data.old.push(json);
        }
        employee.reason = req.body['reason'];
      }
      employee.modifiedAt = new Date(Date.now());
      await this.employeeDetailsRepository.save(employee);
      if (req.body.hasOwnProperty('email')) {
        if (employee.email === null) {
          json.FieldName = 'email';
          json.Value = req.body['email'];
          data.added.push(json);
        } else if (employee.email !== req.body['email']) {
          json.FieldName = 'email';
          json.Value = req.body['email'];
          data.edited.push(json);
          json.FieldName = 'email';
          json.Value = employee.email.toString();
          data.old.push(json);
        }
        if (req.body['email'].hasOwnProperty('work')) {
          if (employee.email.work === '' || employee.email.work === null) {
            json.FieldName = 'emailWork';
            json.Value = req.body['email']['work'];
            data.added.push(json);
          } else if (employee.email.work !== req.body['email']['work']) {
            json.FieldName = 'emailWork';
            json.Value = req.body['email']['work'];
            data.edited.push(json);
            json.FieldName = 'emailWork';
            json.Value = employee.email.work;
            data.old.push(json);
          }
          employee.email.work = req.body['email']['work'];
        }
        if (req.body['email'].hasOwnProperty('personal')) {
          if (
            employee.email.personal === '' ||
            employee.email.personal === null
          ) {
            json.FieldName = 'emailPersonal';
            json.Value = req.body['email']['personal'];
            data.added.push(json);
          } else if (
            employee.email.personal !== req.body['email']['personal']
          ) {
            json.FieldName = 'emailWork';
            json.Value = req.body['email']['personal'];
            data.edited.push(json);
            json.FieldName = 'emailPersonal';
            json.Value = employee.email.personal;
            data.old.push(json);
          }
          employee.email.personal = req.body['email']['personal'];
        }
      }

      if (req.body.hasOwnProperty('fullName')) {
        if (req.body['fullName'].hasOwnProperty('first')) {
          if (
            employee.fullName.first === '' ||
            employee.fullName.first === null
          ) {
            json.FieldName = 'fullNameFirst';
            json.Value = req.body['fullName']['first'];
            data.added.push(json);
          } else if (
            employee.fullName.first !== req.body['fullName']['first']
          ) {
            json.FieldName = 'fullNameFirst';
            json.Value = req.body['fullName']['first'];
            data.edited.push(json);
            json.FieldName = 'fullNameFirst';
            json.Value = employee.fullName.first;
            data.old.push(json);
          }
          employee.fullName.first = req.body['fullName']['first'];
        }
        if (req.body['fullName'].hasOwnProperty('middle')) {
          if (
            employee.fullName.middle === '' ||
            employee.fullName.middle === null
          ) {
            json.FieldName = 'fullNameMiddle';
            json.Value = req.body['fullName']['middle'];
            data.added.push(json);
          } else if (
            employee.fullName.middle === req.body['fullName']['middle']
          ) {
            json.FieldName = 'fullNameMiddle';
            json.Value = req.body['fullName']['middle'];
            data.edited.push(json);
            json.FieldName = 'fullNameMiddle';
            json.Value = employee.fullName.middle;
            data.old.push(json);
          }
          employee.fullName.middle = req.body['fullName']['middle'];
        }
        if (req.body['fullName'].hasOwnProperty('last')) {
          if (
            employee.fullName.last === '' ||
            employee.fullName.last === null
          ) {
            json.FieldName = 'fullNameLast';
            json.Value = req.body['fullName']['last'];
            data.added.push(json);
          } else if (employee.fullName.last !== req.body['fullName']['last']) {
            json.FieldName = 'fullNameLast';
            json.Value = req.body['fullName']['last'];
            data.edited.push(json);
            json.FieldName = 'fullNameLast';
            json.Value = employee.fullName.last;
            data.old.push(json);
          }
          employee.fullName.last = req.body['fullName']['last'];
        }
      }

      if (req.body.hasOwnProperty('permanentAddress')) {
        if (req.body['permanentAddress'].hasOwnProperty('no')) {
          if (
            employee.permanentAddress.no === '' ||
            employee.permanentAddress.no === null
          ) {
            json.FieldName = 'permanentAddressNo';
            json.Value = req.body['permanentAddress']['no'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.no !== req.body['permanentAddress']['no']
          ) {
            json.FieldName = 'permanentAddressNo';
            json.Value = req.body['permanentAddress']['no'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressNo';
            json.Value = employee.permanentAddress.no;
            data.old.push(json);
          }
          employee.permanentAddress.no = req.body['permanentAddress']['no'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('street')) {
          if (
            employee.permanentAddress.street === '' ||
            employee.permanentAddress.street === null
          ) {
            json.FieldName = 'permanentAddressStreet';
            json.Value = req.body['permanentAddress']['street'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.street !==
            req.body['permanentAddress']['street']
          ) {
            json.FieldName = 'permanentAddressStreet';
            json.Value = req.body['permanentAddress']['street'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressStreet';
            json.Value = employee.permanentAddress.street;
            data.old.push(json);
          }
          employee.permanentAddress.street =
            req.body['permanentAddress']['street'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('streetTwo')) {
          if (
            employee.permanentAddress.streetTwo === '' ||
            employee.permanentAddress.streetTwo === null
          ) {
            json.FieldName = 'permanentAddressStreetTwo';
            json.Value = req.body['permanentAddress']['streetTwo'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.streetTwo !==
            req.body['permanentAddress']['streetTwo']
          ) {
            json.FieldName = 'permanentAddressStreetTwo';
            json.Value = req.body['permanentAddress']['streetTwo'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressStreetTwo';
            json.Value = employee.permanentAddress.streetTwo;
            data.old.push(json);
          }
          employee.permanentAddress.streetTwo =
            req.body['permanentAddress']['streetTwo'];
        }

        if (req.body['permanentAddress'].hasOwnProperty('city')) {
          if (
            employee.permanentAddress.city === '' ||
            employee.permanentAddress.city === null
          ) {
            json.FieldName = 'permanentAddressCity';
            json.Value = req.body['permanentAddress']['city'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.city !==
            req.body['permanentAddress']['city']
          ) {
            json.FieldName = 'permanentAddressCity';
            json.Value = req.body['permanentAddress']['city'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressCity';
            json.Value = employee.permanentAddress.city;
            data.old.push(json);
          }
          employee.permanentAddress.city = req.body['permanentAddress']['city'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('state')) {
          if (
            employee.permanentAddress.state === '' ||
            employee.permanentAddress.state === null
          ) {
            json.FieldName = 'permanentAddressState';
            json.Value = req.body['permanentAddress']['state'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.state !==
            req.body['permanentAddress']['state']
          ) {
            json.FieldName = 'permanentAddressState';
            json.Value = req.body['permanentAddress']['state'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressState';
            json.Value = employee.permanentAddress.state;
            data.old.push(json);
          }
          employee.permanentAddress.state =
            req.body['permanentAddress']['state'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('zip')) {
          if (employee.permanentAddress.zip === null) {
            json.FieldName = 'permanentAddressZip';
            json.Value = req.body['permanentAddress']['zip'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.zip !==
            req.body['permanentAddress']['zip']
          ) {
            json.FieldName = 'permanentAddressZip';
            json.Value = req.body['permanentAddress']['zip'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressZip';
            json.Value = employee.permanentAddress.zip.toString();
            data.old.push(json);
          }
          employee.permanentAddress.zip = req.body['permanentAddress']['zip'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('country')) {
          if (
            employee.permanentAddress.country === '' ||
            employee.permanentAddress.country === null
          ) {
            json.FieldName = 'permanentAddressCountry';
            json.Value = req.body['permanentAddress']['country'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.country !==
            req.body['permanentAddress']['country']
          ) {
            json.FieldName = 'permanentAddressCountry';
            json.Value = req.body['permanentAddress']['country'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressCountry';
            json.Value = employee.permanentAddress.country;
            data.old.push(json);
          }
          employee.permanentAddress.country =
            req.body['permanentAddress']['country'];
        }
        if (req.body['permanentAddress'].hasOwnProperty('accepted')) {
          if (employee.permanentAddress.accepted === null) {
            json.FieldName = 'permanentAddressaccepted';
            json.Value = req.body['permanentAddress']['accepted'];
            data.added.push(json);
          } else if (
            employee.permanentAddress.accepted !==
            req.body['permanentAddress']['accepted']
          ) {
            json.FieldName = 'permanentAddressaccepted';
            json.Value = req.body['permanentAddress']['accepted'];
            data.edited.push(json);
            json.FieldName = 'permanentAddressaccepted';
            json.Value = employee.permanentAddress.accepted.toString();
            data.old.push(json);
          }
          employee.permanentAddress.accepted =
            req.body['permanentAddress']['accepted'];
        }
      }

      if (req.body.hasOwnProperty('phone')) {
        if (req.body['phone'].hasOwnProperty('work')) {
          if (employee.phone.work === '' || employee.phone.work === null) {
            json.FieldName = 'phoneWork';
            json.Value = req.body['phone']['work'];
            data.added.push(json);
          } else if (employee.phone.work !== req.body['phone']['work']) {
            json.FieldName = 'phoneWork';
            json.Value = req.body['phone']['work'];
            data.edited.push(json);
            json.FieldName = 'phoneWork';
            json.Value = employee.phone.work;
            data.old.push(json);
          }
          employee.phone.work = req.body['phone']['work'];
        }
        if (req.body['phone'].hasOwnProperty('mobile')) {
          if (employee.phone.mobile === '' || employee.phone.mobile === null) {
            json.FieldName = 'phoneMobile';
            json.Value = req.body['phone']['mobile'];
            data.added.push(json);
          } else if (employee.phone.mobile !== req.body['phone']['mobile']) {
            json.FieldName = 'phoneMobile';
            json.Value = req.body['phone']['mobile'];
            data.edited.push(json);
            json.FieldName = 'phoneMobile';
            json.Value = employee.phone.mobile;
            data.old.push(json);
          }
          employee.phone.mobile = req.body['phone']['mobile'];
        }
        if (req.body['phone'].hasOwnProperty('code')) {
          if (employee.phone.code === '' || employee.phone.code === null) {
            json.FieldName = 'phoneCode';
            json.Value = req.body['phone']['code'];
            data.added.push(json);
          } else if (employee.phone.code !== req.body['phone']['code']) {
            json.FieldName = 'phoneCode';
            json.Value = req.body['phone']['code'];
            data.edited.push(json);
            json.FieldName = 'phoneCode';
            json.Value = employee.phone.code;
            data.old.push(json);
          }
          employee.phone.code = req.body['phone']['code'];
        }
        if (req.body['phone'].hasOwnProperty('home')) {
          if (employee.phone.home === '' || employee.phone.home === null) {
            json.FieldName = 'phoneHome';
            json.Value = req.body['phone']['home'];
            data.added.push(json);
          } else if (employee.phone.home !== req.body['phone']['home']) {
            json.FieldName = 'phoneHome';
            json.Value = req.body['phone']['home'];
            data.edited.push(json);
            json.FieldName = 'phoneHome';
            json.Value = employee.phone.home;
            data.old.push(json);
          }
          employee.phone.home = req.body['phone']['home'];
        }
      }

      if (req.body.hasOwnProperty('social')) {
        if (req.body['social'].hasOwnProperty('facebook')) {
          if (
            employee.social.facebook === '' ||
            employee.social.facebook === null
          ) {
            json.FieldName = 'socialFacebook';
            json.Value = req.body['social']['facebook'];
            data.added.push(json);
          } else if (
            employee.social.facebook !== req.body['social']['facebook']
          ) {
            json.FieldName = 'socialFacebook';
            json.Value = req.body['social']['facebook'];
            data.edited.push(json);
            json.FieldName = 'socialFacebook';
            json.Value = employee.social.facebook;
            data.old.push(json);
          }
          employee.social.facebook = req.body['social']['facebook'];
        }
        if (req.body['social'].hasOwnProperty('twitter')) {
          if (
            employee.social.twitter === '' ||
            employee.social.twitter === null
          ) {
            json.FieldName = 'socialTwitter';
            json.Value = req.body['social']['twitter'];
            data.added.push(json);
          } else if (
            employee.social.twitter !== req.body['social']['twitter']
          ) {
            json.FieldName = 'socialTwitter';
            json.Value = req.body['social']['twitter'];
            data.edited.push(json);
            json.FieldName = 'socialTwitter';
            json.Value = employee.social.twitter;
            data.old.push(json);
          }
          employee.social.twitter = req.body['social']['twitter'];
        }
        if (req.body['social'].hasOwnProperty('linkedin')) {
          if (
            employee.social.linkedin === '' ||
            employee.social.linkedin === null
          ) {
            json.FieldName = 'socialLinkedin';
            json.Value = req.body['social']['linkedin'];
            data.added.push(json);
          } else if (
            employee.social.linkedin !== req.body['social']['linkedin']
          ) {
            json.FieldName = 'socialLinkedin';
            json.Value = req.body['social']['linkedin'];
            data.edited.push(json);
            json.FieldName = 'socialLinkedin';
            json.Value = employee.social.linkedin;
            data.old.push(json);
          }
          employee.social.linkedin = req.body['social']['linkedin'];
        }
        if (req.body['social'].hasOwnProperty('instagram')) {
          if (
            employee.social.instagram === '' ||
            employee.social.instagram === null
          ) {
            json.FieldName = 'socialInstagram';
            json.Value = req.body['social']['instagram'];
            data.added.push(json);
          } else if (
            employee.social.instagram !== req.body['social']['instagram']
          ) {
            json.FieldName = 'socialInstagram';
            json.Value = req.body['social']['instagram'];
            data.edited.push(json);
            json.FieldName = 'socialInstagram';
            json.Value = employee.social.instagram;
            data.old.push(json);
          }
          employee.social.instagram = req.body['social']['instagram'];
        }
        if (req.body['social'].hasOwnProperty('pinterest')) {
          if (
            employee.social.pinterest === '' ||
            employee.social.pinterest === null
          ) {
            json.FieldName = 'socialPinterest';
            json.Value = req.body['social']['pinterest'];
            data.added.push(json);
          } else if (
            employee.social.pinterest !== req.body['social']['pinterest']
          ) {
            json.FieldName = 'socialPinterest';
            json.Value = req.body['social']['pinterest'];
            data.edited.push(json);
            json.FieldName = 'socialPinterest';
            json.Value = employee.social.pinterest;
            data.old.push(json);
          }
          employee.social.pinterest = req.body['social']['pinterest'];
        }
      }

      if (req.body.hasOwnProperty('temporaryAddress')) {
        if (req.body['temporaryAddress'].hasOwnProperty('no')) {
          if (
            employee.temporaryAddress.no === '' ||
            employee.temporaryAddress.no === null
          ) {
            json.FieldName = 'temporaryAddressNo';
            json.Value = req.body['temporaryAddress']['no'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.no !== req.body['temporaryAddress']['no']
          ) {
            json.FieldName = 'temporaryAddressNo';
            json.Value = req.body['temporaryAddress']['no'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressNo';
            json.Value = employee.temporaryAddress.no;
            data.old.push(json);
          }
          employee.temporaryAddress.no = req.body['temporaryAddress']['no'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('street')) {
          if (
            employee.temporaryAddress.street === '' ||
            employee.temporaryAddress.street === null
          ) {
            json.FieldName = 'temporaryAddressStreet';
            json.Value = req.body['temporaryAddress']['street'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.street !==
            req.body['temporaryAddress']['street']
          ) {
            json.FieldName = 'temporaryAddressStreet';
            json.Value = req.body['temporaryAddress']['street'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressStreet';
            json.Value = employee.temporaryAddress.street;
            data.old.push(json);
          }
          employee.temporaryAddress.street =
            req.body['temporaryAddress']['street'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('city')) {
          if (
            employee.temporaryAddress.city === '' ||
            employee.temporaryAddress.city === null
          ) {
            json.FieldName = 'temporaryAddressCity';
            json.Value = req.body['temporaryAddress']['city'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.city !==
            req.body['temporaryAddress']['city']
          ) {
            json.FieldName = 'temporaryAddressCity';
            json.Value = req.body['temporaryAddress']['city'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressCity';
            json.Value = employee.temporaryAddress.city;
            data.old.push(json);
          }
          employee.temporaryAddress.city = req.body['temporaryAddress']['city'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('state')) {
          if (
            employee.temporaryAddress.state === '' ||
            employee.temporaryAddress.state === null
          ) {
            json.FieldName = 'temporaryAddressState';
            json.Value = req.body['temporaryAddress']['state'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.state !==
            req.body['temporaryAddress']['state']
          ) {
            json.FieldName = 'temporaryAddressState';
            json.Value = req.body['temporaryAddress']['state'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressState';
            json.Value = employee.temporaryAddress.state;
            data.old.push(json);
          }
          employee.temporaryAddress.state =
            req.body['temporaryAddress']['state'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('zip')) {
          if (employee.temporaryAddress.zip === null) {
            json.FieldName = 'temporaryAddressZip';
            json.Value = req.body['temporaryAddress']['zip'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.zip !==
            req.body['temporaryAddress']['zip']
          ) {
            json.FieldName = 'temporaryAddressZip';
            json.Value = req.body['temporaryAddress']['zip'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressZip';
            json.Value = employee.temporaryAddress.zip.toString();
            data.old.push(json);
          }
          employee.temporaryAddress.zip = req.body['temporaryAddress']['zip'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('country')) {
          if (
            employee.temporaryAddress.country === '' ||
            employee.temporaryAddress.country === null
          ) {
            json.FieldName = 'temporaryAddressCountry';
            json.Value = req.body['temporaryAddress']['country'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.country !==
            req.body['temporaryAddress']['country']
          ) {
            json.FieldName = 'temporaryAddressCountry';
            json.Value = req.body['temporaryAddress']['country'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressCountry';
            json.Value = employee.temporaryAddress.country;
            data.old.push(json);
          }
          employee.temporaryAddress.country =
            req.body['temporaryAddress']['country'];
        }
        if (req.body['temporaryAddress'].hasOwnProperty('accepted')) {
          if (employee.temporaryAddress.accepted === null) {
            json.FieldName = 'temporaryAddressAccepted';
            json.Value = req.body['temporaryAddress']['accepted'];
            data.added.push(json);
          } else if (
            employee.temporaryAddress.accepted !==
            req.body['temporaryAddress']['accepted']
          ) {
            json.FieldName = 'temporaryAddressAccepted';
            json.Value = req.body['temporaryAddress']['accepted'];
            data.edited.push(json);
            json.FieldName = 'temporaryAddressAccepted';
            json.Value = employee.temporaryAddress.accepted.toString();
            data.old.push(json);
          }
          employee.temporaryAddress.accepted =
            req.body['temporaryAddress']['accepted'];
        }
      }

      if (req.body.hasOwnProperty('education')) {
        
        const oldEducation = req.body['education'];
        const education = req.body['education'];
        for (let i = 0; i < education.length; i++) {
          if (req.body['education'][i].hasOwnProperty('id')) {
            json.FieldName = 'education';
            json.Value = education[i];
            data.edited.push(json);
            json.FieldName = 'education';
            json.Value = oldEducation[i];
            data.old.push(json);
          } else {
            json.FieldName = 'education';
            json.Value = education[i];
            data.added.push(json);
          }
        }
        employee.education = education;
       
      }

      
      if (req.body.hasOwnProperty('weeklyHourLimit')){
        employee.weeklyHourLimit = req.body['weeklyHourLimit'];
    }

    if (req.body.hasOwnProperty('monthlyHourLimit')){
        employee.monthlyHourLimit = req.body['monthlyHourLimit'];
    }

    if(req.body.hasOwnProperty('nationality')){
        employee.nationality = req.body['nationality'];
    }

    if(req.body.hasOwnProperty('visaDetails')){
        employee.visaDetails = req.body['visaDetails'];
    }

    if(req.body.hasOwnProperty('customFields')){
        employee.customFields = req.body['customFields'];
    }

    if(req.body.hasOwnProperty('attendanceSettings')){
      employee.attendanceSettings = req.body['attendanceSettings'];
    }
    if(req.body.hasOwnProperty('taxDeclaration')){
        employee.taxDeclaration = req.body['taxDeclaration'];
        if (req.body['taxDeclaration'].hasOwnProperty('tfnExemption') && req.body['taxDeclaration']['tfnExemption'] === 'PENDING') {
          employee.taxDeclaration.tfnUpdateDate = format(new Date(), 'yyyy-MM-dd');
        }
    }
    if (req.body.hasOwnProperty('licences')) {  
      
      if (employee.licences === null || employee.licences === undefined) {
        json.FieldName = 'licences';
        json.Value = req.body['licences'];
        data.added.push(json);
      } else if (JSON.stringify(employee.licences) !== JSON.stringify(req.body['licences'])) {
        json.FieldName = 'licences';
        json.Value = req.body['licences'];
        data.edited.push(json);
        json.FieldName = 'licences';
        json.Value = employee.licences;
        data.old.push(json);
      }
      employee.licences = req.body['licences'];
    }
  
    
    await this.timeTrackingService.activityTrackingFunction(req.headers,id, 'EDIT', 'EMP_RECORDS', 'PERSONAL', '', '', '', data, employee.companyId);
    return await this.employeeDetailsRepository.save(employee);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEducationById(id: string, employeeId: string) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId, status: Not('Non Active') },
      });
      employeeDetails.education = employeeDetails.education.filter(
        (education) => education.id !== id,
      );
      await this.employeeDetailsRepository.remove(employeeDetails);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async deleteEmployeeById(id: string, body) {
    try {
      var execute: boolean;
      if (body.hasOwnProperty('execute')) {
        execute = body['execute'];
      } else {
        execute = false;
      }

      if (execute) {
        const employee = await this.employeeDetailsRepository.findOne({
          where: { employeeId: id },
        });
        const superAdminCompanyFeaturesPackage =
          await this.APIService.getActivePackageSuperAdminCompanyFeatures(
            employee.companyId,
          );
        const previousSubscription =
          await this.APIService.getStripeSubscription(
            superAdminCompanyFeaturesPackage.stripeSubscriptionId,
          );
        const items = [];
        const superAdminPackages =
          await this.APIService.getSuperAdminPackagesById(
            superAdminCompanyFeaturesPackage.packageId,
          );
        const employees = await this.employeeDetailsRepository.find({
          where: { companyId: employee.companyId, status: 'Active' },
        });
        for (let i = 0; i < previousSubscription.items.data.length; i++) {
          if (
            previousSubscription.items.data[i].price.product ===
              superAdminPackages.productId &&
            employees.length >
              parseInt(superAdminCompanyFeaturesPackage.defaultUserCount)
          ) {
            items.push({
              id: previousSubscription.items.data[i].id,
              quantity: previousSubscription.items.data[i].quantity - 1,
            });
          }
        }
        const subscription = await this.APIService.updateStripeSubscription(
          superAdminCompanyFeaturesPackage.stripeSubscriptionId,
          items,
          "deleteEmployee"
        );
        employee.status = 'Inactive';
        const notifications: HrmNotifications[] = await this.dataSource.query(
          `SELECT * FROM hrm_notifications WHERE "companyId" = $1`,
          [employee.companyId],
        );
        for (let i=0;i<notifications.length;i++) {
          if (notifications[i].referenceIds.employeeIds.includes(id)) {
            notifications[i].referenceIds.employeeIds = notifications[i].referenceIds.employeeIds.filter(item => item !== id);
          }
        }
        await this.notificationsRepository.save(notifications);
        await this.employeeDetailsRepository.save(employee);
        try { await this.filesRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting files');}
        try { await this.notesRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting notes');}
        try { await this.dataSource.getRepository(AccAssets).createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting assets');}
        try { await this.dataSource.getRepository(AccClaims).createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting claims');}
        try { await this.verificationRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting verifications');}
        try { await this.attendanceRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting attendance');}
        try { await this.boardingTaskEmployeesRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting boarding task');}
        try { await this.performanceTaskRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting performance task');}
        try { await this.TrainingCompleteRepository.createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting completed training');}
        try { await this.dataSource.getRepository(HrmRosterEmployees).createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting rosters');}
        try { await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting timesheetRequests');}
        try { await this.dataSource.getRepository(HrmTimeEntries).createQueryBuilder().delete().where({ employeeId: id }).execute();} catch (error) {console.log(error); console.log('error in deleting timeEntries');}
      }
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postResetUsername(employeeId: string, req: Request) {
    try {
      let employeeDetail: HrmEmployeeDetails;
      try {
        employeeDetail = await this.employeeDetailsRepository.findOne({
          where: { employeeId: employeeId, status: 'Active' },
        });
      } catch (_) {}
      if (!employeeDetail) {
        return { emailUsed: true, isValidEmployee: false }
      }
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
        `SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "email"->>'work'=$2 AND "status"='Active'`,
        [employeeDetail.companyId, req.body.email],
      );
      if (employeeDetails.length !== 0) {
        return { emailUsed: true, isValidEmployee: true }
      }
      const keycloakUser = await this.adminAPI.get(
        `/user?email=${employeeDetail.email.work}`).then((res) => res.data);
      if (!employeeDetail.access && keycloakUser.status === 'INVALID') {
        employeeDetail.email.work = req.body.email;
        await this.employeeDetailsRepository.save(employeeDetail);
      }
      else if (!employeeDetail.access && keycloakUser.status === 'VALID') {
        employeeDetail.email.work = req.body.email;
        await this.employeeDetailsRepository.save(employeeDetail);
        await this.adminAPI.put(
          '/user/username-update', 
          {
            user_id: employeeDetail.userId,
            email: req.body.email
          }
        );
      }
      else if (employeeDetail.access && keycloakUser.status === 'VALID') {
        const token = Math.floor(100000 + Math.random() * 900000).toString();
  
        const usernameVerification = {
          username: req.body.email,
          token,
          canUse: true,
          employeeId,
          type: 'usernameVerification',
        };
        const savedUsernameVerification = await this.verificationRepository.save(
          usernameVerification,
        );
        const url =
          process.env.DOMAIN +
          '/#/username-verify?token=' +
          savedUsernameVerification.id;
        const body = await verificationTemplate(employeeDetail.fullName.first, url);
        const emitBody = { sapCountType:'usernameVerification', companyId: employeeDetail.companyId, subjects: 'Username verification', email: req.body.email, body};
        this.eventEmitter.emit('send.email', emitBody);
      }
      return { emailUsed: false, isValidEmployee: true };
    } catch (error) {
      console.log(error);
      
    }
  }
  async randomNum(length: number) {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var verificationToken = '';
    for (let i = 0; i < length; i++) {
      verificationToken =
        verificationToken + numbers[Math.floor(Math.random() * 10)];
    }

    return verificationToken;
  }
  async postEmergencyContactDummy(employeeId: string, companyId: string) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId,status: Not('Non Active') },
      });
      const stateArr = ['Alabama', 'Alaska', 'Califonia', 'Florida', 'Texas'];
      const cityArr = [
        'Chicago',
        'Austin',
        'San Francisco',
        'Portland',
        'Boston',
        'Seattle',
      ];
      const streetArr = [
        'Leighton Lawn',
        'Lismore Barton',
        'Lon Ty Gwyn',
        'Lakeside Garden',
        'Lapwing Lawn',
        'Lucas Lawn',
        'Lomond Garden',
        'Lewis Lawn',
        'Lon Pendyffryn',
        'Lennox Down',
      ];
      const relationshipArr = ['son', 'brother'];
      const emergencyCount = [1, 2];
      const firstName = [
        'Hope',
        'Bea',
        'Bess',
        'Audie',
        'Dee',
        'Amanda',
        'Ben',
        'Eileen',
        'Willie',
        'Skye',
        'Staum',
        'Addie',
        'Anne',
        'Dave',
        'Dee',
        'Hugh',
        'Loco',
        'Manny',
        'Mark',
        'Reeve',
        'Tex',
        'Theresa',
        'Barry',
        'Stan',
        'Neil',
        'Con',
        'Don',
        'Anna',
        'Clyde',
        'Anna',
        'Norma',
        'Sly',
        'Saul',
        'Faye',
        'Sarah',
      ];
      const lastName = [
        'Moanees',
        'Clether',
        'Goodmate',
        'Meebuggah',
        'Dover',
        'Findit',
        'Blue',
        'Clowd',
        'Minstra',
        'Ortha',
        'Allippa',
        'Zynah',
        'Mannerizorsa',
        'Lyzayta',
        'Jah',
        'Ateer',
        'Ewer',
        'Ryta',
        'Green',
        'Kade',
        'Dupp',
        'Down',
        'Trariweis',
        'Messwidme',
        'Annon',
        'Domino',
        'Stale',
        'Logwatch',
        'Littlical',
        'Absent',
      ];
      let length = Math.floor(Math.random() * emergencyCount.length);
      length = emergencyCount[length];
      for (let i = 0; i < length; i++) {
        let primary = false;
        if (i === 1) {
          primary = true;
        }
        const firstNameIndex = Math.floor(Math.random() * firstName.length);
        const lastNameIndex = Math.floor(Math.random() * firstName.length);
        const relationIndex = Math.floor(Math.random() * firstName.length);
        const stateIndex = Math.floor(Math.random() * firstName.length);
        const cityIndex = Math.floor(Math.random() * firstName.length);
        const streetIndex = Math.floor(Math.random() * firstName.length);
        let dummy = {
          employeeId: employeeId,
          name: firstName[firstNameIndex] + ' ' + lastName[lastNameIndex],
          relationship: relationshipArr[relationIndex],
          primary: primary,
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId: companyId,
          email: {
            email: firstName[firstNameIndex] + '@domain.com',
          },
          address: {
            no: await this.randomNum(2),
            street: streetArr[streetIndex],
            city: cityArr[cityIndex],
            state: stateArr[stateIndex],
            zip: parseInt(await this.randomNum(5)),
            country: 'USA',
          },
          phone: {
            work: parseInt(await this.randomNum(10)),
            mobile: parseInt(await this.randomNum(10)),
            home: parseInt(await this.randomNum(10)),
          },
        };
        employee.emergencyContacts.push(dummy);
        await this.employeeDetailsRepository.save(employee);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOwnerChange(employeeId: string) {
    const employee = await this.employeeDetailsRepository.findOne({
      where: { employeeId: employeeId,status: Not('Non Active') },
    });
    const owner = await this.employeeDetailsRepository.findOne({
      where: { companyId: employee.companyId, owner: true },
    });
    owner.owner = false;
    await this.employeeDetailsRepository.save(owner);
    employee.owner = true;
    await this.employeeDetailsRepository.save(employee);
    const user = await this.dataSource.query(
      'SELECT * FROM hrm_users WHERE "userId"=$1',
      [employee.userId],
    ).then((res) => res[0]);
    await this.APIService.updateStripeCustomerEmail(
      employee.companyId,
      user.username,
    );
    const common = await this.commonRepository.find({
      where: { companyId: employee.companyId },
    });
    const ADMINACCESS = common.find(
      (access) => access.data.accessLevelType === 'FULL_ADMIN',
    );
    if (employee.accessLevelId === ADMINACCESS.id) {
    } else {
      const approvalsAll = await this.commonRepository.find({
        where: { companyId: employee.companyId },
      });
      const employeeApprovals = employee.approvals;
      employee.approvals = employeeApprovals;
      employee.accessLevelId = ADMINACCESS.id;
      await this.employeeDetailsRepository.save(employee);
    }
    return { statusCode: 200, description: 'success' };
  }

  async changeProfileImage(
    files: Array<Express.Multer.File>,
    employeeId,
    req: Request,
  ) {
    try {
      const data = {
        added: [],
        edited: [],
        old: [],
      };
      const json = {
        FieldName: '',
        Value: '',
      };
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
      json.FieldName = 'profileImage';
      json.Value = employee.profileImage;
      data.old.push(json);
      const company = await this.APIService.getCompanyById(employee.companyId);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = files[0].mimetype.split('/')[1];
      const originalName = files[0].originalname.split('.')[0];
      files[0].originalname =
        originalName + '-' + uniqueSuffix + '.' + fileExtension;
      files[0].buffer = await this.ImageCompressorService.compressImageBuffer(
        files[0].buffer,
      );
      files[0].size = files[0].buffer.byteLength;
      let s3Response = await this.s3Service.uploadUserProfiles(
        files[0],
        company.companyName,
      );
      employee.modifiedAt = new Date();
      employee.profileImage = s3Response['key'];
      json.Value = employee.profileImage;
      data.edited.push(json);
      await this.employeeDetailsRepository.save(employee);
      await this.timeTrackingService.activityTrackingFunction(
        req.headers,
        employeeId,
        'EDIT',
        'EMP_RECORDS',
        'PERSONAL',
        '',
        '',
        '',
        data,
        employee.companyId,
      );
      return { statusCode: 200, description: 'success' };
    } catch (error) {
      console.log(error);
    }
  }

  async setWhatsappVerification(req: Request, companyId) {
    let form = {
      canUse: true,
      token: Math.floor(100000 + Math.random() * 900000),
      companyId: companyId,
      type: 'whatsappVerification',
      userName: req.body.phoneNumber,
      employeeId: req.body.employeeId
    };

    try {
      const res =   await this.dataSource.query(
        'INSERT INTO hrm_verification ("username","token","employeeId","type","canUse","companyId")  VALUES ($1,$2,$3,$4,$5,$6) RETURNING id ',
        [form.userName,form.token,form.employeeId,form.type,form.canUse,form.companyId],
      );
      return { statusCode: 200, description: 'success' };
    } catch (error) {
      console.log(error);
    }
  }
  async updateWhatsappVerification(req: Request) {
    try {
      const resVerifications = await this.dataSource.query('SELECT * FROM hrm_verification WHERE "employeeId"=$1 ', [req.body.employeeId])
      return { statusCode: 200, description: 'success' };
    } catch (error) {
      console.log(error);
    }
  }
  async postChangeEmployeeStatus(body: any){
    try {
      const employee: HrmEmployeeDetails = await this.dataSource.query('SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 ', [body.employeeId]).then((res) => res[0]);
      const employees: HrmEmployeeDetails[] = await this.dataSource.query('SELECT * FROM hrm_employee_details WHERE "companyId"=$1 ', [employee.companyId]);
      const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1 ', [employee.companyId]);
      employee.status = body.status;
      if(employee.status === 'Active'){
        employee.access = true;
      }
      if (body.transferId) {
        for (let i=0; i < employees.length; i++) {
          const activeJobInfo = employees[i].jobInformation.find((j) => j.active === true);
          const jobInfoArray = employees[i].jobInformation.filter((j) => j.active === false);
          activeJobInfo.reportTo.reporterId = body.transferId;
          jobInfoArray.push(activeJobInfo);
        }
        const MANAGERACCESS = accessLevels.find((access) => access.accessLevelType === 'MANAGER');
        const EMPLOYEEACCESS = accessLevels.find((access) => access.accessLevelType === 'EMPLOYEE');
        const transferEmp = employees.find((e) => e.employeeId === body.transferId);
        if (transferEmp.accessLevelId === EMPLOYEEACCESS.id) {
        }
        if (employee.accessLevelId === MANAGERACCESS.id) {
          let reporterCount = 0;
          const employeeDetails = employees.filter((e) => e.status !== 'Non Active');
          for (let i = 0; i < employeeDetails.length; i++) {
            const activeJobInformation = employeeDetails[i].jobInformation.find((jobInfo) => jobInfo.active === true);
            if (activeJobInformation.reportTo.reporterId === employee.employeeId) {
              reporterCount ++;
            }
          }
          
          if (reporterCount === 0) {
            employee.accessLevelId = EMPLOYEEACCESS.id;
          }
        }

      }
      else {
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
      await this.employeeDetailsRepository.save(employee);
    } catch (error) {
      console.log(error);
    }
  }


  async getProfile(userId: string) {
    try {
      let person;
      let accounts = [];
      const jsonRes = {};
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "userId"=$1',
        [userId],
      );
       if(employeeDetails.length === 0){
        jsonRes['accounts'] = accounts;
        return (jsonRes)
       }
      const companies = await this.APIService.getAllCompanies();
      for (let i=0;i<employeeDetails.length;i++) {
        const company = companies.find((c) => c.id === employeeDetails[i].companyId);
        const json = {}
        json['employeeId'] = employeeDetails[i].employeeId;
        json['companyId'] = employeeDetails[i].companyId;
        json['companyName'] = company.companyName;
        json['heroLogo'] = company.heroLogoUrl;
        json['hasAccess'] = employeeDetails[i].access;
        accounts.push(json);
      }
      person = employeeDetails.find((e) => e.access === true);
      if (!person && employeeDetails.length !== 0) {
        person = employeeDetails[0];
      }
     
      
        const jonInformation = (person?.jobInformation || []).find((jobInfo) => jobInfo.active === true) || {jobTitle : ''};

        const company = companies.find((c) => c.id === person.companyId);
        jsonRes['employeeId'] = person.employeeId;
        jsonRes['profileImage'] = person.profileImage;
        jsonRes['employeeNo'] = person.employeeNo;
        jsonRes['employeeName'] = person.fullName.first + ' ' + person.fullName.last;
        jsonRes['role'] = jonInformation.jobTitle;
        jsonRes['companyId'] = company.id;
        jsonRes['companyName'] = company.companyName;
        jsonRes['theme'] = company.theme;
        jsonRes['createdAt'] = person.createdAt;
        jsonRes['accounts'] = accounts;

         return (jsonRes);

    
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getDummyJsondata(Type?: string){
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      });
      const params = {
        Bucket: 'resource.romeohr.com',
        Key: 'common/Dummy_Test.json',
      };
      if (process.env.PRODUCTION === 'true') {
        params.Key = 'common/Dummy.json';
      }
      const data = await s3
        .getObject(params)
        .promise()
        .then((data) => {
          return JSON.parse(data.Body.toString());
        });
      if(typeof Type !== 'undefined'){
        return data[Type];
      }
      return data;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDummyPayrollData(companyId: string, country: string) {
    const dummyPayrollData = await this.getDummyJsondata('data');
    // const dummyPayrollData = dummyData['data'];

  try {
    
    dummyPayrollData.companyId = companyId;

    
    const payrollPayPeriods = dummyPayrollData['payrollPayPeriods'].map(payPeriod => ({
      ...payPeriod,
      companyId: companyId
    }));

    const payrollAccounts = dummyPayrollData['payrollAccounts'].map(account => ({
      ...account,
      companyId: companyId
    }));

    const payrollEarnings = dummyPayrollData['payrollEarnings'].map(earning => ({
      ...earning,
      companyId: companyId
      
    }));

    const payrollDeductions = dummyPayrollData['payrollDeductions'].map(deduction => ({
      ...deduction,
      companyId: companyId
      
    }));

    const payrollReimbursement = dummyPayrollData['payrollReimbursements'].map(reimbursement => ({
      ...reimbursement,
      companyId: companyId
      
    }));

    
    const payrollRecord = {
      type: "CompanyCreate",
      data: {
        payrollPayPeriods: payrollPayPeriods,
        payrollAccounts: payrollAccounts,
        payrollEarnings: payrollEarnings,
        payrollDeductions: payrollDeductions,
        payrollReimbursements: payrollReimbursement
      },
      companyId,
    }
    if (country === 'Sri Lanka') {
      payrollRecord.data["payrollCompanyAccounts"] = {
        accountName: "slTax",
        accountCode: "477",
        accountType: "SLTAX",
        data: {
          taxBrackets:[]
        },
        companyId: companyId,
      }
    }
    //payslip cid,eid
    const response = await this.PayrollAPI.post('/payroll/event-listener', payrollRecord);
    return {
      message: 'Dummy payroll data saved successfully.',
      code: 201,
    };
  } catch (error) {
    console.error('Error saving dummy payroll data:', error);
    throw new HttpException('Failed to save dummy payroll data', HttpStatus.BAD_REQUEST);
  }
}

  async postEmployment(@Body() body, companyId: string, employeeId: string) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId,status: Not('Non Active') },
      });
  
      
  
      const employmentChanges = {
        type: "Employment",
        changedBy: "", 
        employeeId: employeeId,
        data: [],
      };
    
    const currentPayrollCalendar = employeeDetails.payrollEmployment?.payrollCalendar || "";
    const newPayrollCalendar = body.payrollCalendar;
  
    if (newPayrollCalendar) {
      if (currentPayrollCalendar) {
        // If current payrollCalendar exists and is different, it's update
        if (currentPayrollCalendar !== newPayrollCalendar) {
          employmentChanges.data.push({
            method: "update",
            fieldName: "payrollCalendar",
            preValue: currentPayrollCalendar,
            currentValue: newPayrollCalendar,
          });
        }
      } else {
        // If no current payrollCalendar exists, it's add
        employmentChanges.data.push({
          method: "add",
          fieldName: "payrollCalendar",
          preValue: "",
          currentValue: newPayrollCalendar,
        });
      }
      console.log('employmentChanges',employmentChanges)
    }
    const currentStartDate = employeeDetails.payrollEmployment?.startDate || "";
    const newStartDate = body.startDate;
  
    if (newStartDate) {
      if (currentStartDate) {
        // If current startDate exists and is different, it's an update
        if (currentStartDate !== newStartDate) {
          employmentChanges.data.push({
            method: "update",
            fieldName: "startDate",
            preValue: currentStartDate,
            currentValue: newStartDate,
          });
        }
      } else {
        // If no current startDate exists, it's an addition
        employmentChanges.data.push({
          method: "add",
          fieldName: "startDate",
          preValue: "",
          currentValue: newStartDate,
        });
      }
  
    }
      let salaryDetails = new payrollEmploymentDto();
      let activate = false;
      if (body.hasOwnProperty('active')) {
        activate = body.active;
        salaryDetails.active = body.active;
      }
      if (activate) {
        if (body.hasOwnProperty('startDate')) {
          salaryDetails.startDate = body.startDate;
        }
        salaryDetails.payrollCalendar = '';
       
        if (body.hasOwnProperty('employeeGroup')) {
          salaryDetails.employeeGroup = body.employeeGroup;
        }
        if (body.hasOwnProperty('holidayGroup')) {
          salaryDetails.holidayGroup = body.holidayGroup;
        }
        if (body.hasOwnProperty('includePayslip')) {
          salaryDetails.includePayslip = body.includePayslip;
        }
        if (body.hasOwnProperty('superannuationMemberships')) {
          salaryDetails.superannuationMemberships =
            body.superannuationMemberships;
        }
        if (body.hasOwnProperty('epfEtfMemberships')) {
          salaryDetails.epfEtfMemberships = body.epfEtfMemberships;
        }
        if (body.hasOwnProperty('bankAccounts')) {
          salaryDetails.bankAccounts = body.bankAccounts;
        }
        if (body.hasOwnProperty('employeeAward')) {
          salaryDetails.employeeAward = body.employeeAward;
        }
        if (body.hasOwnProperty('employeeAwardLevel')) {
          salaryDetails.employeeAwardLevel = body.employeeAwardLevel;
        }
        if (body.hasOwnProperty('employeeAwardPayrateId')) {
          salaryDetails.employeeAwardPayrateId = body.employeeAwardPayrateId;
        }
        if (body.hasOwnProperty('employeeAwardPayrate')) {
          salaryDetails.employeeAwardPayrate = body.employeeAwardPayrate;
        }
        if (body.hasOwnProperty('employeeAwardCalculateRate')) {
          salaryDetails.employeeAwardCalculateRate = body.employeeAwardCalculateRate;
        }
        if (body.hasOwnProperty('employeeAwardPayrateType')) {
          salaryDetails.employeeAwardPayrateType = body.employeeAwardPayrateType;
        }
    
        employeeDetails.payrollEmployment = salaryDetails;
        await this.employeeDetailsRepository.save(employeeDetails);
      }
      const response = await this.PayrollAPI.post('/payroll/event-listener', employmentChanges);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async putEmployment(@Body() body, employeeId: string) {
    try {
      let employeeDetail: employeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1 AND "status" != $2',
        [employeeId, 'Non Active'],
      ).then((res) => res[0]);
      if (employeeDetail) {
        let salaryDetails = employeeDetail.payrollEmployment;
        if (body.hasOwnProperty('startDate')) {
          salaryDetails.startDate = body.startDate;
        }
        if (body.hasOwnProperty('payrollCalendar')) {
          salaryDetails.payrollCalendar = body.payrollCalendar;
        }
        if (body.hasOwnProperty('employeeGroup')) {
          salaryDetails.employeeGroup = body.employeeGroup;
        }
        if (body.hasOwnProperty('holidayGroup')) {
          salaryDetails.holidayGroup = body.holidayGroup;
        }
        if (body.hasOwnProperty('includePayslip')) {
          salaryDetails.includePayslip = body.includePayslip;
        }
        if (body.hasOwnProperty('superannuationMemberships')) {
          salaryDetails.superannuationMemberships =
            body.superannuationMemberships;
        }
        if (body.hasOwnProperty('epfEtfMemberships')) {
          salaryDetails.epfEtfMemberships = body.epfEtfMemberships;
        }
        if (body.hasOwnProperty('bankAccounts')) {
          salaryDetails.bankAccounts = body.bankAccounts;
        }
        if (body.hasOwnProperty('isTerminated')) {
          salaryDetails.isTerminated = body.isTerminated;
        }
        if (body.hasOwnProperty('terminationDate')) {
          salaryDetails.terminationDate = body.terminationDate;
        }
        if (body.hasOwnProperty('terminationReasonCode')) {
          salaryDetails.terminationReasonCode = body.terminationReasonCode;
        }
        if (body.hasOwnProperty('averageEarnings')) {
          salaryDetails.averageEarnings = body.averageEarnings;
        }

        if (body.hasOwnProperty('employeeAward')) {
          salaryDetails.employeeAward = body.employeeAward;
        }
        if (body.hasOwnProperty('employeeAwardLevel')) {
          salaryDetails.employeeAwardLevel = body.employeeAwardLevel;
        }
        if (body.hasOwnProperty('employeeAwardPayrateId')) {
          salaryDetails.employeeAwardPayrateId = body.employeeAwardPayrateId;
        }
        if (body.hasOwnProperty('employeeAwardPayrate')) {
          salaryDetails.employeeAwardPayrate = body.employeeAwardPayrate;
        }
        if (body.hasOwnProperty('employeeAwardCalculateRate')) {
          salaryDetails.employeeAwardCalculateRate = body.employeeAwardCalculateRate;
        }
        if (body.hasOwnProperty('employeeAwardPayrateType')) {
          salaryDetails.employeeAwardPayrateType = body.employeeAwardPayrateType;
        }
        
        employeeDetail.payrollEmployment = salaryDetails;
        return await this.employeeDetailsRepository.save(employeeDetail);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getEmployment(id: string, employeeId: string) {
    try {
      let employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId, status: Not('Non Active') },
      });
  
      return employee.payrollEmployment;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getSalaryDetailByEmployee(companyId: string, employeeId: string) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: employeeId,status: Not('Non Active') },
      });
      if (employee.payrollEmployment === null) {
        const salaryDetails = {
          startDate: '',
          payrollCalendar: '',
          employeeGroup: '',
          holidayGroup: '',
          includePayslip: false,
          superannuationMemberships: [],
          epfEtfMemberships: [],
          employeeId: '',
          active: false,
        };
        return salaryDetails;
      }
  
      return employee.payrollEmployment;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAtlasAddress(query: string, countryCode: string) {
    try {
      const res = await this.AtlasAPI.get(
        `search/address/json?api-version=1.0&query=${encodeURIComponent(
          query,
        )}&subscription-key=${process.env.ADDRESS_API_KEY}&limit=5&countrySet=${countryCode}`,
      )
      return res.data;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  async postResetPassword(employeeId: string, username: string) {
    try {
      const employee: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
        [employeeId],
      ).then(res => res[0]);
      console.log("employee",employee);
      
      const password = await this.adminAPI.post('/user/reset', {user_id: employee.userId}).then((res) => res.data.password);
      const body = await accountCreationTemplate(employee.fullName.first, username, password);
      const emitBody = { sapCountType:'accountCreation', companyId: employee.companyId, subjects: 'account created successfully', email: username, body};
      this.eventEmitter.emit('send.email', emitBody);
      return {
        description: "Email resent successfully"
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }



  async hireEmployee(employeeData: any) {
    try {
      const { basic, address, access, userId ,companyId,candidateId} = employeeData; //candidateId
      const id = candidateId
      const accessLevel = 'EMPLOYEE';
      const employeeId = uuidv4();
      const education = employeeData.education || [];
      //const accesslevel: accessLevels = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId" = $1 AND "accessLevelType" = $2', [companyId, accessLevel]).then(res => res[0]);
      //console.log(accesslevel.id)
      const personal = {
        employee: {
          employeeNo: 0,
          username: basic.email,
          password: employeeData.password, 
          access: access,
          status: 'Active',
          hireDate: basic.hireDate,
          gender: basic.gender,
          userId: userId,
          owner: false,
          preferedName: '',
          birthday: '',
          maritalStatus: '',
          passportNumber: '',
          taxfileNumber: '',
          nin: '',
          ethnicity: '',
          eeoCategory: '',
          shirtSize: '',
          allergies: '',
          dietaryRestric: '',
          secondaryLang: '',
          vaccinated: false,
          doses: 0,
          reason: '',
          terminationDate: '',
          online: false,
          profileImage: '',
          //accessLevelId: accesslevel.id,
        },
        education,
        fullName: {
          first: basic.firstName,
          middle: '',
          last: basic.lastName
        },
         
        address: {
          permenent: {
            ...address,
            accepted: true
          },
          temporary: {
            no: '',
            street: '',
            city: '',
            state: '',
            zip: 0,
            country: '',
            period: '',
            accepted: false
          }
        },
        phone: {
          work: '',
          mobile: basic.phoneNumber || '',
          code: '',
          home: '',
          mobileVerified: true
        },
        email: {
          work: basic.email,
          personal: ''
        },
        social: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          pinterest: ''
        },
        
        payroll: {
          active: false
        }
      };
      //console.log('Education:', personal.education);

      const savedEmployees = await this.postEmployee(
        userId,
        personal.employee,
        companyId,
        accessLevel,
        false,
        {
          personal,
          education: [], 
        },
        true,
        false,
      );

      let candidate = await this.candidateRepository.findOneBy({ id });
      if (!candidate) {
          throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND);
      }
    
      const activities = [...candidate.activities || []];


      candidate.activities.push({
        activity: 'Candidate hired',
        type: 'HIRED', 
        status: '',
        rate: candidate.rate || 0 ,
        editorId: userId,
        employeeId:savedEmployees.id
      });

      await this.candidateRepository.save(candidate);

      /* console.log("activities",activities)
       console.log("savedEmployees",savedEmployees.id) */

      const jobData = { 
        ...employeeData.job, 
        employeeId: savedEmployees.id,
      };

      const jobResponse = await this.postJobInformation(
        {...employeeData.job}, savedEmployees.id);
      /* const jobResponse = await this.jobInformationService.postJobInformation(
        { body: jobData }, 
        companyId,
        
      ); */

      return {
       message:"sucessfully created employee"
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('Error while creating employee!', HttpStatus.BAD_REQUEST);
    }
  }



  
  async getUsernameVerified(id: string) {
    const verification = await this.dataSource.query(
      'SELECT * FROM hrm_verification WHERE "id"=$1',
      [id],
    ).then(res => res[0]);
    return verification;
  }

  async putUsernameVerified(id: string, body: {token: string}) {
    try {
      let status = 'invalid link'
      const verification: HrmVerification = await this.dataSource.query(
        'SELECT * FROM hrm_verification WHERE "id"=$1',
        [id],
      ).then(res => res[0]);
      if (verification && verification.token === body.token && verification.canUse) {
        const employee: HrmEmployeeDetails = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
          [verification.employeeId],
        ).then(res => res[0]);
        const updatedKeycloak = await this.adminAPI.put(
          '/user/username-update', 
          {
            user_id: employee.userId,
            email: verification.username
          }
        ).then((res) => res.data.status);
        if (updatedKeycloak) {
          employee.email.work = verification.username;
          verification.canUse = false;
          await this.dataSource.getRepository(HrmEmployeeDetails).save(employee);
          await this.dataSource.getRepository(HrmVerification).save(verification);
          status = "updated keycloak user"
        }
      }
      return {status};
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async findUserById(id: string) {
    const employee: HrmEmployeeDetails = await this.dataSource.query(
      'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
      [id],
    ).then(res => res[0]);
    if (employee) {
      return true;
    }
    return false;
  }


  async deleteValidation(employeeId: string) {
    let data = {
      jobInformation: [],
      appraisal: [],
      hiring: [],
      attendance: [],
      leaveRequests: [],
      canDelete: true
    };
    const appraisal: getAppraisalDto[] = await this.dataSource.query(
        `SELECT * FROM appraisal WHERE "managerId"='${employeeId}'`,
      )
    const hiring = await this.dataSource.query(
      `SELECT * FROM hrm_hiring WHERE "type"='hrm_hiring_job' AND data->>'hiringLead'='${employeeId}'`,
    )
    const jobInformation = await this.dataSource.query(
      `
      SELECT jsonb_agg(job_info) AS jobInformation
      FROM hrm_employee_details,
          jsonb_array_elements("jobInformation") AS job_info
      WHERE job_info->'reportTo'->>'reporterId' = $1
      `,
      [employeeId],
    ).then(res => res[0].jobinformation);

    const attendance: HrmAttendance[] = await this.dataSource.query(
      `SELECT * FROM hrm_attendance WHERE "employeeId"='${employeeId}'`,
    );

    const leaveRequests: HrmLeaveRequests[] = await this.dataSource.query(
      `SELECT * FROM hrm_leave_requests WHERE "employeeId"='${employeeId}'`,
    );

    if (appraisal) {
      data.appraisal = appraisal;
    }
    if (hiring) {
      data.hiring = hiring;
    }
    if (jobInformation) {
      data.jobInformation = jobInformation;
    }
    if (attendance) {
      data.attendance = attendance;
    }
    if (leaveRequests) {
      data.leaveRequests = leaveRequests;
    }
    if (appraisal && appraisal.length > 0 ||
        hiring && hiring.length > 0 ||
        jobInformation && jobInformation.length > 0 ||
        attendance && attendance.length > 0 ||
        leaveRequests && leaveRequests.length > 0) {
      data.canDelete = false;
    }

    return data;
  }

  async changeSupervisor(from: string, to: string, companyId: string) {
    const company = await this.APIService.getCompanyById(companyId);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const setCompanyTimezone = moment(new Date()).parseZone().tz(timezone, true).toISOString(true);
    const dateNow = formatInTimeZone(setCompanyTimezone, company.timezone, 'yyyy-MM-dd HH:mm:ss zzz', { locale: enGB }).slice(0,19);

    const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
      `SELECT * FROM hrm_employee_details 
       WHERE "companyId" = $1 
       AND EXISTS (
         SELECT 1 
         FROM jsonb_array_elements("jobInformation") as job
         WHERE (
           (job->>'active')::boolean = true 
           OR (
             (job->>'active')::boolean = false 
             AND (job->>'effectiveDate')::timestamp > $3
           )
         )
         AND job->'reportTo'->>'reporterId' = $2
       )`,
      [companyId, from, dateNow]
    );
    const appraisals: Appraisal[] = await this.dataSource.query(
      `SELECT * FROM appraisal WHERE "companyId"=$1`,
      [companyId],
    );
    const hirings: hrmHiring[] = await this.dataSource.query(
      `SELECT * FROM hrm_hiring WHERE "type"='hrm_hiring_job' AND "companyId"=$1`,
      [companyId],
    )

    for (let i=0; i< employeeDetails.length; i++) {
      for (let j=0; j< employeeDetails[i].jobInformation.length; j++) {
        if (employeeDetails[i].jobInformation[j].reportTo.reporterId === from) {
          employeeDetails[i].jobInformation[j].reportTo.reporterId = to;
        }
      }
    }
    for (let i=0; i< appraisals.length; i++) {
      if (appraisals[i].managerId === from) {
        appraisals[i].managerId = to;
      }
    }
    for (let i=0; i< hirings.length; i++) {
      if (hirings[i].data.hiringLead === from) {
        hirings[i].data.hiringLead = to;
      }
    }
    await this.dataSource.getRepository(HrmEmployeeDetails).save(employeeDetails);
    await this.dataSource.getRepository(Appraisal).save(appraisals);
    await this.dataSource.getRepository(hrmHiring).save(hirings);

    return { statusCode: 200, description: 'success' };
  }
  
  async generatePayrollId(employeeId: string) {
    const employee: HrmEmployeeDetails = await this.dataSource.query(
      'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
      [employeeId],
    ).then(res => res[0]);
    employee.payrollId = uuidv4();
    await this.dataSource.getRepository(HrmEmployeeDetails).save(employee);
    return { payrollId: employee.payrollId };

  }

  async complianceReminder(employeeId, complianceId) {

    try{
      const result = await this.employeeDetailsRepository.query(`
        SELECT 
          "licences"->${complianceId} AS "licence_item",
          "fullName" ->> 'first' AS "firstName",
          "email" ->> 'work' AS "userName",
          "companyId"
        FROM "hrm_employee_details"
        WHERE "employeeId" = $1
      `, [employeeId]);
      
      
      if (!result[0]?.licence_item) {
        return { message: "License not found for this compliance ID" };
      }
      
      const licenseData = result[0].licence_item;
      const companyId = result[0]?.companyId;
      const licenseType = licenseData?.licenseType;
      const expireDate = licenseData?.expireDate;
      const firstName = result[0]?.firstName;
      const email = result[0]?.userName;
      
      console.log(companyId, licenseType, expireDate, firstName, email);
      
      const body = await complianceEmailTemplate(licenseType, expireDate, firstName);
      const emitBody = {
        sapCountType: 'complianceReminder',
        companyId,
        subjects: 'Compliance Reminder',
        email: email,
        body
      };
      
      this.eventEmitter.emit('send.email', emitBody);
      return { message: "Email sent successfully" };
    }catch(error){
      console.log(error);
    }
    
    
  }
}
