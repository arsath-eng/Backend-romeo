
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
const jwt = require('jsonwebtoken')
import { InjectRepository,InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { CognitoUserPool} from 'amazon-cognito-identity-js';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { add, addDays, format, subDays } from 'date-fns';
const dnsPromises = require('dns').promises;
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { S3Service } from '@flows/s3/service/service';
import { AttendanceService } from '@flows/attendance/service/attendance.service';
import { EmploymentStatusesService } from '@flows/settingsEmployeeFeildsEmploymentStatuses/service/service';
import { DepartmentService } from '@flows/settingsEmployeeFeildsDepartment/service/service';
import { LocationsService } from '@flows/settingsEmployeeFeildsLocations/service/service';
import { DivisionService } from '@flows/settingsEmployeeFeildsDivision/service/service';
// import { TrainingService } from '@flows/training/service/service';
import { CelebrationsService } from '@flows/celebrations/service/celebrations.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { EmployeeService } from '@flows/employee/service/employee.service';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailsNewService } from '@flows/ses/service/emails.service';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import * as AWS from 'aws-sdk';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { JobInformationService } from '@flows/jobInformation/service/jobInformation.service';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { commonDto } from '@flows/allDtos/common.dto';
import { ConfigService } from '@nestjs/config';
import { superAdminConfigFeatures } from '@flows/allDtos/superAdminConfigFeatures.dto';
import { superAdminCompanyFeatures } from '@flows/allDtos/superAdminCompanyFeatures.dto';
import { SocketClient } from '@flows/socket/socket-client';
import { HrmLeaveCategories } from '@flows/allEntities/leaveCategories.entity';
import { HrmAttendanceSummary } from '@flows/allEntities/attendanceSummary.entity';
import { formatInTimeZone } from 'date-fns-tz';
import { da, enGB } from 'date-fns/locale';
import { HrmLeaveBalances } from '@flows/allEntities/leaveBalances.entity';
import { Cron } from '@nestjs/schedule';
import { HrmUsers } from '@flows/allEntities/users.entity';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
import { AccClaims } from '@flows/allEntities/claims.entity';
import { AccAssets } from '@flows/allEntities/assets.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { HrmInformationRequest } from '@flows/allEntities/informationRequest.entity';
import { HrmLeaveRequests } from '@flows/allEntities/leaveRequests.entity';
import { HrmLeaveHistory } from '@flows/allEntities/leaveHistory.entity';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';

import { attendanceSummary } from '@flows/allDtos/attendanceSummary.dto';
import { HrmRosterEmployees, HrmRosterPositions, HrmRosterShifts, HrmRosterSites, HrmRosterTemplates } from '@flows/allEntities/hrmRoster.entity';
import { hrmSurveyQuestionnaires } from '@flows/allEntities/hrmSurveyQuestionnaires.entity';
import { hrmSurveySurveys } from '@flows/allEntities/hrmSurveySurveys.entity';

import { HrmTimeEntries } from '@flows/allEntities/timeEntries.entity';
import { HrmTimeProjects } from '@flows/allEntities/timeProjects.entity';
import { HrmTimesheetRequests } from '@flows/allEntities/timesheetRequests.entity';
import { Folders } from '@flows/allEntities/newFolders.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
import { Question } from '@flows/allDtos/survey.dto';
import { employeeDetails, UserProfile } from '@flows/allDtos/employeeDetails.dto';
import {onboardingTemplate} from '@flows/allEntities/OnboardingTemplate.entity'
import {OnboardingTask} from '@flows/allEntities/OnboardingTask.entity'
import {EventEmitter2} from '@nestjs/event-emitter';
import { CompanyDto } from '../dto/company.dto';
import { SpecialUserDto } from '@flows/allDtos/specialUser.dto';
import { SpecialUser } from '@flows/allEntities/specialUser.entity';

import * as crypto from 'crypto';
import { phoneVerificationTemplate } from 'emailTemplate.util';
const hubspot = require('@hubspot/api-client');
@Injectable()
export class CompanyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly employeeService: EmployeeService,
    private readonly mailService: EmailsNewService,
    private readonly S3Service: S3Service,
    private readonly APIService: APIService,
    private attendanceService: AttendanceService,
    private celebrationService: CelebrationsService,
    private employeementStatusService: EmploymentStatusesService,
    private departmentService: DepartmentService,
    private locationService: LocationsService,
    private divisionService: DivisionService,
   // private trainingService: TrainingService,
    private jobInformationService: JobInformationService,
    private notificationService: NotificationService,
   
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications) private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmReports) private reportsRepository: Repository<HrmReports>,
    @InjectRepository(HrmFiles) private filesRepository: Repository<HrmFiles>,
    @InjectRepository(HrmFolders) private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(HrmNotes) private notesRepository: Repository<HrmNotes>,
    //@InjectRepository(HrmAssetsClaims) private assetsClaimsRepository: Repository<HrmAssetsClaims>,
    @InjectRepository(AccClaims) private claimsRepository: Repository<AccClaims>,
    @InjectRepository(AccAssets) private assetsRepository: Repository<AccAssets>,
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
    @InjectRepository(hrmPayroll)
    private hrmPayrollRepository: Repository<hrmPayroll>,
    @InjectRepository(hrmHiring) private hrmHiringRepository: Repository<hrmHiring>,
    @InjectRepository(HrmAnnouncements) private hrmAnnouncementsRepository: Repository<HrmAnnouncements>,
    @InjectRepository(HrmAttendanceSummary) private hrmAttendanceSummaryRepository: Repository<HrmAttendanceSummary>,
    @InjectDataSource() private dataSource: DataSource,
    @InjectDataSource() private timeTrackingService: TimeTrackingService,
    private readonly socketClient: SocketClient,

    @InjectRepository(HrmLeaveRequests)
    private readonly leaveRequestsRepository: Repository<HrmLeaveRequests>,

    @InjectRepository(HrmLeaveBalances)
    private readonly leaveBalancesRepository: Repository<HrmLeaveBalances>,

    @InjectRepository(hrmSurveyQuestionnaires)
    private readonly surveyQuestionnairesRepository: Repository<hrmSurveyQuestionnaires>,

    @InjectRepository(hrmSurveySurveys)
    private readonly surveyRepository: Repository<hrmSurveySurveys>,

    @InjectRepository(HrmTimeProjects)
    private readonly HrmTimeProjectsRepository: Repository<HrmTimeProjects>,


    @InjectRepository(HrmTimeEntries)
    private readonly HrmTimeEntriesRepository: Repository<HrmTimeEntries>,

    @InjectRepository(onboardingTemplate)
    private readonly onboardingTemplateRepository: Repository<onboardingTemplate>,

    @InjectRepository(OnboardingTask)
    private readonly onboardingTaskRepository: Repository<OnboardingTask>,
    @InjectRepository(HrmLeaveHistory)
    private readonly HrmLeaveHistoryRepository: Repository<HrmLeaveHistory>,

    private eventEmitter: EventEmitter2

    ) {}
    
  private userPool: CognitoUserPool;
  

  async getHealth() {
    return { status: 'active' };
  }
  async getProfile(userId: string) {
    const companies:CompanyDto[] = await this.APIService.getAllCompanies();
    const user: HrmEmployeeDetails[] = await this.dataSource.query(
      `SELECT * from hrm_employee_details 
       WHERE "userId" = $1 
       ORDER BY "lastLogin" DESC NULLS LAST`,
      [userId]
    );

    const specialUser: SpecialUser = await this.dataSource.query(
      `SELECT * from special_user WHERE "userId" = $1`,[userId]
    ).then(res => res[0])

    const res = new UserProfile();
    const accounts = []
    if (user.length !== 0) {
      const company = companies.find((c) => c.id === user[0].companyId);
      res.companyId = user[0].companyId;
      res.employeeId = user[0].employeeId;
      res.createdAt = user[0].createdAt;
      res.employeeName = user[0].fullName.first + " " + user[0].fullName.last;
      res.employeeNo = user[0].employeeNo;
      res.profileImage = user[0].profileImage;
      res.theme = company.theme;
      res.companyName = company.companyName;
      for (let i=0; i<user.length; i++) {
        const company = companies.find((c) => c.id === user[i].companyId);
        accounts.push({ companyId: user[i].companyId, accessLevelId: user[i].accessLevelId, hasAccess: user[i].access, userType: user[i].owner ? "OWNER" : "EMPLOYEE", companyName: company.companyName, employeeId: user[i].employeeId, heroLogoUrl: company.heroLogoUrl, owner: user[i].owner});
      }
    }
    if (specialUser) {
      const company = companies.find((c) => c.id === specialUser.companies[0].companyId);
      res.companyId = specialUser.companies[0].companyId;
      res.employeeId = specialUser.id;
      res.createdAt = specialUser.createdAt;
      res.employeeName = specialUser.firstName + ' ' + specialUser.lastName;
      res.theme = company.theme;
      res.companyName = company.companyName;
      for (let i=0; i<specialUser.companies.length; i++) {
        const company = companies.find((c) => c.id === specialUser.companies[i].companyId && specialUser.companies[i].isActive);
        if (company) {
          accounts.push({ companyId: specialUser.companies[i].companyId, accessLevelId: specialUser.companies[i].accessLevelId, hasAccess: specialUser.companies[i].isActive, userType: specialUser.type, companyName: company.companyName, employeeId: specialUser.id, heroLogoUrl: company.heroLogoUrl});
        }
      }
    }
    res.accounts = accounts;
    return res;
  }
  async getHome(employeeId: string,companyId: string,req:Request) {
    const allEmployeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
      `SELECT * FROM hrm_employee_details WHERE "companyId"=$1 AND "status" != 'Non Active'`,
      [companyId]
    );
    let jobInfos = allEmployeeDetails.flatMap((employee) => employee.jobInformation);
    const allTimeOffRequestsNotificationData: HrmLeaveRequests[] = await this.dataSource.query(
      'SELECT * FROM hrm_leave_requests WHERE "companyId" = $1 AND "status" =$2  ',[companyId,"approved"]
    );
    const companyLinksCategories = [];
    const companyLinks = [];
    const trainingCategory = [];
    const common = await this.dataSource.query(
      `SELECT * from hrm_configs WHERE "companyId" = $1 and "type" In('companyLinksCategories','companyLinks','trainingCategory', 'division', 'department', 'location', 'employmentStatuses')`,[companyId]
    )
    const directory = await this.employeeService.getEmployeesDirectory(companyId);
    const attendance = await this.attendanceService.getEmployeeAttendanceTodayMyCircle(employeeId,companyId);
    const celebrations = await this.celebrationService.getCelebrations(companyId);
    const companyLinksCategoriesCommon = common.filter((cat) => cat.type === 'companyLinksCategories');
    for (let i=0;i<companyLinksCategoriesCommon.length;i++) {
      let obj = {
        ...companyLinksCategoriesCommon[i].data,
        id: companyLinksCategoriesCommon[i].id
      }
      companyLinksCategories.push(obj);
    }
    const companyLinksCommon = common.filter((cat) => cat.type === 'companyLinks');
    for (let i=0;i<companyLinksCommon.length;i++) {
      let obj = {
        ...companyLinksCommon[i].data,
        id: companyLinksCommon[i].id
      }
      companyLinks.push(obj);
    }
    //division
    const divisions = common.filter((cat) => cat.type === 'division');
    const divisionList = [];
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
    //department
    const departments = common.filter((cat) => cat.type === 'department');
    const departmentList = [];
    for (let i = 0; i < departments.length; i++) {
      const filteredJobInfos = jobInfos.filter((jobInfo) => jobInfo.active === true && departments[i].data.name === jobInfo.department);
      departments[i]['count'] = filteredJobInfos.length;
      const obj = {
        id: departments[i].id,
        name: departments[i].data.name,
        count: departments[i]["count"],
      };
      departmentList.push(obj);
    }
    //location
    const locations = common.filter((cat) => cat.type === 'location');
    if (locations.length != 0) {
      locations.forEach(location => {
          let count = jobInfos.filter(jobInfo => 
              jobInfo.location == location.data.name && jobInfo.active
          ).length;
          location['count'] = count;
      });
    }
      const locationList = [];
      for(let i = 0; i < locations.length; i++){
        const locationObj = {
          id:locations[i].id,
          ...locations[i].data,
          createdAt:locations[i].createdAt,
          modifiedAt:locations[i].modifiedAt,
          companyId:locations[i].companyId,
          count:locations[i]['count']
        }
        locationList.push(locationObj)
      }
    //employeeStatus
    const employmentStatuses = common.filter((cat) => cat.type === 'employmentStatuses');
    const emolyeementStatusList = []; 
    if (employmentStatuses.length != 0) {
      const allEmploymentStatuses = allEmployeeDetails.flatMap((employee) => employee.employeeStatus);
      employmentStatuses.forEach((employmentStatus) => {
        employmentStatus['count'] = allEmploymentStatuses.filter(
          (employeeStatus) => employeeStatus.status === employmentStatus.data.name && employeeStatus.active,
        ).length;
        const obj = {
          id: employmentStatus.id,
          ...employmentStatus.data,
          count: employmentStatus['count'],
          createdAt: employmentStatus.createdAt,
          modifiedAt: employmentStatus.modifiedAt,
          companyId: employmentStatus.companyId,
        };
        emolyeementStatusList.push(obj);
      });
    }
    const trainingCategoriesCommon = common.filter((cat) => cat.type === 'trainingCategory');
    for (let i=0;i<trainingCategoriesCommon.length;i++) {
      trainingCategory.push({
        ...trainingCategoriesCommon[i].data,
        id: trainingCategoriesCommon[i].id
      });
    }
    //const training = await this.trainingService.getTraining(companyId);
    //const trainingByEmployee = await this.trainingService.getTrainingByEmployeeId(companyId,employeeId);
    
    
    return {
      allTimeOffRequests: allTimeOffRequestsNotificationData,
      directory: directory,
      attendance: attendance,
      celebrations: celebrations,
      companyLinksCategories: companyLinksCategories,
      companyLinks: companyLinks,
      report: {
        empStatus: emolyeementStatusList,
        division: divisionList,
        department: departmentList,
        location: locationList,
      },
      training:{
        trainingCategory: [],
        training: [],
        trainingByEmployee: []
      } 
    };
  }
  async companyTemplate(fullName, dummyData: any) {
    const template: string = JSON.parse(dummyData["CompanyTemplate"][0]);
    const body = template.replace("$fullName$", fullName);
    return body;
  }
  async addStripeCustomer(email, name, address) {
    const customer = await this.APIService.addStripeCustomer(email, name, address);
    return customer.id;
  }
  async addTrialSubscription(currency, stripeOwnerId, companyId) {
    const superAdminPackage = await this.APIService.getSuperAdminPackagesPremium();      
    const subscription = await this.APIService.addTrialSubscription(
      currency,
      stripeOwnerId,
      superAdminPackage.productId,
    );
    const defaultUserCount = superAdminPackage.defaultUserCount;
    const effectiveDate = format(new Date(), 'yyyy-MM-dd');
    const packageId = superAdminPackage.id;
    var date = new Date();
    date.setDate(new Date().getDate() + 7);
    const expiredDate = format(new Date(date), 'yyyy-MM-dd');
    const billingPeriod = '';
    const cost = '0';
    const comment = '';
    const emails = [];
    const customPackage = false;  
    const type = 'PACKAGE';  
    const stripeSubscriptionId = subscription.id; 
    const status = 'Active';
    const features = superAdminPackage.features;
    const createdAt = new Date(Date.now());
    const modifiedAt = new Date(Date.now());
    const superAdminCompanyFeatures = {
      defaultUserCount,
      type,
      effectiveDate,
      companyId,
      packageId,
      billingPeriod,
      status,
      features,
      cost,
      comment,
      emails,
      customPackage,
      createdAt,
      modifiedAt,
      expiredDate,
      stripeSubscriptionId
    };
    await this.APIService.postSuperAdminCompanyFeatures(superAdminCompanyFeatures);
  }
  async getCompanies() {
    try {
      const company = await this.APIService.getAllCompanies();
      for (let j = 0; j < company.length; j++) {
        let featuresArray = [];
        const featuresSlugsArray = [];
        featuresArray = company[j].features;
        for (let i = 0; i < featuresArray.length; i++) {
          const superAdminConfigFeatures =
            await this.APIService.getSuperAdminConfigFeatureById(
              featuresArray[i],
            );
          featuresSlugsArray.push(superAdminConfigFeatures.slug);
        }
        company[j].features = company[j].features;
        company[j]['featuresSlugs'] = featuresSlugsArray;
        const superAdminCompanyFeatures =
          await this.APIService.getActivePackageSuperAdminCompanyFeatures(
            company[j].id,
          );
        if (superAdminCompanyFeatures) {
          superAdminCompanyFeatures.features =
            superAdminCompanyFeatures.features;
          company[j]['packages'] = superAdminCompanyFeatures;
        } else {
          company[j]['packages'] = {
            active: false,
          };
        }
      }
      return company;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postReports(companyId,dummyData: any) {
    const reportsArray = [];
    const reportsData = dummyData['ReportsData'];

    for (let i = 0; i < reportsData.length; i++) {
      const reportName = reportsData[i].reportName;
      const type = reportsData[i].type;
      const creatorId = reportsData[i].creatorId;
      const schedule = reportsData[i].schedule;
      const filterBy = reportsData[i].filterBy;
      const sortBy = reportsData[i].sortBy;
      const groupBy = reportsData[i].groupBy;
      const sharedWith = reportsData[i].sharedWith;
      const folderIdList = reportsData[i].folderIdList;
      const recentlyViewed = '';
      const reportRequired = reportsData[i].reportRequired;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const Report = this.reportsRepository.create({
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
      await this.reportsRepository.save(Report);
    }

    const reports = await this.reportsRepository.find({
      select: [
        'id',
        'reportName',
        'type',
        'createdAt',
        'recentlyViewed',
        'sharedWith',
        'modifiedAt',
        'creatorId',
        'groupBy',
        'companyId',
      ],
      where: { companyId: companyId },
    });

    for (let i = 0; i < reports.length; i++) {
      const id = reports[i].id;
      const reportName = reports[i].reportName;
      const type = reports[i].type;
      const creatorId = reports[i].creatorId;
      const groupBy = reports[i].groupBy;
      const sharedWith = reports[i].sharedWith;
      const recentlyViewed = '';
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const ReportNew = this.reportsRepository.create({
        id,
        reportName,
        type,
        groupBy,
        sharedWith,
        recentlyViewed,
        creatorId,
        createdAt,
        modifiedAt,
        companyId,
      });
      const res = await this.reportsRepository.save(ReportNew);
      reportsArray.push(res);
    }
    return reportsArray;
  }
  async postFolders(companyId,dummyData: any) {
    const foldersData = dummyData['FoldersData'];
    for (let i = 0; i < foldersData.length; i++) {
      const folderName = foldersData[i].folderName;
      const folderType = foldersData[i].folderType;
      const description = foldersData[i].description;
      const icon = foldersData[i].icon;
      const subFolder = foldersData[i].subFolder;
      const parentFolder = foldersData[i].parentFolder;
      const createdAt = new Date();
      const modifiedAt = new Date();
      const path = foldersData[i].path;
      const type = 'documentsFolders';
      const newFolder = this.foldersRepository.create({
        type,
        folderName,
        folderType,
        description,
        icon,
        createdAt,
        modifiedAt,
        subFolder,
        parentFolder,
        path,
        companyId,
      });
      await this.foldersRepository.save(newFolder);
    }
  }
  async postSapEmailCount(companyId) {
    const types = [
      'emailVerification',
      'accountCreation',
      'resetPassword',
      'recoverPassword',
      'emailVerified',
      'timeoffRequest',
      'employeementStatusRequest',
      'jobInformationRequest',
      'compensationRequest',
      'promotionRequest',
      'coverupRequest',
      'promotionRequest',
      'jobInformationRequest',
      'compensationRequest',
      'offerLetter',
      'offerLetterRevised',
      'talentPoolCollaborator',
      'jobOpeningCollaborator',
    ];
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const count = 0;
      const superAdminEmailCount = {
        count,
        type,
        createdAt,
        modifiedAt,
        companyId,
      };
      await this.APIService.postSuperAdminEmailCount(superAdminEmailCount);
    }
  }
  async postClaimsCategories(companyId) {
    try {
      const createdAt = new Date();
      const modifiedAt = new Date();
      const names = ['Communication', 'Food', 'Travel'];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const claimsCategories = {
          name,
          companyId,
          createdAt,
          modifiedAt,
        };
        const common = {
          type: 'claimsCategories',
          createdAt,
          modifiedAt,
          companyId,
          data: claimsCategories
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postPayrollTypes(companyId) {
    try {
      const nameArray = ['Basic Salary', 'Bonus'];
      const fieldArray = ['text', 'select'];
      const selectTypeArray = ['Flexible', 'Fixed'];
      for (let i = 0; i < nameArray.length; i++) {
        const createdAt = new Date();
        const modifiedAt = new Date();
        const name = nameArray[i];
        const field = fieldArray[i];
        const selectType = selectTypeArray[i];
        const category = 'Earnings';
        const permanent = true;
        const payrollTypes = {
          name,
          field,
          selectType,
          category,
          permanent,
          companyId,
          createdAt,
          modifiedAt,
        };
        const common = {
          type: 'payrollTypes',
          createdAt,
          modifiedAt,
          companyId,
          data: payrollTypes
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postNotesDummy(
    employeeIdList: string[],
    companyId: string,
    owner: any,
    fullname: any,
    dummyData: any,
  ) {
    try {
      const dummy = dummyData['Notes'];
      for (let i = 0; i < employeeIdList.length; i++) {
        const employeeId = employeeIdList[i];
        const senderId = owner.employeeId;
        const senderName = fullname;
        const note = dummy[i].note;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const newnote = this.notesRepository.create({
          employeeId,
          senderId,
          senderName,
          note,
          createdAt,
          modifiedAt,
          companyId,
        });
        await this.notesRepository.save(newnote);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postClaimsDummy(employeeIdList: string[], companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['Claims'];
      for (let i = 0; i < dummy.length; i++) {
        const folder = await this.foldersRepository.findOne({
          where: { folderName: 'Employee Uploads' ,companyId: companyId},
        });
        const dummyFile = {
          fileLink:
            'common/dummydata/claim-form.pdf',
          uploaderId: employeeIdList[i],
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId: companyId,
          fileName: 'claim-form.pdf',
          format: 'pdf',
          folderId: folder.id,
        };
        const savedFile = await this.filesRepository.save(dummyFile);
        const claims = {
          ...dummy[i],
          claimDate: new Date().toISOString().slice(0, 10),
          employeeId: employeeIdList[i],
          fileId: savedFile.id,
          fileLink: dummyFile.fileLink,
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId: companyId,
          requesterId: employeeIdList[i]
        };
        const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
          [employeeIdList[i]],
        ).then(res => res[0]);
        const savedClaims = await this.claimsRepository.save(claims);
        await this.notificationService.addNotifications('claimRequest', `${employeeDetails.fullName.first + ' ' + employeeDetails.fullName.last} is requesting a claim for ${claims.claimCategory}.`, savedClaims['id'], companyId, employeeIdList[i]);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postPromotionRequestDummy(employees: any,ownerIdName: any,companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['PromotionRequest'];

      for (let i = 0; i < dummy.length; i++) {
        
        
        
        const employee = await this.dataSource.query(
          `SELECT * FROM hrm_employee_details, jsonb_array_elements("jobInformation") AS ji WHERE ji->>'jobTitle' = '${dummy[i].referedEmployeeJob}' AND "companyId" = '${companyId}'`
        ).then((res) => res[0]); 
        const employeeId = employee.employeeId;
        const employeeName = employee.fullName['first'] + ' ' + employee.fullName['last'];
        const requesterId = ownerIdName.id;
        const requesterName = ownerIdName.name;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const effectiveDateOld = employee.jobInformation[0].effectiveDate;
        const effectiveDateNew = new Date().toISOString().slice(0, 10);
        const reporterNameOld = employee.jobInformation[0].reportTo.reporterName;
        const reporterNameNew = requesterName;
        const oldLocationData = employee.jobInformation[0].location;
        const oldDivisionData = employee.jobInformation[0].division;
        const oldDepartmentData = employee.jobInformation[0].department;
        const oldJobTitleData = employee.jobInformation[0].jobTitle;
        const changedData = {
          jobInfo: {
            effectiveDate: {
              ...dummy[i]['changedData']['jobInfo']['effectiveDate'],
              newData: effectiveDateNew,
              oldData: effectiveDateOld,
            },
            location:{
              ...dummy[i]['changedData']['jobInfo']['location'],
              oldData: oldLocationData,
            },
            division:{
              ...dummy[i]['changedData']['jobInfo']['division'],
              oldData: oldDivisionData,
            },
            department:{
              ...dummy[i]['changedData']['jobInfo']['department'],
              oldData: oldDepartmentData,
            },
            jobTitle:{
              ...dummy[i]['changedData']['jobInfo']['jobTitle'],
              oldData: oldJobTitleData,
            },
            reporterName:{
              newData: reporterNameNew,
              oldData: reporterNameOld
            }
          },
          compensation: dummy[i]['changedData']['compensation']
        };
        const formData = {
          jobInfo:{
            employeeId: employeeId,
            effectiveData: effectiveDateNew,
            reportTo:{
              reporterId: requesterId,
              reporterName: requesterName
            },
            ...dummy[i]['jobInfo']
          },
          compensation: {
            ...dummy[i]['compensation'],
            employeeId: employeeId,
          }
        }
        if(dummy[i].status === 'approved'){
          const req = {
            body: {
              employeeId,
              department: dummy[i]['changedData']['jobInfo']['department']['newData'],
              division: dummy[i]['changedData']['jobInfo']['division']['newData'],
              location: dummy[i]['changedData']['jobInfo']['location']['newData'],
              jobTitle: dummy[i]['changedData']['jobInfo']['jobTitle']['newData'],
              effectiveDate: effectiveDateNew,
              reportTo: {
                reporterId: requesterId,
                reporterName: requesterName
              },
            }
          }
          await this.jobInformationService.postJobInformation(req,companyId);
          const infoRequest = {
            changedData,
            formData,
            type:'promotion',
            employeeId,
            requesterId,
            status: dummy[i].status,
            companyId,
          }
          const savedInfoRequest = await this.dataSource.getRepository(HrmInformationRequest).save(infoRequest);
          await this.notificationService.addNotifications('promotion', `${employee.fullName.first + ' ' + employee.fullName.last} made a promotion request.`, savedInfoRequest['id'], companyId, requesterId);
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postStatusChangeRequest(employeesList: any[], ownerIdName: any, companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['StatusRequest'];
      const employees = employeesList.filter((employee) => employee.owner !== true);
      for (let i = 0; i < dummy.length; i++) {
        const employee = employees[i];
        const employeeId = employee.employeeId;
        const employeeName = employee.fullName['first'] + ' ' + employee.fullName['last'];
        const requesterId = ownerIdName.id;
        const requesterName = ownerIdName.name;
        const changedData = {
          effectiveDate: {
            newData: new Date().toISOString().slice(0, 10),
            oldData: employee.employeeStatus[0].effectiveDate,
            ...dummy[i]['changedData']['effectiveDate'],
          },
          status: {
            oldData: employee.employeeStatus[0].status,
            ...dummy[i]['changedData']['status'],
          },
          comment: {
            ...dummy[i]['changedData']['comment'],
          }
        }
        const formData = {
          employeeId,
          effectiveDate: new Date().toISOString().slice(0, 10),
          ...dummy[i]['formData']
        }
        const statusChangeRequest = {
          changedData,
          formData,
          type:'empStatusUpdate',
          employeeId,
          requesterId,
          status: dummy[i].status,
          companyId
        }
        const savedStatusChangeRequest = await this.dataSource.getRepository(HrmInformationRequest).save(statusChangeRequest);
        await this.notificationService.addNotifications('empStatusUpdate', `${requesterName} made a employee status request.`, savedStatusChangeRequest['id'], companyId, requesterId);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postJobOpeningDummy(ownerIdName: any, companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['JobOpening'];
      for (let i = 0; i < dummy.length; i++) {
        const hiringLead = ownerIdName.id;
        const creator = {
          id: ownerIdName.id,
          name: ownerIdName.name,
        }
        const collaboratorsList = [{
          id: uuidv4(),
          collaboratorId: ownerIdName.id,
          collaboratorName: ownerIdName.name,
          role: 'Founder and CEO',
          type: 'creator',
          email: false,
        }]
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        const newJobOpening = {
          ...dummy[i],
          hiringLead,
          creator,
          collaboratorsList,
        };
        await this.hrmHiringRepository.save({
          type: "hrm_hiring_job",
          data: newJobOpening,
          companyId,
          createdAt,
          updatedAt,
        });
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postHiringCandidatesDummy(companyId: string, dummyData: any) {
    try {
      let candidates = dummyData['HiringCandidates'];
      for (let i = 0; i < candidates.length; i++) {
        const jobOpeningId = await this.dataSource.query(
          `SELECT id FROM hrm_hiring WHERE data->>'postingTitle' = '${candidates[i].jobOpeningTitle}' AND "companyId" = '${companyId}' AND type = 'hrm_hiring_job'`,
        )
        candidates[i]['jobOpeningId'] = jobOpeningId[0].id;
        await this.hrmHiringRepository.save({
          type: "hrm_hiring_candidates",
          companyId: companyId,
          data: candidates[i],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postTalentPoolsDummy(companyId: string, dummyData: any, ownerIdName: any) {
    try {
      let talentPools = dummyData['TalentPools'];
      for (let i = 0; i < talentPools.length; i++) {
        talentPools[i]["creatorId"] = ownerIdName.id;
        talentPools[i]["collaborators"] = []
        talentPools[i]["candidates"] =[]
        await this.hrmHiringRepository.save({
          type: "hrm_hiring_talent_pool",
          data: talentPools[i],
          companyId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAnnouncementsDummy(companyId: string,dummyData: any,ownerIdName: any) {
    try {
      const announcements = dummyData['Announcements'];
      for (let i = 0; i < announcements.length; i++) {
        let id = uuidv4();
        const author = ownerIdName.id;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const newnote = {
          id,
          ...announcements[i],
          author,
          createdAt,
          modifiedAt,
          companyId,
        };
        const savedAnnouncement = await this.hrmAnnouncementsRepository.save(
          newnote,
        );
        if (announcements[i].status === 'published') {
          const hidden = false;
          const json = {};
          json['id'] = savedAnnouncement.id;
          json['title'] = announcements[i].title;
          json['author'] = author;
          let data = json;
          const mainData = {
            id,
            data,
            createdAt,
            modifiedAt,
            hidden,
          };
          data = mainData;

          await this.hrmAnnouncementsRepository.save(savedAnnouncement);
          await this.notificationService.addNotifications('announcement', `Announcement: ${savedAnnouncement.title}.`, savedAnnouncement['id'], companyId, author);
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAssetsRequestsDummy(companyId: string, dummyData: any, employeeList: any) {
    try {
      const assetsRequests = dummyData['AssetsRequests'];
      const employees = employeeList.filter((employee) => employee.owner !== true);
      const assets: AccAssets[] = await this.dataSource.query(
        'SELECT * FROM acc_assets WHERE "companyId"=$1',
        [companyId],
      )
      for (let i = 0; i < assetsRequests.length; i++) {
        const employeeId = employees[i].employeeId;
        const assetCategoryId = await this.dataSource.query(
          `SELECT id FROM hrm_configs WHERE data->>'name' = '${assetsRequests[i].data.aseetsCategoryId}' AND type = 'assetCategory' AND "companyId" = '${companyId}'`,
        );
        const asset = assets.find((a) => a.aseetsCategoryId === assetCategoryId[0].id && a.employeeId === employeeId);
        const requesterId = employeeList.find((employee) => employee.owner === true).employeeId;
        const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
          [requesterId],
        ).then(res => res[0]);
        await this.notificationService.addNotifications('assetRequest', `${employeeDetails.fullName.first + ' ' + employeeDetails.fullName.last} is requesting an asset for ${assetCategoryId.name}.`, asset['id'], companyId, requesterId);
 
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postTrainingCategoryDummy(companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['TrainingCategory'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const trainingCategory = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'trainingCategory',
          createdAt,
          modifiedAt,
          companyId,
          data: trainingCategory
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postAssetsCategoryDummy(companyId: string,dummyData: any) {
    try {
      const dummy = dummyData['AssetsCategory'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const assetCategory = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'assetCategory',
          createdAt,
          modifiedAt,
          companyId,
          data: assetCategory
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postAssetsDummy(companyId: string, EmployeeIdList: string[],dummyData: any) {
    try {
      const assets = await this.commonRepository.find({
        where: { companyId: companyId, type: 'assetCategory' },
      });
      const assetsCategoryList = [];
      assets.forEach((asset) => {
        assetsCategoryList[asset.data.name] = asset.id;
      });
      const dummy = dummyData['Assets'];
      for (let i = 0; i < dummy.length; i++) {
        const aseetsCategoryId = assetsCategoryList[dummy[i].aseetsCategoryId];
        const assetsDescription = dummy[i].assetsDescription;
        const dateAssigned = new Date().toISOString().slice(0, 10);
        const dateReturned = new Date().toISOString().slice(0, 10);
        const serial = dummy[i].serial;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const employeeId = EmployeeIdList[i];
        const requesterId = EmployeeIdList[i];
        await this.assetsRepository.save({
          assetsDescription,
          aseetsCategoryId,
          serial,
          dateAssigned,
          dateReturned,
          createdAt,
          modifiedAt,
          employeeId,
          companyId,
          requesterId
        });
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOffboardingCategoriesDummy(companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['OffboardingCategories'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const offboardingCategories = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'offboardingCategories',
          createdAt,
          modifiedAt,
          companyId,
          data: offboardingCategories
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOnboardingCategoriesDummy(companyId: string,dummyData: any) {
    try {
      const dummy = dummyData['OnboardingCategories'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const onboardingCategories = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'onboardingCategories',
          createdAt,
          modifiedAt,
          companyId,
          data: onboardingCategories
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postTrainingDummy(companyId: string, dummyData: any) {
    try {
      const TrainingCategory = await this.commonRepository.find({where:{companyId: companyId, type: 'trainingCategory'}});
      const trainingCategoryList = [];
      TrainingCategory.forEach((trainingCategory) => {
        trainingCategoryList[trainingCategory.data.name] = trainingCategory.id;
      });
      const dummy = dummyData['Training'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const description = dummy[i].description;
        const link = dummy[i].link;
        const categoryId = trainingCategoryList[dummy[i].categoryId];
        const frequency = dummy[i].frequency;
        const repeat = '';
        const every = 0;
        const attachfiles = [];
        const required = true;
        const requiredList = [];
        const due = true;
        const dueDate = dummy[i].dueDate;
        const completedList = [];
        const monthNo = [];
        const createdAt = new Date();
        const modifiedAt = new Date();
        const hasCategory = true;
        const training = {
          name,
          description,
          link,
          categoryId,
          frequency,
          repeat,
          every,
          attachfiles,
          required,
          requiredList,
          hasCategory,
          due,
          dueDate,
          completedList,
          monthNo,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'training',
          createdAt,
          modifiedAt,
          companyId,
          data: training
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOnboardingDummy(companyId: string, Employee: any, dummyData: any) {
    try {
      const onboardingCategories =
        await this.commonRepository.find({
          where: { companyId: companyId, type: 'onboardingCategories' },
        });
      const onboardingCategoryList = [];
      onboardingCategories.forEach((onboardingCategory) => {
        onboardingCategoryList[onboardingCategory.data.name] = onboardingCategory.id;
      });
      const dummy = dummyData['Onboarding'];
      for (let j = 0; j < dummy.length; j++) {
        const name = dummy[j].name;
        const description = dummy[j].description;
        const categoryId = onboardingCategoryList[dummy[j].categoryId];
        const assignTo = Employee.employeeId;
        const dueDate = dummy[j].dueDate;
        const sendNotification = dummy[j].sendNotification;
        const attachFiles = '[]';
        const allEmployees = dummy[j].allEmployees;
        const eligible = dummy[j].eligible;
        const createdAt = new Date();
        const modifiedAt = new Date();
        const onboardingTask = {
          name,
          categoryId,
          description,
          assignTo,
          dueDate,
          sendNotification,
          attachFiles,
          allEmployees,
          eligible,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'onboardingTask',
          createdAt,
          modifiedAt,
          companyId,
          data: onboardingTask
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOffboardingDummy(companyId: string, Employee: any,dummyData: any) {
    try {
      const offBoardingCategory =
        await this.commonRepository.find({
          where: { companyId: companyId, type: 'offboardingCategories' },
        });
      const offBoardingCategoryList = [];
      offBoardingCategory.forEach((offBoardingCategory) => {
        offBoardingCategoryList[offBoardingCategory.data.name] =
          offBoardingCategory.id;
      });
      const dummy = dummyData['Offboarding'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const categoryId = offBoardingCategoryList[dummy[i].categoryId];
        const description = dummy[i].description;
        const assignTo = Employee.employeeId;
        const dueDate = {
          none: true,
          onTerminationDate: false,
          from: {
            selected: false,
            count: '',
            method: 'days',
            execute: 'after',
          },
        };
        const sendNotification = 'Soon After Task Is Imported';
        const attachFiles = [];
        const allEmployees = 'true';
        const eligible = [
          {
            name: 'Department',
            list: [],
          },
          {
            name: 'Division',
            list: [],
          },
          {
            name: 'Employee Status',
            list: [],
          },
          {
            name: 'Job Title',
            list: [],
          },
          {
            name: 'Location',
            list: [],
          },
        ];
        const createdAt = new Date();
        const modifiedAt = new Date();
        const offboardingTask = {
          name,
          categoryId,
          description,
          assignTo,
          dueDate,
          sendNotification,
          attachFiles,
          allEmployees,
          eligible,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'offboardingTask',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: offboardingTask
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAttendanceDummy(companyId: string, employeeList: any[], timezone: any) {
    try {
      
      let currentCompanyTime = formatInTimeZone(
        new Date(),
        timezone,
        'yyyy-MM-dd',
       
      );
      const currentDay = new Date(currentCompanyTime).getDay();
      let i;
      let weekStartDate;
      let weekEndDate;
      let weeklySummary = [];
     
      switch (currentDay) {
        case 1: //Monday
          weekStartDate = currentCompanyTime;
          weekEndDate = format(addDays(new Date(currentCompanyTime), 6), 'yyyy-MM-dd');
          i = 1;
          break;
        case 2: //Tuesday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 1), 'yyyy-MM-dd');
          weekEndDate = format(addDays(new Date(currentCompanyTime), 5), 'yyyy-MM-dd');
          i = 2;
          break;
        case 3: //Wednesday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 2), 'yyyy-MM-dd');
          weekEndDate = format(addDays(new Date(currentCompanyTime), 4), 'yyyy-MM-dd');
          i = 3;
          break;
        case 4: //Thursday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 3), 'yyyy-MM-dd');
          weekEndDate = format(addDays(new Date(currentCompanyTime), 3), 'yyyy-MM-dd');
          i = 4;
          break;
        case 5: //Friday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 4), 'yyyy-MM-dd');
          weekEndDate = format(addDays(new Date(currentCompanyTime), 2), 'yyyy-MM-dd');
          i = 5;
          break;
        case 6: //Saturday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 5), 'yyyy-MM-dd');
          weekEndDate = format(addDays(new Date(currentCompanyTime), 1), 'yyyy-MM-dd');
          i = 5;
          break;
        case 0: //Sunday
          weekStartDate = format(subDays(new Date(currentCompanyTime), 6), 'yyyy-MM-dd');
          weekEndDate = currentCompanyTime;
          i = 6;
          break;
      }
      let companyTimeWithTime = formatInTimeZone(
        new Date(),
        timezone,
        'yyyy-MM-dd HH:mm:ss zzz',
       
      );
      for (let k = 0; k < employeeList.length; k++) {
        for (let j = 0; j < i; j++) {
          const numEntries = await this.generateDummyTimeEntries(companyTimeWithTime, j);
          const attendance = this.attendanceRepository.create({
            employeeId: employeeList[k].employeeId,
            date: format(
              subDays(new Date(currentCompanyTime), j),
              'yyyy-MM-dd',
            ),
            isOnline: false,
            isApproved: false,
            locationType: 'remote',
            location: '',
            timeEntries: numEntries,
            companyId,
            createdAt: new Date(),
            modifiedAt: new Date(),
          });
          await this.attendanceRepository.save(attendance);
          weeklySummary.push({
            id: uuidv4(),
            employeeId: employeeList[k].employeeId,
            date: attendance.date,
            isOnline: false,
            isApproved: false,
            locationType: 'remote',
            location: '',
            timeEntries: attendance.timeEntries,
            companyId,
            createdAt: new Date(),
            modifiedAt: new Date(),
          });
        }
        await this.hrmAttendanceSummaryRepository.save({
          employeeId: employeeList[k].employeeId,
          weekStartDate,
          weekEndDate,
          weeklySummary,
          companyId,
          status: 'pending',
          createdAt: new Date(),
          modifiedAt: new Date(),
        });
        weeklySummary = [];
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  
  async generateDummyTimeEntries(companyTime: string, j: number) {
    const dummyTimeEntries = [];
    let date = Math.floor(new Date(format(new Date(companyTime), 'yyyy-MM-dd') + ' 08:30:00').getTime() / 1000);
    const unixArray = [];
    while (date !== ((Math.floor(new Date(format(new Date(companyTime), 'yyyy-MM-dd') + ' 08:30:00').getTime() / 1000)) + (60 * 8.5 * 60) + 60)) {
        unixArray.push(date);
        date = date + 60;
    }
    const randomEntryCount =  Math.floor(Math.random() * 10) + 1;
    const selectedUnixArray = [];
    for (let i=0;i<(randomEntryCount * 2);i++) {
        const randomIndexCount = Math.floor(Math.random() * 510);
        if (selectedUnixArray.includes(unixArray[randomIndexCount])) {
          i--;
        }
        else {
          selectedUnixArray.push(unixArray[randomIndexCount]);
        }
    }
    selectedUnixArray.sort(function(a, b) {
      return a - b;
    });
    let id = 0;
    for (let i=0;i<selectedUnixArray.length;i+= 2) {
      const timeEntry = {
        id: id,
        clockIn: format(new Date(selectedUnixArray[i] * 1000), 'HH:mm'),
        clockOut: format(new Date(selectedUnixArray[i+1] * 1000), 'HH:mm'),
        taskId: "",
        ongoing: false
      }
      if (j === 0 && (new Date(selectedUnixArray[i+1] * 1000) < new Date(companyTime))) {
        dummyTimeEntries.push(timeEntry);
      }
      else if (j !== 0) {
        dummyTimeEntries.push(timeEntry);
      }
      id++;
    }
    return dummyTimeEntries;
  }

  async postWeeklySummaryDummy(companyId: string,timeZone: any) {
    try {
      const serverTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss zzz');
      let currentCompanyTime = formatInTimeZone(
        new Date(serverTime),
        timeZone,
        'yyyy-MM-dd HH:mm',
        { locale: enGB },
      ) 
      
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  async postHolidays(companyId: string,country: string) {
    try {
      if (
        country === 'Australia' ||
        country === 'NewZealand' ||
        country === 'Sri Lanka'
      ) {
        country = country.replace(/\s/g, '');
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.AWS_S3_KEY_SECRET,
        });
        const params = {
          Bucket: 'resource.romeohr.com',
          Key: 'common/JsonList.json',
        };
        const data = await s3
          .getObject(params)
          .promise()
          .then((data) => {
            return JSON.parse(data.Body.toString());
          });
        let currentYear = new Date().getFullYear();
        for (let i = 0; i < 1; i++) {
          const groupList =
            data['holidays']?.[currentYear]?.[country]?.['groupList'];
          let newGroupListIds = {};
          for (let j = 0; j < groupList.length; j++) {
            let holidayGroup = this.dataSource.getRepository(HrmConfigs).create({
              type: 'payroll_holiday_group',
              data: {
                name: groupList[j].name,
              },
              companyId: companyId,
              createdAt: new Date(),
              modifiedAt: new Date()
            });
            const savedHolidayGroup = await this.dataSource.getRepository(HrmConfigs).save(
              holidayGroup,
            );
            newGroupListIds = {
              ...newGroupListIds,
              [groupList[j].id]: savedHolidayGroup.id,
            };
          }
          const holidayList =
            data['holidays']?.[currentYear]?.[country]?.['holidays'];
          for (let j = 0; j < holidayList.length; j++) {
            const data = {
              name: holidayList[j].holidayName,
              date: holidayList[j].holidayDate,
              groupIds: holidayList[j].groupIds.map(
                (group: string) => newGroupListIds[group],
              ),
            };
            const holiday = this.dataSource.getRepository(HrmConfigs).create({
              type: 'payroll_holiday',
              data: data,
              companyId: companyId,
              createdAt: new Date(),
              modifiedAt: new Date()
            });
            await this.dataSource.getRepository(HrmConfigs).save(holiday);
          }
          currentYear++;
        }
      }
    }catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postPayrollPredefinedData(companyId: string,dummyData: any) {
    try {
      const data = dummyData['Payroll'];
        
      //Add earnings
      const earnings = data['earnings'];
      for (let i = 0; i < earnings.length; i++) {
        const earningData = earnings[i];
        const earning = this.hrmPayrollRepository.create({
          type: 'payitem_earning',
          data: earningData,
          companyId: companyId,
        });
        await this.hrmPayrollRepository.save(earning);
      }
      //Add deductions
      const deductions = data['deductions'];
      for (let i = 0; i < deductions.length; i++) {
        const deductionData = deductions[i];
        const deduction = this.hrmPayrollRepository.create({
          type: 'payitem_deduction',
          data: deductionData,
          companyId: companyId,
        });
        await this.hrmPayrollRepository.save(deduction);
      }
      //Add reimbursements
      const reimbursements = data['reimbursements'];
      for (let i = 0; i < reimbursements.length; i++) {
        const reimbursementData = reimbursements[i];
        const reimbursement = this.hrmPayrollRepository.create({
          type: 'payitem_reimbursement',
          data: reimbursementData,
          companyId: companyId,
        });
        await this.hrmPayrollRepository.save(reimbursement);
      }
      //Add epfEtfs
      const epfEtfs = data['epfEtfs'];
      for (let i = 0; i < epfEtfs.length; i++) {
        const epfEtfData = epfEtfs[i];
        const epfEtf = this.hrmPayrollRepository.create({
          type: 'payitem_epf_etf',
          data: epfEtfData,
          companyId: companyId,
        });
        await this.hrmPayrollRepository.save(epfEtf);
      }
      //Add payrollsettingsOrg calenders
      const payrollsettingsOrgCalenders = data['payrollSettingsOrgCalenders'];
      for (let i = 0; i < payrollsettingsOrgCalenders.length; i++) {
        const payrollsettingsOrgCalenderData = payrollsettingsOrgCalenders[i];
        if(payrollsettingsOrgCalenderData.calendarType === 'MONTHLY'){
          payrollsettingsOrgCalenderData['startDate'] = new Date().toISOString().slice(0, 10);
          let endDate = new Date(payrollsettingsOrgCalenderData['startDate']);
          endDate.setMonth(endDate.getMonth() + 1);
          payrollsettingsOrgCalenderData['paymentDate'] = endDate.toISOString().slice(0, 10);
        }else if(payrollsettingsOrgCalenderData.calendarType === 'WEEKLY'){
          payrollsettingsOrgCalenderData['startDate'] = new Date().toISOString().slice(0, 10);
          let endDate = new Date(payrollsettingsOrgCalenderData['startDate']);
          endDate.setDate(endDate.getDate() + 7);
          payrollsettingsOrgCalenderData['paymentDate'] = endDate.toISOString().slice(0, 10);
        }
        const payrollsettingsOrgCalender = this.hrmPayrollRepository.create({
          type: 'payroll_calendar',
          data: payrollsettingsOrgCalenderData,
          companyId: companyId,
        });
        await this.hrmPayrollRepository.save(payrollsettingsOrgCalender);
      }

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDummyJsondata(Type?: string){
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      });
      const params = {
        Bucket: process.env.RESOURCE_BUCKET_NAME,
        Key: process.env.DEMODATA_FILE,
      };
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


  async postCompany(body) {
    try {
      let currency = 'usd';
      const firstName = body.firstName;
      const lastName = body.lastName;
      const username = body.email;
      const companyName = body.companyName;
      const noEmp = '24';
      const country = body.address.country;
      const address = body.address;
      const atoDetails = body.atoDetails;
      if (country === 'Canada') {
        currency = 'cad';
      } else if (country === 'Sri Lanka') {
        currency = 'lkr';
      } else if (country === 'Australia') {
        currency = 'aud';
      } else if (country === 'Singapore') {
        currency = 'sgd';
      }else if(country === 'United Kingdom'){
        currency = 'gbp';
      }
      const stripeAddress = {
        city: address.city,
        country: address.country,
        line1: address.no,
        line2: address.street,
        postal_code: address.zipCode,
        state: address.state,
      }
      const stripeOwnerId = await this.addStripeCustomer(
        body.email,
        body.companyName,
        stripeAddress
      );
      const timezone = body.timezone;
      const phoneNumber = body.phoneNumber;
      const heroLogoUrl = body.heroLogoURL;
      const logoUrl = body.logoURL;
      const trialActive = true; 
      const demoData = true;
      let theme = 'teal3';
      const paidStatus = 'UN_PAID';
      const status = 'Active';
      const superAdminPackages =
        await this.APIService.getSuperAdminPackagesPremium();
      const features = superAdminPackages.features;
      if (body.theme != null && body.theme != '') {
        theme = body.theme;
      }
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const waitingPeriod = false;
      const waitingPeriodStartDate = '';
      const addonStatus = true;
      const employeeAddStatus = true;
      const stripeCustomerId = stripeOwnerId;

      const newCompany = {
        address,
        atoDetails,
        phoneNumber,
        stripeCustomerId,
        currency,
        timezone,
        waitingPeriod,
        waitingPeriodStartDate,
        addonStatus,
        employeeAddStatus,
        companyName,
        noEmp,
        country,
        heroLogoUrl,
        logoUrl,
        theme,
        paidStatus,
        status,
        features,
        trialActive,
        demoData,
        createdAt,
        modifiedAt,
        dataRetention: {
          "leaveManagement":5,
          "boarding":5,
          "hiring":5,
          "files":5,
          "attendance":5,
          "projects":5,
          "rostering":5,
          "trainings":5,
          "payroll":5,
          "claims":5,
          "surveys":5,
          "assets":5,
          "approval":5,
          "Documents":5,
          "notification":5,
          "maxStorage":500
      },
      companyEmail: body.email,
      }; 
      const savedCompany = await this.APIService.postCompany(newCompany);
      const companyId = savedCompany.id;
      let surveyAnswer = '';
      if (body.hasOwnProperty('surveyAnswer')) {
        surveyAnswer = body.surveyAnswer;
        let surveyObj = {
          surveyAnswer,
          companyId,
        };
        await this.APIService.postSuperAdminSurvey(surveyObj);
      }
      await this.postSapEmailCount(companyId);
      const fullName = firstName + ' ' + lastName;
      
      const companyData = {
        verifyList: {
          paySchedule: false,
          businessLocations: false,
          holiday: false,
          manage: false,
          addEmployees: false,
        },
        activated: false,
        method: 'start-end',
        enableClock: true,
        isSingle: true,
        approvals: { access: 'Manager(Report to)', empId: '' },
        approveDate: { time: '', meridiem: 'AM', before: '5 days' },
        overtime: 'Sunday',
        mobile: true,
      };
      const data = companyData;
     const dummyData = await this.getDummyJsondata(); 
      await this.postAccessLevelsDummy(companyId,dummyData);
      
      await this.postDepartmentDummy(companyId,dummyData);
      await this.postDegreeDummy(companyId,dummyData);
      await this.postDivisionDummy(companyId,dummyData);
      await this.postEmergencyContactRelationshipDummy(companyId,dummyData);
      await this.postEmploymentStatusesDummy(companyId,dummyData);
      await this.postJobTitlesDummy(companyId,dummyData);
      await this.postTerminateReason(companyId,dummyData);
      await this.postLocationsDummy(companyId, dummyData,country);
      
      
      await this.postShirtSizeDummy(companyId, dummyData);
      //await this.postApprovalsAllDummy(companyId, dummyData);
      await this.postHiringCandidateStatusesDummy(companyId,dummyData);
      await this.postHiringCandidateSourcesDummy(companyId,dummyData);
      await this.postHiringEmailTemplatesDummy(companyId,dummyData);
      await this.postHiringEmailTemplatesDummy(companyId,dummyData);
      await this.employeeService.postDummyPayrollData(companyId, country);
      dummyData['username'] = body.email;

      const ownerIdName = await this.postFirstEmployeeDummy(
        body.userId,
        companyId,
        firstName,
        lastName,
        username,
        phoneNumber,
        dummyData,
        companyName
      );
      await this.postEmployeesDummy(companyId, noEmp, ownerIdName,dummyData,country);
      await this.postFolders(companyId,dummyData);
      await this.addTrialSubscription(currency, stripeOwnerId, companyId);
      await this.postReports(companyId,dummyData);
      const categories = await this.postCompanyLinksCategories(companyId,dummyData);
      await this.postCompanyLinks(
        companyId,
        categories.company,
        categories.otherLinks,
        categories.helpRequests,
        dummyData,
      );
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: ownerIdName.id },
      });
      await this.postClaimsCategories(companyId);
      
      let employeeIdList = [];
      const employees: HrmEmployeeDetails[] = await this.dataSource.query(
        `SELECT * FROM hrm_employee_details WHERE "companyId"='${companyId}'`
      );
      for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId !== ownerIdName.id) {
          employeeIdList.push(employees[i].employeeId);
        }
      }
      
     
      
      //const categoryIdList = ['15266c86-a8af-43df-a473-a8c30351829f','28b21f04-8b9c-4834-837a-6240375abb47','2af40c38-49e1-469a-a474-77328d5259ed','2ff3eddf-cacc-4d1a-833f-753af3ef2042','33258e43-5c9d-4958-853b-e21759d87b55']
      

      await this.postEmergencyContactDummy(employeeIdList, companyId,dummyData,country);
      await this.postNotesDummy(employeeIdList, companyId,employee,fullName,dummyData);
      await this.postTrainingCategoryDummy(companyId,dummyData);
      await this.postAssetsCategoryDummy(companyId,dummyData);
      await this.postAssetsDummy(companyId,employeeIdList,dummyData);
      await this.postOffboardingCategoriesDummy(companyId,dummyData);
      await this.postOnboardingCategoriesDummy(companyId,dummyData);
      await this.postTrainingDummy(companyId,dummyData);
      await this.postOnboardingDummy(companyId, employee,dummyData);
      await this.postOffboardingDummy(companyId, employee,dummyData);
      
      await this.postClaimsDummy(employeeIdList,companyId,dummyData);
      await this.postHolidays(companyId,country);
      await this.postPayrollPredefinedData(companyId,dummyData);
      await this.postPromotionRequestDummy(employees,ownerIdName,companyId,dummyData);
      await this.postStatusChangeRequest(employees,ownerIdName,companyId,dummyData);
      await this.postJobOpeningDummy(ownerIdName,companyId,dummyData);
      await this.postHiringCandidatesDummy(companyId,dummyData);
      await this.postTalentPoolsDummy(companyId,dummyData,ownerIdName);
      await this.postAnnouncementsDummy(companyId,dummyData,ownerIdName);
      //await this.postAssetsRequestsDummy(companyId,dummyData,employees);
      await this.postDummyOnboardingTask(companyId,dummyData);
       await this.postDummyOnboardingTemplate(companyId,dummyData);
      await this.postLeaves(companyId,dummyData, employee.employeeId, employeeIdList, country);
      await this.postAttendanceDummy(companyId, employees, timezone);

      // await this.postSurveyQuestionnairesDummy(companyId,dummyData);
      // await this.postDummySurveys(companyId);
       await this.postDummyProjects(companyId,dummyData);
      
      let employeeIdLists = [];
      const selectEmployees = await this.dataSource.query(
        `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1`,
        [companyId],
      );
      const ownerEmployee = await this.dataSource.query(
        `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active' AND "owner" = true ORDER BY RANDOM() LIMIT 1`,
        [companyId],
      );
      for (let i = 0; i < selectEmployees.length; i++) {
        employeeIdLists.push(selectEmployees[i].employeeId);
      
      }
      for (let i = 0; i < ownerEmployee.length; i++) {
        employeeIdLists.push(ownerEmployee[i].employeeId);
      
      }

      await this.postLeavesRequestDummy(companyId, employeeIdLists,dummyData);
      
      const testCompany = await this.APIService.getTestCompanyByEmail(
        body.email,
      );
      if (testCompany) {
        const employee = await this.employeeDetailsRepository.findOne({
          where: { owner: true, companyId: companyId },
        });
        const user = await this.dataSource.query(
          'SELECT * FROM hrm_users WHERE "userId"=$1',
          [employee.userId],
        ).then((res) => res[0]);
        user.emailVerified = true;
        await this.dataSource.getRepository(HrmUsers).save(user);
      }
      await this.APIService.postCoupons(companyId);
      return {
        companyId: companyId,
        employeeId: employee.employeeId,
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  getRandomElements(arr, count) {
    let _arr = arr.slice();
    let result = [];
    count = Math.min(count, _arr.length);

    for (let i = 0; i < count; i++) {
        let randomIndex = Math.floor(Math.random() * _arr.length);
        result.push(_arr.splice(randomIndex, 1)[0]);
    }
    return result;
}
  async postLeaves(companyId, dummyData: any, ownerId: string, employeeIdList: string[], country: string) {
    let leaveCategories: HrmLeaveCategories[] = dummyData['leaveCategories'];
    if (country === 'Australia') {
      let annualLeave = leaveCategories.find((leaveCategory) => leaveCategory.name === 'Vacation');
      let personalSickCarersLeave = leaveCategories.find((leaveCategory) => leaveCategory.name === 'Sick');
      annualLeave.name = 'Annual Leave';
      annualLeave.timeOffCategoryType = 'ANNUALLEAVE';
      annualLeave.timeUnit = 'HOURS';
      personalSickCarersLeave.name = "Personal (Sick/Carer's) Leave";
      personalSickCarersLeave.timeOffCategoryType = 'PERSONALSICKCARERSLEAVE';
      personalSickCarersLeave.timeUnit = 'HOURS';
      leaveCategories = [annualLeave, personalSickCarersLeave];
    }
    for (let i=0;i<leaveCategories.length;i++) {
      leaveCategories[i]['id'] = uuidv4();
      leaveCategories[i]['companyId'] = companyId;
      let assignees: string[] = this.getRandomElements(employeeIdList, 10);
      assignees.push(ownerId);
      leaveCategories[i].assignees.employeeIds = assignees;
      for (let j=0;j<leaveCategories[i].assignees.employeeIds.length;j++) {
          const leaveBalance = {
              "categoryId": leaveCategories[i]['id'],
              "employeeId":leaveCategories[i].assignees.employeeIds[j],
              "companyId": companyId,
              "total": leaveCategories[i].automaticAccrual.amount,
              "used": "0",
          } 
          await this.dataSource.getRepository(HrmLeaveBalances).save(leaveBalance);
      }
    }
    await this.dataSource.getRepository(HrmLeaveCategories).save(leaveCategories);
  }
  async postCompanyLinksCategories(companyId, dummyData: any) {
    const company = uuidv4();
    const otherLinks = uuidv4();
    const helpRequests = uuidv4();
    const dummy = dummyData['CompanyLinksCategories'];
    for (let i = 0; i < dummy.length; i++) {
      let id;
      if (dummy[i].id === 'company') {
        id = company;
      } else if (dummy[i].id === 'otherLinks') {
        id = otherLinks;
      } else if (dummy[i].id === 'helpRequests') {
        id = helpRequests;
      }
      const name = dummy[i].name;
      const createdAt = new Date();
      const modifiedAt = new Date();
      companyId = companyId;
      const data = {
        name,
        createdAt,
        modifiedAt,
        companyId,
      };
      const common = {
        id,
        type: 'companyLinksCategories',
        createdAt: new Date(),
        modifiedAt: new Date(),
        companyId,
        data: data
      }
      await this.commonRepository.save(common);
    }
    return { company, otherLinks, helpRequests };
  }
  async postCompanyLinks(companyId, company, otherLinks, helpRequests,dummyData: any) {
    const dummy = dummyData['CompanyLinks'];
    for (let i = 0; i < dummy.length; i++) {
      const title = dummy[i].title;
      const link = dummy[i].link;
      let categoryId;
      if (dummy[i].categoryId === 'otherLinks') {
        categoryId = otherLinks;
      } else if (dummy[i].categoryId === 'helpRequests') {
        categoryId = helpRequests;
      }
      const createdAt = new Date();
      const modifiedAt = new Date();
      companyId = companyId;
      const data = {
        title,
        link,
        categoryId,
        createdAt,
        modifiedAt,
        companyId,
      };
      const common = {
        type: 'companyLinks',
        createdAt: new Date(),
        modifiedAt: new Date(),
        companyId,
        data: data,
      };
      await this.commonRepository.save(common);
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  async postFirstEmployeeDummy(
    id,
    companyId: string,
    firstName: string,
    lastName: string,
    username: string,
    phoneNumber: string,
    dummyData: any,
    companyName: string
  ) {
    const dummy = dummyData['FirstEmployee'];
    try {
      dummy.personal.fullName.first = firstName;
      dummy.personal.fullName.last = lastName;
      dummy.personal.email.work = username;
      dummy.personal.phone.work = phoneNumber;
      dummy.personal.employee.username = username;
      const employee = await this.dataSource.query(
        `SELECT *
        FROM hrm_users u
        JOIN hrm_employee_details e ON e."userId" = u."userId" AND e."owner"='${true}' AND u."username"='${username}'`
      );
      if (process.env.HUBSPOT == 'enabled') {
        const hubspotClient = new hubspot.Client({"accessToken":process.env.HUBSPOT_ACCESS_TOKEN});
        const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: username,
                },
              ],
            },
          ],
        });

        if (searchResponse.total === 0) {
          const properties = {
            "email": username,
            "phone": phoneNumber,
            "company": "Biglytics",
            "website": companyName,
            "lastname": lastName,
            "firstname": firstName
          };
          const SimplePublicObjectInputForCreate = { properties };
          const apiResponse = await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate);
        }
      }
      const date = new Date(Date.now());
      dummy.personal.employee.hireDate = date.toISOString().slice(0, 10);
      dummy.job.effectiveDate = date.toString();
      const ownerIdName = await this.employeeService.postEmployee(
        id,
        dummy.personal.employee,
        companyId,
        'FULL_ADMIN',
        true,
        dummy,
        false,
        false
      );
      return ownerIdName;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEmployeesDummy(companyId: string, noEmp, ownerIdName, dummyData: any,country: string) {
    let dummy = dummyData['Employee'][country]? dummyData['Employee'][country]: dummyData['Employee']['Default'];
    try {
      let employee = 0;
      let manager = 0;
      if (noEmp == '24') {
        employee = 20;
        manager = 4;
      }
      if (noEmp == '50') {
        employee = 40;
        manager = 10;
      }
      if (noEmp == '75') {
        employee = 60;
        manager = 15;
      }
      if (noEmp == '100') {
        employee = 70;
        manager = 20;
      }
      const managerIds = [];
      for (let i = 0; i < manager; i++) {     
        dummy[i].personal.employee.hireDate = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().slice(0, 10);
        const managerIdName = await this.employeeService.postEmployee(
          uuidv4(),
          dummy[i].personal.employee,
          companyId,
          'MANAGER',
          false,
          dummy[i],
          false,
          true
        );
        managerIds.push(managerIdName);
        dummy[i].job.reportTo.reporterId = ownerIdName.id;
        dummy[i].job.reportTo.reporterName = ownerIdName.name;
        dummy[i].job.effectiveDate = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().slice(0, 10);
        await this.employeeService.postJobInformation(dummy[i].job, managerIdName.id);
      }

      for (let i = manager; i < manager + employee; i++) {
        dummy[i].personal.employee.hireDate = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().slice(0, 10);
        const managerIdName = await this.employeeService.postEmployee(
          uuidv4(),
          dummy[i].personal.employee,
          companyId,
          'EMPLOYEE',
          false,
          dummy[i],
          false,
          true
        );
        let no = Math.random();
        no = no * managerIds.length;
        dummy[i].job.reportTo.reporterId = managerIds[Math.floor(no)].id;
        dummy[i].job.reportTo.reporterName = managerIds[Math.floor(no)].name;
        dummy[i].job.effectiveDate = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().slice(0, 10);
        await this.employeeService.postJobInformation(dummy[i].job, managerIdName.id);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postTimeOffCategoryDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['TimeOffCategory'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const timeoffNo = dummy[i].timeoffNo;
        const name = dummy[i].name;
        const units = dummy[i].units;
        const icon = dummy[i].icon;
        const type = dummy[i].type;
        const noPay = dummy[i].noPay;
        const color = dummy[i].color;
        const fileUpload = dummy[i].fileUpload;
        const noPayCount = dummy[i].noPayCount; 
        const fileRequiredLimit = dummy[i].fileRequiredLimit;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const newTimeOffCategory = {
          timeoffNo,
          name,
          units,
          icon,
          type,
          fileUpload,
          fileRequiredLimit,
          color,
          noPayCount,
          noPay,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'timeOffCategories',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newTimeOffCategory
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postHiringEmailTemplatesDummy(companyId: string,dummyData: any) {
    const dummy = dummyData['HiringEmailsTemplates'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const subject = dummy[i].subject;
        const emailTemplate = dummy[i].emailTemplate;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newEmailTemplate = {
          name,
          subject,
          emailTemplate,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'hiringEmailTemplates',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newEmailTemplate
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postHiringCandidateSourcesDummy(companyId: string,dummyData: any) {
    const dummy = dummyData['HiringCandidateSources'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newCandidateStatuses =
          {
            name,
            createdAt,
            modifiedAt,
            companyId,
          };
          const common = {
            type: 'hiringCandidateSources',
            createdAt: new Date(),
            modifiedAt: new Date(),
            companyId,
            data: newCandidateStatuses
          }
          await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postHiringCandidateStatusesDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['HiringCandidatesStatus'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const type = dummy[i].type;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newCandidateStatuses =
          {
            name,
            type,
            createdAt,
            modifiedAt,
            companyId,
          };
          const common = {
            type: 'hiringCandidateStatuses',
            createdAt: new Date(),
            modifiedAt: new Date(),
            companyId,
            data: newCandidateStatuses
          }
          await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  // async postApprovalsAllDummy(companyId: string, dummyData: any) {
  //   const dummy = dummyData['ApprovalsAll1'];
  //   const list1 = [{ name: 'Full Admin(s)', list: [] }];
  //   const dummy1 = dummyData['ApprovalsAll2'];
  //   const list2 = [{ name: 'Full Admin(s)', list: [] }];
  //   try {
  //     for (let i = 0; i < dummy.length; i++) {
  //       const name = dummy[i];
  //       const list = list1;
  //       const createdAt = new Date(Date.now());
  //       const modifiedAt = new Date(Date.now());

  //       const newList = {
  //         name,
  //         list,
  //         createdAt,
  //         modifiedAt,
  //         companyId,
  //       };
  //       const common = {
  //         type: 'approvalsAll',
  //         createdAt: new Date(),
  //         modifiedAt: new Date(),
  //         companyId,
  //         data: newList
  //       }
  //       await this.commonRepository.save(common);
  //     }
  //     for (let i = 0; i < dummy1.length; i++) {
  //       const name = dummy1[i];
  //       const list = list2;
  //       const createdAt = new Date(Date.now());
  //       const modifiedAt = new Date(Date.now());

  //       const newList = {
  //         name,
  //         list,
  //         createdAt,
  //         modifiedAt,
  //         companyId,
  //       };
  //       const common = {
  //         type: 'approvalsAll',
  //         createdAt: new Date(),
  //         modifiedAt: new Date(),
  //         companyId,
  //         data: newList
  //       }
  //       await this.commonRepository.save(common);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async postShirtSizeDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['ShirtSize'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newShirtSize = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'shirtSize',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newShirtSize
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  

  async postTerminateReason(companyId: string, dummyData: any) {
    const dummy = dummyData['TerminateReason'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newTerminateReason = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'terminateReason',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newTerminateReason
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postLocationsDummy(companyId: string, dummyData: any,country: string) {
    const dummy = dummyData['Locations'][country]? dummyData['Locations'][country]:dummyData['Locations']['Default'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const remoteAddress = dummy[i].remoteAddress;
        const streetOne = dummy[i].streetOne;
        const streetTwo = dummy[i].streetTwo;
        const city = dummy[i].city;
        const state = dummy[i].state;
        const zip = dummy[i].zip;
        const country = dummy[i].country;
        const timezone = dummy[i].timezone;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newLocation = {
          name,
          remoteAddress,
          streetOne,
          streetTwo,
          city,
          state,
          zip,
          country,
          timezone,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'location',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newLocation
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postJobTitlesDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['JobTitles'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const eeoCategory = dummy[i].eeoCategory;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDivision = {
          name,
          eeoCategory,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'jobTitles',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDivision
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEmploymentStatusesDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['EmployeementStatus'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const fte = dummy[i].fte;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDivision = {
          name,
          fte,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'employmentStatuses',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDivision
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postEmergencyContactRelationshipDummy(companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['EmergancyContactRelationship'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDegree = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'emergencyContactRelationship',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDegree
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postDivisionDummy(companyId: string, dummyData: any) {
    try {
      const dummy = dummyData['Division'];
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDivision = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'division',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDivision
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postDepartmentDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['Department'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDegree = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'department',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDegree
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postDegreeDummy(companyId: string, dummyData: any) {
    const dummy = dummyData['Degree'];
    try {
      for (let i = 0; i < dummy.length; i++) {
        const name = dummy[i].name;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const newDegree = {
          name,
          createdAt,
          modifiedAt,
          companyId,
        };
        const common = {
          type: 'degree',
          createdAt: new Date(),
          modifiedAt: new Date(),
          companyId,
          data: newDegree
        }
        await this.commonRepository.save(common);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAccessLevelsDummy(companyId: string, dummyData: any) {
    //const dummy = dummyData['AccessLevel'];
    const dummy = [
    {
        "accessLevelName": "Admin",
        "accessLevelType": "FULL_ADMIN",
        "access": {
            "personal": {
                "profile": {
                    "access": true
                },
                "profile_img": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "personal": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "job": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "documents": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "notes": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "emergency": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "performance": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "training": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "onboarding": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "offboarding": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "payroll": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "claims": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "roster": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "timesheet": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "survey": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "asset": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                 "leave": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                }
            },
            "team": {
                "profile": {
                    "all": true,
                    "under": false,
                    "none": false
                },
                "profile_img": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "personal": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "job": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "documents": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "notes": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "emergency": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "performance": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "training": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "onboarding": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "offboarding": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "payroll": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "claims": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "roster": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "timesheet": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "survey": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "asset": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                  "leave": {
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                }
            },
            "featuresConfigs": {
                "leaves": {
                    "access": true,
                    "category": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "balance": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "holiday": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "survey": {
                    "access": true,
                    "templates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "surveys": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "hiring": {
                    "access": true,
                    "job": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "candidates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "talentPool": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "onboarding": {
                    "access": true,
                    "templates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "tasks": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "offboarding": {
                    "access": true,
                    "templates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "tasks": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "project": {
                    "access": true,
                    "project": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "timesheet": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "rostering": {
                    "access": true,
                    "sites": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "positions": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "staff": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "templates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "roster": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "attendance": {
                    "access": true,
                    "summary": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "settings": {
                    "access": true,
                    "general": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "companySettings": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "accessLevels": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "plans": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "customerSupport": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "files": {
                    "access": true,
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "claims": {
                    "access": true,
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "assets": {
                    "access": true,
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "payroll": {
                    "access": true,
                    "payrun": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "payItemSettings": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "payPeriodSettings": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "payTemplates": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "training": {
                    "access": true,
                    "settings": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    },
                    "tasks": {
                        "edit": true,
                        "delete": true,
                        "view": true,
                        "all": true
                    }
                },
                "announcement": {
                    "access": true,
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                },
                "companyLink": {
                    "access": true,
                    "edit": true,
                    "delete": true,
                    "view": true,
                    "all": true
                }
            },
            "approval": {
                "leaves": {
                    "all": true,
                    "team": false,
                    "none": false
                },
                "claims": {
                    "all": true,
                    "team": false,
                    "none": false
                },
                "information": {
                    "all": true,
                    "team": false,
                    "none": false
                },
                "assets": {
                    "all": true,
                    "team": false,
                    "none": false
                },
                "timesheet": {
                    "all": true,
                    "team": false,
                    "none": false
                }
            },
            "dashBoard": {
                "controlView": {
                    "calendarComponent": true,
                    "projectTaskComponent": true,
                    "newEmployeeComponent": true,
                    "attendanceComponent": true,
                    "companyLinkComponent": true,
                    "hiringComponent": true,
                    "reportComponent": true,
                    "payrollComponent": true,
                    "PendingClaimComponent": true
                },
                "personalView": {
                    "leaveComponent": true,
                    "calendarComponent": true,
                    "projectTaskComponent": true,
                    "newEmployeeComponent": true,
                    "attendanceComponent": true,
                    "clockInComponent": true,
                    "companyLinkComponent": true,
                    "trainingComponent": true
                }
            }
        }
    },
    {
      "accessLevelName": "Manager",
      "accessLevelType": "MANAGER",
      "access": {
          "personal": {
              "profile": {
                  "access": true
              },
              "profile_img": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "personal": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "job": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "documents": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "notes": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "emergency": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "performance": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "training": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "onboarding": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "offboarding": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "payroll": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "claims": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "roster": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "timesheet": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "survey": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "asset": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
               "leave": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              }
          },
          "team": {
              "profile": {
                  "all": false,
                  "under": true,
                  "none": false
              },
              "profile_img": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "personal": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "job": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "documents": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "notes": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "emergency": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "performance": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "training": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "onboarding": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "offboarding": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "payroll": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "claims": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "roster": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "timesheet": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "survey": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "asset": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
                "leave": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              }
          },
          "featuresConfigs": {
              "leaves": {
                  "access": false,
                  "category": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "balance": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "holiday": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "survey": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "surveys": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "hiring": {
                  "access": false,
                  "job": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "candidates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "talentPool": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "onboarding": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "offboarding": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "project": {
                  "access": false,
                  "project": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "timesheet": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "rostering": {
                  "access": false,
                  "sites": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "positions": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "staff": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "roster": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "attendance": {
                  "access": false,
                  "summary": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "settings": {
                  "access": false,
                  "general": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "companySettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "accessLevels": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "plans": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "customerSupport": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "files": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "claims": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "assets": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "payroll": {
                  "access": false,
                  "payrun": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payItemSettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payPeriodSettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payTemplates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "training": {
                  "access": false,
                  "settings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "announcement": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "companyLink": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              }
          },
          "approval": {
              "leaves": {
                  "all": false,
                  "team": true,
                  "none": false
              },
              "claims": {
                  "all": false,
                  "team": true,
                  "none": false
              },
              "information": {
                  "all": false,
                  "team": true,
                  "none": false
              },
              "assets": {
                  "all": false,
                  "team": true,
                  "none": false
              },
              "timesheet": {
                  "all": false,
                  "team": true,
                  "none": false
              }
          },
          "dashBoard": {
              "controlView": {
                  "calendarComponent": false,
                  "projectTaskComponent": false,
                  "newEmployeeComponent": false,
                  "attendanceComponent": false,
                  "companyLinkComponent": false,
                  "hiringComponent": false,
                  "reportComponent": false,
                  "payrollComponent": false,
                  "PendingClaimComponent": false
              },
              "personalView": {
                  "leaveComponent": true,
                  "calendarComponent": true,
                  "projectTaskComponent": true,
                  "newEmployeeComponent": true,
                  "attendanceComponent": true,
                  "clockInComponent": true,
                  "companyLinkComponent": true,
                  "trainingComponent": true
              }
          }
      }
    },
    {
      "accessLevelName": "Employee",
      "accessLevelType": "EMPLOYEE",
      "access": {
          "personal": {
              "profile": {
                  "access": true
              },
              "profile_img": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "personal": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "job": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "documents": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "notes": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "emergency": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "performance": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "training": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "onboarding": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "offboarding": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "payroll": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "claims": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "roster": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "timesheet": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              },
              "survey": {
                  "edit": true,
                  "delete": false,
                  "view": true,
                  "all": false
              },
              "asset": {
                  "edit": false,
                  "delete": false,
                  "view": true,
                  "all": false
              },
               "leave": {
                  "edit": true,
                  "delete": true,
                  "view": true,
                  "all": true
              }
          },
          "team": {
              "profile": {
                  "all": false,
                  "under": false,
                  "none": true
              },
              "profile_img": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "personal": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "job": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "documents": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "notes": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "emergency": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "performance": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "training": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "onboarding": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "offboarding": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "payroll": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "claims": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "roster": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "timesheet": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "survey": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "asset": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
                "leave": {
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              }
          },
          "featuresConfigs": {
              "leaves": {
                  "access": false,
                  "category": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "balance": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "holiday": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "survey": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "surveys": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "hiring": {
                  "access": false,
                  "job": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "candidates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "talentPool": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "onboarding": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "offboarding": {
                  "access": false,
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "project": {
                  "access": false,
                  "project": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "timesheet": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "rostering": {
                  "access": false,
                  "sites": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "positions": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "staff": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "templates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "roster": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "attendance": {
                  "access": false,
                  "summary": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "settings": {
                  "access": false,
                  "general": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "companySettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "accessLevels": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "plans": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "customerSupport": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "files": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "claims": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "assets": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "payroll": {
                  "access": false,
                  "payrun": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payItemSettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payPeriodSettings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "payTemplates": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "training": {
                  "access": false,
                  "settings": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  },
                  "tasks": {
                      "edit": false,
                      "delete": false,
                      "view": false,
                      "all": false
                  }
              },
              "announcement": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              },
              "companyLink": {
                  "access": false,
                  "edit": false,
                  "delete": false,
                  "view": false,
                  "all": false
              }
          },
          "approval": {
              "leaves": {
                  "all": false,
                  "team": false,
                  "none": true
              },
              "claims": {
                  "all": false,
                  "team": false,
                  "none": true
              },
              "information": {
                  "all": false,
                  "team": false,
                  "none": true
              },
              "assets": {
                  "all": false,
                  "team": false,
                  "none": true
              },
              "timesheet": {
                  "all": false,
                  "team": false,
                  "none": true
              }
          },
          "dashBoard": {
              "controlView": {
                  "calendarComponent": false,
                  "projectTaskComponent": false,
                  "newEmployeeComponent": false,
                  "attendanceComponent": false,
                  "companyLinkComponent": false,
                  "hiringComponent": false,
                  "reportComponent": false,
                  "payrollComponent": false,
                  "PendingClaimComponent": false
              },
              "personalView": {
                  "leaveComponent": true,
                  "calendarComponent": true,
                  "projectTaskComponent": true,
                  "newEmployeeComponent": true,
                  "attendanceComponent": true,
                  "clockInComponent": true,
                  "companyLinkComponent": true,
                  "trainingComponent": true
              }
          }
      }
    },
    {
      "accessLevelName": "PayrollAdmin",
      "accessLevelType": "PAYROLL_ADMIN",
      "access": {
        "team": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "profile": {
            "all": false,
            "none": true,
            "under": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "approval": {
          "assets": {
            "all": false,
            "none": true,
            "team": false
          },
          "claims": {
            "all": false,
            "none": true,
            "team": false
          },
          "leaves": {
            "all": false,
            "none": true,
            "team": false
          },
          "timesheet": {
            "all": false,
            "none": true,
            "team": false
          },
          "information": {
            "all": false,
            "none": true,
            "team": false
          }
        },
        "personal": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "profile": {
            "access": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "dashBoard": {
          "controlView": {
            "hiringComponent": false,
            "reportComponent": false,
            "payrollComponent": true,
            "calendarComponent": true,
            "attendanceComponent": false,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false,
            "PendingClaimComponent": false
          },
          "personalView": {
            "leaveComponent": false,
            "clockInComponent": false,
            "calendarComponent": false,
            "trainingComponent": false,
            "attendanceComponent": false,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false
          }
        },
        "featuresConfigs": {
          "files": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "assets": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "hiring": {
            "job": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "candidates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "talentPool": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "leaves": {
            "access": false,
            "balance": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "holiday": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "category": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "survey": {
            "access": false,
            "surveys": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "payroll": {
            "access": true,
            "payrun": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            },
            "payTemplates": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            },
            "payItemSettings": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            },
            "payPeriodSettings": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            }
          },
          "project": {
            "access": false,
            "project": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "timesheet": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "settings": {
            "plans": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "general": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "accessLevels": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "companySettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "customerSupport": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "training": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "settings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "appraisal": {
            "isAll": false,
            "access": false,
            "appraisal": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "rostering": {
            "sites": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "staff": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "roster": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "positions": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "attendance": {
            "access": false,
            "summary": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "onboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "companyLink": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "offboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "announcement": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          }
        }
      }
    },
    {
      "accessLevelName": "RecruitmentAdmin",
      "accessLevelType": "RECRUITMENT_ADMIN",
      "access": {
        "team": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "all": false,
            "none": true,
            "under": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "approval": {
          "assets": {
            "all": false,
            "none": true,
            "team": false
          },
          "claims": {
            "all": false,
            "none": true,
            "team": false
          },
          "leaves": {
            "all": false,
            "none": true,
            "team": false
          },
          "timesheet": {
            "all": false,
            "none": true,
            "team": false
          },
          "information": {
            "all": false,
            "none": true,
            "team": false
          }
        },
        "personal": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "access": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "dashBoard": {
          "controlView": {
            "hiringComponent": true,
            "reportComponent": false,
            "payrollComponent": false,
            "calendarComponent": false,
            "attendanceComponent": false,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false,
            "PendingClaimComponent": false
          },
          "personalView": {
            "leaveComponent": false,
            "clockInComponent": false,
            "calendarComponent": false,
            "trainingComponent": false,
            "attendanceComponent": false,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false
          }
        },
        "featuresConfigs": {
          "files": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "assets": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "hiring": {
            "job": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            },
            "access": true,
            "candidates": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            },
            "talentPool": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            }
          },
          "leaves": {
            "access": false,
            "balance": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "holiday": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "category": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "survey": {
            "access": false,
            "surveys": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "payroll": {
            "access": false,
            "payrun": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payTemplates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payItemSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payPeriodSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "project": {
            "access": false,
            "project": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "timesheet": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "settings": {
            "plans": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "general": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "accessLevels": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "companySettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "customerSupport": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "training": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "settings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "appraisal": {
            "isAll": false,
            "access": false,
            "appraisal": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "rostering": {
            "sites": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "staff": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "roster": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "positions": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "attendance": {
            "access": false,
            "summary": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "onboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "companyLink": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "offboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "announcement": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          }
        }
      }
    },
    {
      "accessLevelName": "PeopleAdmin",
      "accessLevelType": "PEOPLE_ADMIN",
      "access": {
        "team": {
          "job": {
            "all": false,
            "edit": true,
            "view": true,
            "delete": true
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "all": true,
            "none": false,
            "under": false
          },
          "personal": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "emergency": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          }
        },
        "approval": {
          "assets": {
            "all": false,
            "none": true,
            "team": false
          },
          "claims": {
            "all": false,
            "none": true,
            "team": false
          },
          "leaves": {
            "all": false,
            "none": true,
            "team": false
          },
          "timesheet": {
            "all": false,
            "none": true,
            "team": false
          },
          "information": {
            "all": true,
            "none": false,
            "team": false
          }
        },
        "personal": {
          "job": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "access": true
          },
          "personal": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "emergency": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "timesheet": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          }
        },
        "dashBoard": {
          "controlView": {
            "hiringComponent": false,
            "reportComponent": false,
            "payrollComponent": false,
            "calendarComponent": false,
            "attendanceComponent": false,
            "companyLinkComponent": false,
            "newEmployeeComponent": true,
            "projectTaskComponent": false,
            "PendingClaimComponent": false
          },
          "personalView": {
            "leaveComponent": false,
            "clockInComponent": false,
            "calendarComponent": false,
            "trainingComponent": false,
            "attendanceComponent": false,
            "companyLinkComponent": false,
            "newEmployeeComponent": true,
            "projectTaskComponent": false
          }
        },
        "featuresConfigs": {
          "files": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "assets": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "hiring": {
            "job": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "candidates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "talentPool": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "leaves": {
            "access": false,
            "balance": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "holiday": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "category": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "survey": {
            "access": false,
            "surveys": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "payroll": {
            "access": false,
            "payrun": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payTemplates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payItemSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payPeriodSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "project": {
            "access": false,
            "project": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "timesheet": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "settings": {
            "plans": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "general": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "accessLevels": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "companySettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "customerSupport": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "training": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "settings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "appraisal": {
            "isAll": false,
            "access": false,
            "appraisal": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "rostering": {
            "sites": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "staff": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "roster": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "positions": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "attendance": {
            "access": false,
            "summary": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "onboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "companyLink": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "offboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "announcement": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          }
        }
      }
    },
    {
      "accessLevelName": "TimesheetAdmin",
      "accessLevelType": "TIMESHEET_ADMIN",
      "access": {
        "team": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "all": false,
            "none": true,
            "under": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "approval": {
          "assets": {
            "all": false,
            "none": true,
            "team": false
          },
          "claims": {
            "all": false,
            "none": true,
            "team": false
          },
          "leaves": {
            "all": false,
            "none": true,
            "team": false
          },
          "timesheet": {
            "all": true,
            "none": false,
            "team": false
          },
          "information": {
            "all": false,
            "none": true,
            "team": false
          }
        },
        "personal": {
          "job": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "asset": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "leave": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "notes": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "roster": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "survey": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "payroll": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile": {
            "access": false
          },
          "personal": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "training": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "documents": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "emergency": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "timesheet": {
            "all": true,
            "edit": true,
            "view": true,
            "delete": true
          },
          "onboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "offboarding": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "performance": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          },
          "profile_img": {
            "all": false,
            "edit": false,
            "view": false,
            "delete": false
          }
        },
        "dashBoard": {
          "controlView": {
            "hiringComponent": false,
            "reportComponent": false,
            "payrollComponent": false,
            "calendarComponent": false,
            "attendanceComponent": true,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false,
            "PendingClaimComponent": false
          },
          "personalView": {
            "leaveComponent": false,
            "clockInComponent": false,
            "calendarComponent": false,
            "trainingComponent": false,
            "attendanceComponent": true,
            "companyLinkComponent": true,
            "newEmployeeComponent": true,
            "projectTaskComponent": false
          }
        },
        "featuresConfigs": {
          "files": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "assets": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "claims": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "hiring": {
            "job": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "candidates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "talentPool": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "leaves": {
            "access": false,
            "balance": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "holiday": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "category": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "survey": {
            "access": false,
            "surveys": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "payroll": {
            "access": false,
            "payrun": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payTemplates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payItemSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "payPeriodSettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "project": {
            "access": false,
            "project": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "timesheet": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "settings": {
            "plans": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "general": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "accessLevels": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "companySettings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "customerSupport": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "training": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "settings": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "appraisal": {
            "isAll": false,
            "access": false,
            "appraisal": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "rostering": {
            "sites": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "staff": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "roster": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "positions": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "attendance": {
            "access": true,
            "summary": {
              "all": true,
              "edit": true,
              "view": true,
              "delete": true
            }
          },
          "onboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "companyLink": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          },
          "offboarding": {
            "tasks": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            },
            "access": false,
            "templates": {
              "all": false,
              "edit": false,
              "view": false,
              "delete": false
            }
          },
          "announcement": {
            "all": false,
            "edit": false,
            "view": false,
            "access": false,
            "delete": false
          }
        }
      }
    }
    ]
    try {
      for (let i = 0; i < dummy.length; i++) {
        const accessLevelName = dummy[i].accessLevelName;
        const accessLevelType = dummy[i].accessLevelType;
        const access = dummy[i].access;

        const newAccessLevel = {
          accessLevelName,
          accessLevelType,
          access,
          companyId,
        };
        await this.dataSource.getRepository(accessLevels).save(newAccessLevel);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  

  async postCompanyVerificationStepOne(body: Body) {
    try {
      let Name = '';
      let Email = '';
      const json = {};
      const testCompany = await this.APIService.getTestCompanyByEmail(
        body['email'],
      );
      if (testCompany) {
        const user = await this.dataSource.query(
          'SELECT * FROM hrm_users WHERE "username"=$1',
          [body['email']],
        ).then((res) => res[0]);
        if (user) {
          json['email'] = 'used';
        } else {
          json['email'] = 'not-used';
        }
        
        
        json['emailVerify'] = true;
        json['emailRestricted'] = {
          emailUsed: false,
          data: { name: '', email: '' },
        };
        json['emailAuthorized'] = true;
        
      } else {
        let emailAuthorized = true;
        let emailVerify = false;
        let emailUsed = false;
        let domainUsed = false;
        const list = [
          'gmail.com',
          'yahoo.com',
          'outlook.com',
          'aol.com',
          'gmx.com',
          'zoho.com',
        ];
        if (body['email'] !== '') {
          let ind = body['email'].indexOf('@');
          let domain = body['email'].slice(ind + 1, body['email'].length);
          if (process.env.EMAIL_VERIFICATION === 'enabled' && list.includes(domain)) {
              emailAuthorized = false;
          }
        }
        json['emailAuthorized'] = emailAuthorized;

        const arr = body['email'].split('@');
        const employees = await this.dataSource.query(
          `SELECT *
          FROM hrm_employee_details e
          JOIN hrm_users u ON e."userId" = u."userId" AND e."owner"='${true}'`
        );

        for (let i = 0; i < employees.length; i++) {

          if (employees[i].username == body['email']) {
            emailUsed = true;
          }
          const company = await this.APIService.getCompanyById(
            employees[i].companyId,
          );

        }
        try {
          await dnsPromises.lookup(arr[1]);
          emailVerify = true;
        } catch (_) {
          emailVerify = false;
        }
        if (emailUsed) {
          json['email'] = 'used';
        } else {
          json['email'] = 'not-used';
        }

        
        
        
        
        
        json['emailVerify'] = emailVerify;
        json['emailRestricted'] = {
          emailUsed: domainUsed,
          data: { name: Name, email: Email },
        };
      }

      return json;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postCompanyVerificationStepTwo(body: Body) {
    try {
      const companyName = await this.APIService.getCompanyByName(
        body['companyName'],
      );
      let phone = false;
      const employees = await this.employeeDetailsRepository.find({
        where: { owner: true },
      });
      for (let i = 0; i < employees.length; i++) {
        if (employees[i].phone.work == body['phoneNumber']) {
          phone = true;
        }
      }
      const json = {};
      if (phone) {
        json['phoneNumber'] = 'used';
      } else {
        json['phoneNumber'] = 'not-used';
      }
      if (companyName.length != 0) {
        json['companyName'] = 'used';
      } else {
        json['companyName'] = 'not-used';
      }
      return json;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCompany(companyId: string) {
    try {
      const superAdminConfigFeaturesAll: superAdminConfigFeatures[] = await this.APIService.getSuperAdminConfigFeatures();
      let addonSlugsArray = [];
      const featuresSlugsArray = [];
      const access = [];
      const company = await this.APIService.getCompanyById(companyId);
      for (let i = 0; i < company.addonFeatures.length; i++) {
        const superAdminConfigFeatures = superAdminConfigFeaturesAll.find((s) => s.id === company.addonFeatures[i]);
        addonSlugsArray.push(superAdminConfigFeatures.slug);
      }
      for (let i = 0; i < company.features.length; i++) {
        const superAdminConfigFeatures = superAdminConfigFeaturesAll.find((s) => s.id === company.features[i]);
        featuresSlugsArray.push(superAdminConfigFeatures.slug);
      }
      for (let j = 0; j < company.addonFeatures.length; j++) {
        const superAdminConfigFeatures = superAdminConfigFeaturesAll.find((s) => s.id === company.addonFeatures[j]);
        delete superAdminConfigFeatures.name;
        delete superAdminConfigFeatures.category;
        delete superAdminConfigFeatures.status;
        delete superAdminConfigFeatures.description;
        delete superAdminConfigFeatures.createdAt;
        delete superAdminConfigFeatures.modifiedAt;
        access.push(superAdminConfigFeatures);
      }
      for (let j = 0; j < company.features.length; j++) {
        const superAdminConfigFeatures = superAdminConfigFeaturesAll.find((s) => s.id === company.features[j]);
        delete superAdminConfigFeatures.name;
        delete superAdminConfigFeatures.category;
        delete superAdminConfigFeatures.status;
        delete superAdminConfigFeatures.description;
        delete superAdminConfigFeatures.createdAt;
        delete superAdminConfigFeatures.modifiedAt;
        if (addonSlugsArray.includes(superAdminConfigFeatures.slug)) {
        } else {
          access.push(superAdminConfigFeatures);
        }
      }
      company['access'] = access;
      company['featuresSlugs'] = featuresSlugsArray;
      const superAdminCompanyFeatures: superAdminCompanyFeatures[] = await this.APIService.getSuperAdminCompanyFeatures(company.id);
      const superAdminCompanyFeaturesPackage = superAdminCompanyFeatures.find((s) => s.type === 'PACKAGE');
      const superAdminCompanyFeaturesaddon = superAdminCompanyFeatures.find((s) => s.type === 'ADDON');
      if (superAdminCompanyFeaturesPackage) {
        if (superAdminCompanyFeaturesaddon) {
        }
        const superAdminPackages =
          await this.APIService.getSuperAdminPackagesById(
            superAdminCompanyFeaturesPackage.packageId,
          );
        company['packages'] = superAdminPackages;
      } else {
        company['packages'] = {
          active: false,
        };
      }
      return company;
    } catch (error) {
      console.log('main-backend-err',error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCompanyById(id: string, body: Body) {
    try {
      let company = body;
      company['id'] = id;
      return await this.APIService.putCompany(company);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCompanyById(id: string, body: Body, type: string) {
    try {
      var execute: boolean;
      if (body.hasOwnProperty('execute')) {
        execute = body['execute'];
      } else {
        execute = false;
      }
      const company = await this.APIService.getCompanyById(id);
      const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "companyId"=$1 ',
        [id],
      );
      const owner = employeeDetails.find((e) => e.owner === true);
  
      if (execute === true && (type === 'dummy' || type === 'company')) {
        if (type === 'company') {
          const superAdminCompanyFeatures =
            await this.APIService.getActivePackageSuperAdminCompanyFeatures(id);
          if (!company.trialActive) {
            try {
              const deleted = await this.APIService.deleteStripeSubscription(
                superAdminCompanyFeatures.stripeSubscriptionId,
              );
            } catch (error) {
              console.log(error);
            }
          }
        }
        if (type === 'company') {
          await this.S3Service.deleteCompanyFolder(company.companyName);
        }
        
        if (type === 'company') {
          await this.dataSource.getRepository(AccAssets).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(AccClaims).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmAttendanceSummary).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmInformationRequest).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmLeaveBalances).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmLeaveCategories).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmLeaveHistory).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmLeaveRequests).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmRosterEmployees).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmRosterPositions).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmRosterShifts).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmRosterSites).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmRosterTemplates).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(hrmSurveyQuestionnaires).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(hrmSurveySurveys).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimeEntries).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimeProjects).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(Folders).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(Files).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmFiles).createQueryBuilder().delete().where({ companyId: id }).execute();
          //
          await this.employeeDetailsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.notificationsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.commonRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.reportsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.filesRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.foldersRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.notesRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.assetsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.claimsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.activityTrackingRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.AnnouncementsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.attendanceRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.boardingTaskEmployeesRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.customerSupportRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.offerLetterRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.performanceTaskRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.TalentPoolsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.TrainingCompleteRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimeProjects).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.APIService.deleteCompanyById(id);
        }
        if (type === 'dummy') {
          await this.notificationsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          for (let i=0;i<employeeDetails.length;i++) {
            if (employeeDetails[i].employeeId !== owner.employeeId) {
              await this.dataSource.getRepository(AccAssets).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(AccClaims).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmAttendanceSummary).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmInformationRequest).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmLeaveBalances).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmLeaveHistory).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmLeaveRequests).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmRosterEmployees).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmRosterShifts).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmTimeEntries).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.dataSource.getRepository(HrmFiles).createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              //
              await this.employeeDetailsRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.filesRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.notesRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.assetsRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.claimsRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.attendanceRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.boardingTaskEmployeesRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.performanceTaskRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.TrainingCompleteRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              await this.onboardingTaskRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
              await this.onboardingTemplateRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
              await this.hrmAttendanceSummaryRepository.createQueryBuilder().delete().where({ employeeId: employeeDetails[i].employeeId }).execute();
              
            }
          }
          await this.commonRepository.createQueryBuilder().delete().where({ companyId: id, type: "onboardingTask" }).execute();
          await this.commonRepository.createQueryBuilder().delete().where({ companyId: id, type: "offboardingTask" }).execute();
          await this.commonRepository.createQueryBuilder().delete().where({ companyId: id, type: "training" }).execute();
          await this.hrmHiringRepository.createQueryBuilder().delete().where({ companyId: id, type: "hrm_hiring_job" }).execute();
          await this.hrmHiringRepository.createQueryBuilder().delete().where({ companyId: id, type: "hrm_hiring_candidates" }).execute();
          await this.hrmAttendanceSummaryRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimeProjects).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.HrmLeaveHistoryRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.leaveRequestsRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimeEntries).createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ companyId: id }).execute();
          
          await this.onboardingTaskRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.onboardingTemplateRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          await this.attendanceRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          const leaveCategories: HrmLeaveCategories[] = await this.dataSource.query(
            'SELECT * FROM hrm_leave_categories WHERE "companyId"=$1',
            [id],
          );
          for (let i=0; i<leaveCategories.length; i++) {
            leaveCategories[i].assignees.employeeIds = [owner.employeeId];
          }
          await this.dataSource.getRepository(HrmLeaveCategories).save(leaveCategories);
          //await this.onboardingTemplateRepository.createQueryBuilder().delete().where({ companyId: id }).execute();
          company.demoData = false;
          await this.APIService.putCompany(company);
          await this.socketClient.sendDeleteAll(owner.employeeId);
        }
      }
    }
    catch (error) {
      console.log(error);
      
    }
  }
  dataList(type:string, compareWith: Date) {
    let match = false;
    let date = new Date();
    
    if (type == 'week') {
      date.setDate(date.getDate() - 7);
    }
    else if (type == 'month') {
      date.setMonth(date.getMonth() - 1);
    }
    else if (type == 'year') {
      date.setFullYear(date.getFullYear() - 1);
    }
    else if (type == 'six') {
      date.setMonth(date.getMonth() - 6);
    }
    if (date > compareWith) {
      match = true;
    }
    return match;
  }
  async getEligibilityCheck(companyId: string, employeeId: string) {
    

    let usernameList = [];
    let nameListString = '';
    let json = {
      hasOrgEmail: false,
      hasActiveAcc: false,
    };
    const list = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'aol.com',
      'gmx.com',
      'zoho.com',
    ];
    const employee = await this.employeeDetailsRepository.findOne({
      where: { owner: true, companyId: companyId },
    });
    const user = await this.dataSource.query(
      'SELECT * FROM hrm_users WHERE "userId"=$1',
      [employee.userId],
    ).then((res) => res[0]);
    let ind = user.username.indexOf('@');
    let domain = user.username.slice(ind + 1, user.username.length);
    if (list.includes(domain)) {
    } else {
      json.hasOrgEmail = true;
    }
    const employees = await this.dataSource.query(
      `SELECT *,
      FROM hrm_employee_details e
      JOIN hrm_users u ON e."userId" = u."userId" AND e."owner"='${true}'`
    );
    for (let i = 0; i < employees.length; i++) {
      const company = await this.APIService.getCompanyById(
        employees[i].companyId,
      );
      if (
        company.trialActive === true &&
        employees[i].username.includes(domain) &&
        employees[i].employeeId !== employeeId
      ) {
        usernameList.push(employees[i].username);
      }
      if (
        company.trialActive === false &&
        employees[i].username.includes(domain) &&
        employees[i].employeeId !== employeeId
      ) {
        json.hasActiveAcc = true;
        const body =  user.username + ' is trying to upgrade your Account'
        const emitBody = { sapCountType:'accountCreationAlert', companyId, subjects: 'Account Creation Alert', email: employees[i].username, body};
        this.eventEmitter.emit('send.email', emitBody);
      }
    }
    for (let i = 0; i < usernameList.length; i++) {
      const user = await this.dataSource.query(
        'SELECT * FROM hrm_users WHERE "username"=$1',
        [usernameList[i]],
      ).then((res) => res[0]);
      if (i === usernameList.length - 1) {
        nameListString =
          nameListString +
          user.firstName +
          ' ' +
          user.lastName +
          ' ';
        const owner = await this.dataSource.query(
          `SELECT *,
          FROM hrm_employee_details e
          JOIN hrm_users u ON e."userId" = u."userId" AND e."employeeId"='${employeeId}'`
        ).then((res) => res[0]);
        const body =  nameListString + ' in ur organization have trial accounts. Please terminate them'
        const emitBody = { sapCountType:'trialAccountDeletionAlert', companyId, subjects: 'Trial Account Deletion Alert', email: owner.username, body};
        this.eventEmitter.emit('send.email', emitBody);
      } else {
        nameListString =
          nameListString +
          user.firstName +
          ' ' +
          user.lastName +
          ', ';
      }
    }
    return json;
  }
  async postEmergencyContactDummy(employeeIdList: string[], companyId: string, dummyData: any, country: string) {
    try {
      let dummy = dummyData['EmergencyContacts'][country]? dummyData['EmergencyContacts'][country]: dummyData['EmergencyContacts']['Default'];
      
      for (let i = 0; i < employeeIdList.length; i++) {
        dummy[i].id = uuidv4();
        dummy[i].employeeId = employeeIdList[i];
        dummy[i]['createdAt'] = new Date();
        dummy[i]['modifiedAt'] = new Date();
        dummy[i]['companyId'] = companyId;
        const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: employeeIdList[i] } });
        
        employeeDetails.emergencyContacts.push(dummy[i]);
        await this.employeeDetailsRepository.save(employeeDetails);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getCompanyCommon(companyId: string) {
    try {
      const common: commonDto[] = await this.dataSource.query('SELECT * FROM hrm_configs WHERE "companyId" = $1', [companyId]);
      const payroll = await this.dataSource.query('SELECT * FROM hrm_payroll WHERE "companyId" = $1', [companyId]);
      let obj = {
        accessLevels: await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId" = $1', [companyId]),
        employeeFields: {
          department: common.filter((c) => c.type === 'department'),
          division: common.filter((c) => c.type === 'division'),
          location: common.filter((c) => c.type === 'location'),
          jobTitle: common.filter((c) => c.type === 'jobTitles'),
          degree: common.filter((c) => c.type === 'degree'),
          emergencyContactRelationship: common.filter((c) => c.type === 'emergencyContactRelationship'),
          employmentStatus: common.filter((c) => c.type === 'employmentStatuses'),
          terminationReason: common.filter((c) => c.type === 'terminateReason'),
          payGroup: common.filter((c) => c.type === 'payGroup'),
          paySchedule: common.filter((c) => c.type === 'paySchedule'),
          shirtSize: common.filter((c) => c.type === 'shirtSize'),
          assetCategory: common.filter((c) => c.type === 'assetCategory'),
          claimsCategory: common.filter((c) => c.type === 'claimsCategories'),
        },
        timeoff: {
          categories: common.filter((c) => c.type === 'timeOffCategory').map(obj => { obj.data['id'] = obj.id; return obj.data }),
          policies: common.filter((c) => c.type === 'timeOffPolicies').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        },
        // approvals: {
        //   informationUpdate: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'informationUpdate').map(obj => { return { list: obj.data.list }}),
        //   timeoffUpdate: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'timeoffUpdate').map(obj => { return { list: obj.data.list }}),
        //   employmentStatusApproval: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'employementStatusApproval').map(obj => { return { list: obj.data.list }}),
        //   jobInformationApproval: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'jobInformationApproval').map(obj => { return { list: obj.data.list }}),
        //   promotionApproval: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'promotionApproval').map(obj => { return { list: obj.data.list }}),
        //   assetApproval: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'assetApproval').map(obj => { return { list: obj.data.list }}),
        //   promotionRequest: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'promotionRequest').map(obj => { return { list: obj.data.list }}),
        //   employementStatusRequest: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'employementStatusRequest').map(obj => { return { list: obj.data.list }}),
        //   jobInformationRequest: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'jobInformationRequest').map(obj => { return { list: obj.data.list }}),
        //   assetRequest: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'assetRequest').map(obj => { return { list: obj.data.list }}),
        //   claimRequest: (common.filter((c) => c.type === 'approvalsAll')).filter((d) => d.data.name === 'claimRequest').map(obj => { return { list: obj.data.list }}),
        // },
        hiring: common.filter((c) => c.type === 'hiringCandidateStatuses').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        holidays: payroll.filter((c) => c.type === 'payroll_holiday').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        offboardingCategories: common.filter((c) => c.type === 'offboardingCategories').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        offboardingTask: common.filter((c) => c.type === 'offboardingTask').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        onboardingCategories: common.filter((c) => c.type === 'onboardingCategories').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        onboardingTask: common.filter((c) => c.type === 'onboardingTask').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        training: common.filter((c) => c.type === 'training').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        trainingCategory: common.filter((c) => c.type === 'trainingCategory').map(obj => { obj.data['id'] = obj.id; return obj.data }),
        attendance: common.filter((c) => c.type === 'attendanceSettings').map(obj => { obj.data['id'] = obj.id; return obj.data }),
      };
      return obj;
    }
    catch (error) {
      console.log(error);
    }
  }

  async postChangeOrg(employeeId: string, companyId: string) {
    try {    
      const jsonRes = {};
      var USERNAME = false;  
      var PASSWORD = true; 
      var HASACCESS = false; 
      var SUCCESS = false;
      const company = await this.APIService.getCompanyById(companyId);
      const companies = await this.APIService.getAllCompanies();
      let accounts = [];
      const specialUser: SpecialUser = await this.dataSource.query(
        `SELECT * from special_user WHERE "id" = $1`,[employeeId]
      ).then(res => res[0])

      if (specialUser) {
        for (let i=0;i<specialUser.companies.length;i++) {
          const company = companies.find((c) => c.id === specialUser.companies[i].companyId);
          const json = {}
          json['employeeId'] = specialUser.id;
          json['companyId'] = company.id;
          json['heroLogo'] = company.heroLogoUrl;
          json['companyName'] = company.companyName;
          json['hasAccess'] = specialUser.companies[i].isActive;
          json['userType'] = specialUser.type;
          json['accessLevelId'] = specialUser.companies[i].accessLevelId;
          json['heroLogoUrl'] = company.heroLogoUrl;
          accounts.push(json);
        }
      }

      const employee: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
        [employeeId],
      ).then((res) => res[0]);
      let jobInformation;
      if (employee) {
        employee.lastLogin = new Date();
        await this.dataSource.getRepository(HrmEmployeeDetails).save(employee);
        jobInformation = employee.jobInformation.find((jobInfo) => jobInfo.active === true);
        const employeeDetails: HrmEmployeeDetails[] = await this.dataSource.query(
          'SELECT * FROM hrm_employee_details WHERE "userId"=$1',
          [employee.userId],
        );
        for (let i=0;i<employeeDetails.length;i++) {
          const company = companies.find((c) => c.id === employeeDetails[i].companyId);
          const json = {}
          json['employeeId'] = employeeDetails[i].employeeId;
          json['companyId'] = employeeDetails[i].companyId;
          json['heroLogo'] = company.heroLogoUrl;
          json['companyName'] = company.companyName;
          json['hasAccess'] = employeeDetails[i].access;
          json['userType'] = employeeDetails[i].owner ? "OWNER" : "EMPLOYEE";
          json['accessLevelId'] = employeeDetails[i].accessLevelId;
          json['heroLogoUrl'] = company.heroLogoUrl;
          accounts.push(json);
        }
      }

      if ((specialUser && specialUser.companies.find((c) => c.companyId === companyId && c.isActive)) || employee.access) {
        HASACCESS = true;
      }
      if (HASACCESS) {
        USERNAME = true;
        PASSWORD = true;
        SUCCESS = true;
        jsonRes['employeeId'] = specialUser ? specialUser.id : employee.employeeId;
        jsonRes['profileImage'] = specialUser ? '' : employee.profileImage;
        jsonRes['employeeNo'] = specialUser ? '' : employee.employeeNo;
        jsonRes['employeeName'] = specialUser ? specialUser.firstName + ' ' + specialUser.lastName : employee.fullName.first + ' ' + employee.fullName.last;
        jsonRes['role'] = jobInformation ? jobInformation.jobTitle : '';
        jsonRes['companyId'] = company.id;
        jsonRes['companyName'] = company.companyName;
        jsonRes['theme'] = company.theme;
        jsonRes['createdAt'] = specialUser ? specialUser.createdAt : employee.createdAt;

      } 
        jsonRes['success'] = SUCCESS;
        jsonRes['username'] = USERNAME;
        jsonRes['emailVerified'] = true;
        jsonRes['hasAccess'] = HASACCESS;
        jsonRes['accounts'] = accounts;

        return ({profile: jsonRes, companyData: company});
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDirectSignupStepOne(employeeId: string) {
    const employee = await this.dataSource.query(
      `SELECT *
      FROM hrm_employee_details e
      JOIN hrm_users u ON e."userId" = u."userId" AND e."employeeId"='${employeeId}'`
    ).then((res) => res[0]);
    const company = await this.APIService.getCompanyById(employee.companyId);
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.username,
      phoneNumber: employee.phone.work,
      heroLogoUrl: company.heroLogoUrl,
      logoURL: company.logoURL,
      theme: company.theme,
    }
  }
  async postDirectSignup(req: Request) {
    try {
      const body = await this.postDirectSignupStepOne(req.body.employeeId);
      body['companyName'] = req.body.companyName;
      body['noEmp'] = '24';
      body['selectedCountry'] = req.body.country;
      body['timezone'] = req.body.timezone;
      body['password'] = ''
      const compRes = await this.postCompany(body);
      return await this.postChangeOrg(compRes.employeeId, compRes.companyId);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async updateItemCount(req: Request) {
    try {
      let message = 'Failed to update employee count';
      let payment = false;
      const superAdminCompanyFeaturesPackage = await this.APIService.getActivePackageSuperAdminCompanyFeatures(req.body.companyId);
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
        items.push({
          id: subscription.items.data[i].id,
          quantity: subscription.items.data[i].quantity + parseInt(req.body.count),
        });
        break;
      }
    }
    await this.APIService.updateStripeSubscription(
      superAdminCompanyFeaturesPackage.stripeSubscriptionId,
      items,
      "updateEmployeeCount"
    );
    const checkSub = await this.APIService.getStripeSubscription(
      superAdminCompanyFeaturesPackage.stripeSubscriptionId,
    );

    if (checkSub.pending_update) {
      const invoice = await this.APIService.voidInvoice(
        checkSub.latest_invoice,
      );
    } else {
      message = 'Successfully updated employee count';
      payment = true;
    }
    return {payment:payment, message: message};
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postSurveyQuestionnairesDummy(companyId: string,dummyData:any) {
    try {
      const dummySurveyQuestions = dummyData['SurveyQuestions'];
      const responses = [];
      for (const surveyData of dummySurveyQuestions) {
        const survey = new hrmSurveyQuestionnaires();
        survey.id = uuidv4(),
        survey.name = surveyData.name;
        survey.description = surveyData.description;
        survey.companyId = companyId;
        survey.isDefault = surveyData.isDefault;
        survey.createdAt = new Date();
        survey.modifiedAt = new Date()

        // Convert multipleAns to string
      const questionsWithStringMultipleAns = surveyData.questions.map((q) => ({
        ...q,
        multipleAns: JSON.stringify(q.multipleAns),
      }));

       survey.questions = questionsWithStringMultipleAns as {
        id: number;
        title: string;
        type: string;
        required: boolean;
        choices: string[];
        singleAns: string;
        multipleAns: string;
      }[];

        if (surveyData.isDefault) {
          await this.surveyQuestionnairesRepository.update(
            { companyId: survey.companyId },
            { isDefault: false },
          );
        }
        const surveyQuestionnaire =
          await this.surveyQuestionnairesRepository.save(survey);
        responses.push({ id: surveyQuestionnaire.name });
      }
      return {
        code: 201,
        message: 'survey Questionnaire  processed successfully.',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error posting survey questionnaires!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async postDummyProjects(companyId: string,dummyData:any) {
    try {
      const dummyProjects = dummyData['projectAndTimeSheet'];

      for (const project of dummyProjects) {
        project.companyId = companyId;
        // Select one employee with owner = true
        const ownerEmployee = await this.dataSource.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active' AND "owner" = true ORDER BY RANDOM() LIMIT 1`,
          [companyId],
        );

        if (ownerEmployee.length === 0) {
          throw new Error('No owner found for the company');
        }

        const selectAnother2Employees = await this.dataSource.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active' AND "owner" != true ORDER BY RANDOM() LIMIT 2`,
          [companyId],
        );

        const employees = [...ownerEmployee, ...selectAnother2Employees];
        for (let i = 0; i < project.tasks.length; i++) {
          project.tasks[i]['id'] = uuidv4();
          
          for (let j = 0; j < project.tasks[i].comments.length; j++) {
            project.tasks[i].comments[j]['id'] = uuidv4();
          }
        }
        /*function getRandomDuration(): string {
          const hours = Math.floor(Math.random() * 8) + 1;
          return `${hours.toString().padStart(2, '0')}:00:00`;
        }*/

        project.projectEmployees = employees.map((emp) => ({
          employeeId: emp.employeeId,
          ratePerHour: '',
          totalHours: '4:00:00',
          billedHours: '2:00:00',
        }));

        const savedProject = await this.dataSource
          .getRepository(HrmTimeProjects)
          .save(project);

        await this.postDummyProjectsTimeEntries(
          savedProject,
          companyId,
          employees,
        );
      }
      return {
        code: 201,
        message: 'Dummy projects processed successfully.',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error posting dummy projects!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async postDummyProjectsTimeEntries(
    project: HrmTimeProjects,
    companyId: string,
    employees,
  ) {
    try {
      const dummyTimeEntries = [];

      employees.forEach((emp) => {
        project.tasks.forEach((task) => {
          const entry = {
            projectId: project.id,
            employeeId: emp.employeeId,
            type: 'log',
            hasPeriod: false,
            companyId: companyId,
            date: new Date().toISOString().split('T')[0],

            billable: false,
            startTime: '09:00:00',
            endTime: '14:00:00',
            billedHours: '2:00:00',
            start: false,
            inProgress: false,
            duration: '4:00:00',
            billedStatus: 'un_biiled',
            taskId: task.id.toString(),
            note: 'Initial entry',
            isApproved: '',
            isRequested: '',
            beginTime: '',
          };
          dummyTimeEntries.push(entry);
        });
      });

      /*  const dummyTimeEntries = employees.map((emp) => ({

      }));*/

      for (const entry of dummyTimeEntries) {
        await this.dataSource.getRepository(HrmTimeEntries).save(entry);
      }

    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error posting dummy time entries!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async postDummySurveys(companyId: string) {
    try {
      console.log('Calling postDummySurveys');
  
      const dummySurveys = [
        {
          name: 'New Employee Onboarding Survey',
          description: 'Survey to gather feedback on the onboarding process',
          questions: [
            {
              id: 1,
              title: 'Any suggestions to improve the onboarding process?',
              type: 'paragraph',
              required: false,
              choices: [],
              singleAns: '',
              multipleAns: '',
            },
            {
              id: 2,
              title: 'Please provide a short answer about your experience.',
              type: 'short_answer',
              required: true,
              choices: [],
              singleAns: '',
              multipleAns: '',
            },
            {
              id: 3,
              title: 'Which of the following did you find most helpful?',
              type: 'multiple_choices',
              required: true,
              choices: ['Orientation', 'Mentorship', 'Training Sessions'],
              singleAns: '',
              multipleAns: '',
            },
            {
              id: 4,
              title: 'How was your overall onboarding experience?',
              type: 'rate',
              required: true,
              choices: ['1', '2', '3', '4', '5'],
              singleAns: '',
              multipleAns: '',
            },
            {
              id: 5,
              title: 'Select all that apply to your experience:',
              type: 'check_boxes',
              required: false,
              choices: ['Helpful', 'Informative', 'Engaging'],
              singleAns: '',
              multipleAns: '',
            },
          ],
          assignees: [
            {
              everyone: true,
              employeeGroups: [],
              employeeIds: [],
            },
          ],
          startDate: '2024-08-24',
          endDate: '2024-08-31',
          status: 'published',
          companyId: '',
        },
        
      ];
  
      const generateRandomAnswer = (type: string) => {
        const sampleParagraphs = [
          'I have a clear understanding of my role and responsibilities.',
          'I had a great experience.',
          'Everything was satisfactory.',
          'I feel encouraged to share my ideas and opinions.',
          'The technology and tools provided are up-to-date and efficient.',
      
        ];
        const sampleShortAnswers = [
          'I receive constructive feedback that helps me improve.',
          'I enjoyed the work environment.',
          'The team was very supportive.',
          'The company provides a healthy work-life balance.',
        ];
  
        if (type === 'paragraph') {
          return sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)];
        } else if (type === 'short_answer') {
          return sampleShortAnswers[Math.floor(Math.random() * sampleShortAnswers.length)];
        }
      };
  
      for (const surveyData of dummySurveys) {
        const survey = new hrmSurveySurveys();
        survey.name = surveyData.name;
        survey.description = surveyData.description;
        survey.questions = surveyData.questions || [];
        survey.responses = [];
        survey.assignees = surveyData.assignees || [];
        survey.startDate = surveyData.startDate;
        survey.endDate = surveyData.endDate;
        survey.status = surveyData.status;
        survey.companyId = companyId;
  
        let usersId = [];
        if (survey.assignees.some(assignee => assignee.everyone)) {
          usersId = await this.dataSource.query(
            `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active'`,
            [survey.companyId],
          );
        } else if (survey.assignees.some(assignee => assignee.employeeIds && assignee.employeeIds.length > 0)) {
          usersId = survey.assignees.flatMap(assignee => assignee.employeeIds.map((id) => ({
            employeeId: id,
          })));
        }
  
        if (usersId.length > 0) {
          survey.assignees.forEach(assignee => {
            assignee.employeeIds = usersId.map((emp) => emp.employeeId);
          });
  
          for (const employee of usersId) {
            const response = {
              userId: employee.employeeId,
              responses: survey.questions.map((question) => {
                if (question.type === 'rate' || question.type === 'multiple_choices') {
                  return {
                    ...question,
                    singleAns: question.choices[Math.floor(Math.random() * question.choices.length)],
                  };
                } else if (question.type === 'check_boxes') {
                  return {
                    ...question,
                    multipleAns: question.choices.filter(() => Math.random() > 0.5).join(', '),
                  };
                } else if (question.type === 'paragraph' || question.type === 'short_answer') {
                  return {
                    ...question,
                    singleAns: generateRandomAnswer(question.type),
                  };
                }
              }),
            };
            survey.responses.push(response);
          }
        }
  
        const surveySaved = await this.surveyRepository.save(survey);
  
        if (
          new Date(surveySaved.startDate).setHours(0, 0, 0, 0) ===
            new Date().setHours(0, 0, 0, 0) &&
          surveySaved.status === 'published'
        ) {
          await this.notificationService.addNotifications(
            'survey',
            'A new survey is available. Your feedback is valued!',
            surveySaved.id,
            surveySaved.companyId,
            surveySaved.id,
          );
        }
      }
  
      return {
        code: 201,
        message: 'Dummy surveys processed successfully.',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('Error posting dummy surveys!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDummyOnboardingTemplate(companyId: string,dummyData:any) {
    const dummyTemplates = dummyData['OnboardingTemplate'];

    try {
        for (const template of dummyTemplates) {
            template.companyId = companyId
            await this.onboardingTemplateRepository.save(template as onboardingTemplate);
        }

        return {
            message: 'Dummy onboarding templates saved successfully.',
            code: 201,
        };
    } catch (error) {
        console.error('Error saving dummy onboarding templates:', error);
        throw new HttpException('Failed to save dummy onboarding templates', HttpStatus.BAD_REQUEST);
    }
}
async postDummyOnboardingTask(companyId: string, dummyData:any) {
  try {
    const dummyTasks = dummyData['onboardingTask'];

    const generateRandomAnswer = (type: string) => {
      const sampleParagraphs = [
        'I have read and understood the handbook.',
        'No concerns at this time.',
        'Everything is clear.',
      ];
      const sampleShortAnswers = [
        'Yes, I have read it.',
        'No questions.',
        'All good.',
      ];

      if (type === 'paragraph') {
        return sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)];
      } else if (type === 'short_answer') {
        return sampleShortAnswers[Math.floor(Math.random() * sampleShortAnswers.length)];
      }
    };
    

    for (const taskData of dummyTasks) {
      const task = new OnboardingTask();
      task.id=uuidv4()
      task.name = taskData.name;
      task.description = taskData.description;
      task.categoryId = taskData.categoryId;
      task.questions = taskData.questions || [];
      task.startDate = taskData.startDate;
      task.endDate = taskData.endDate;
      task.status = taskData.status;
      task.companyId = companyId;
      task.responses = [];

      const assigneeData = {
        everyone: taskData.assignees.everyone,
        employeeGroups: taskData.assignees.employeeGroups || [],
        employeeIds: taskData.assignees.employeeIds || [],
      };

      
      task.assignees = assigneeData;

      let usersId = [];
      if (assigneeData.everyone) {
        usersId = await this.onboardingTaskRepository.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active'`,
          [task.companyId],
        );
      } else if (assigneeData.employeeIds.length > 0) {
        usersId = assigneeData.employeeIds.map((id) => ({
          employeeId: id,
        }));
      }

      task.assignees = {
        ...taskData.assignees,
        employeeIds: usersId.map(emp => emp.employeeId),
      };


      if (usersId.length > 0) {
        for (const employee of usersId) {
          const response = {
            employeeId: employee.employeeId,
            status: 'pending',
            responses: task.questions.map((question) => {
              if (question.type === 'paragraph' || question.type === 'short_answer') {
                return {
                  ...question,
                  singleAns: generateRandomAnswer(question.type),
                };
              } else if (question.type === 'rate' || question.type === 'multiple_choices') {
                return {
                  ...question,
                  singleAns: question.choices[Math.floor(Math.random() * question.choices.length)],
                };
              } else if (question.type === 'check_boxes') {
                return {
                  ...question,
                  multipleAns: question.choices.filter(() => Math.random() > 0.5),
                };
              }
            }),
          };
          task.responses.push(response);
        }
      }

      const taskSaved = await this.onboardingTaskRepository.save(task);

      if (
        new Date(taskSaved.startDate).setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0) &&
        taskSaved.status === 'pending'
      ) {
        
         await this.notificationService.addNotifications(
           'task',
           'A new onboarding task is available. Please complete it as soon as possible!',
           taskSaved.id,
           taskSaved.companyId,
           taskSaved.id,
         );
      }
    }

    return {
      code: 201,
      message: 'Dummy onboarding tasks processed successfully.',
    };
  } catch (error) {
    console.error(error);
    throw new HttpException('Error posting dummy onboarding tasks!', HttpStatus.BAD_REQUEST);
  }
}
async postLeavesRequestDummy(
  companyId: string,
  employeeIdList: string[],
  dummyData:any
) {
   const dummyLeaveRequest = dummyData['leaveRequest'];
  try {
    const categories: HrmLeaveCategories[] = await this.dataSource.query(
      `SELECT *
       FROM hrm_leave_categories
       WHERE "companyId" = $1`,
      [companyId]
    );

    for (let i = 0; i < dummyLeaveRequest.length; i++) {
      let totalDays = 0;
      let totalHours = 0;
      const leaveRequestData = dummyLeaveRequest[i];
      let {
        startDate,
        endDate,
        fileId,
        dateList,
        note,
        notificationId,
        historyId,
      } = leaveRequestData;

      const employeeId = employeeIdList[Math.floor(Math.random() * employeeIdList.length)];
      let category = categories[Math.floor(Math.random() * categories.length)];

      if (category.timeUnit === 'HOURS') {
        dateList = [{ date: dateList[0].date, amount: dateList[0].amount }];
        totalHours = dateList[0].amount;
      }
      else {
        dateList = dateList.map((obj) => { 
          return {
            date: obj.date, amount: '1' , dayPeriod: obj.dayPeriod
          }
         });
        totalDays = dateList.length;
      }

      const overlappingLeaves = await this.dataSource.query(
        `SELECT * FROM hrm_leave_requests WHERE "employeeId" = $1 AND "status" IN ('pending', 'approved') AND ("startDate" <= $2 AND "endDate" >= $3)`,
        [employeeId, endDate, startDate],
      );

      if (overlappingLeaves.length > 0) {
         /* console.log(`Overlapping leave request found for employeeId: ${employeeId}`); */
        continue;
      }

      const coverupPersonId = employeeIdList[Math.floor(Math.random() * employeeIdList.length)];
      const amount = category.timeUnit === 'HOURS' ? totalHours : totalDays;

      // Create leave history record
      const leaveHistory = await this.createLeaveHistory(
        employeeId,
        category.id,
        employeeId,
        String(amount),
        'Request Created',
        new Date().toISOString(),
        'REQUEST',
        note,
        companyId,
      );
      const id = uuidv4();
      const createdAt = new Date()
      const modifiedAt = new Date()
      const leaveRequest = {
        employeeId,
        categoryId: category.id,
        startDate,
        endDate,
        fileId,
        coverupPersonId,
        status: 'pending',
        totalHours: String(totalHours),
        totalDays: String(totalDays),
        dateList,
        note,
        notificationId,
        historyId,
        companyId,
        createdAt,
        modifiedAt,
        requesterId: employeeId,
      };
      leaveRequest.historyId = leaveHistory.id;
      leaveRequest.notificationId = id

      /* console.log(`Processing leave request for employee: ${employeeId}`);
      console.log(`Leave Request Data: ${JSON.stringify(leaveRequest)}`); */

      const usedLeaves = await this.dataSource.query(
        `SELECT b.*, p."timeUnit"
         FROM hrm_leave_balances b
         JOIN hrm_leave_categories p ON b."categoryId" = p."id" 
         WHERE b."employeeId" = $1 AND b."categoryId" = $2`,
        [employeeId, category.id],
      );

      const updatedLeaveBalance = usedLeaves[0];
      if (!updatedLeaveBalance) {
         /* console.log(`No leave balance found for employeeId: ${employeeId}, categoryId: ${categoryId}`); */
        continue;
      }

      if (updatedLeaveBalance.timeUnit === 'DAYS') {
        if (
          parseFloat(updatedLeaveBalance.total) <
          parseFloat(updatedLeaveBalance.used) + totalDays
        ) {
          /* console.log(`Insufficient leave balance in DAYS for employeeId: ${employeeId}`); */
          continue;
        }
        updatedLeaveBalance.used = (
          parseFloat(updatedLeaveBalance.used) + totalDays
        ).toString();
      } else if (updatedLeaveBalance.timeUnit === 'HOURS') {
        if (
          parseFloat(updatedLeaveBalance.total) <
          parseFloat(updatedLeaveBalance.used) + totalHours
        ) {
          /* console.log(`Insufficient leave balance in HOURS for employeeId: ${employeeId}`); */
          continue;
        }
        updatedLeaveBalance.used = (
          parseFloat(updatedLeaveBalance.used) + totalHours
        ).toString();
      }

      await this.dataSource
        .getRepository(HrmLeaveBalances)
        .save(updatedLeaveBalance);

        //const historyId = await this.createLeaveHistory(null, leaveRequest.employeeId, leaveRequest.categoryId, req.headers['userid'] as string, req.body.totalDays, req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1), dateRange, '', req.body.note, leaveBalance.companyId);

        const savedLeaveRequest = await this.dataSource
        .getRepository(HrmLeaveRequests)
        .save(leaveRequest);
     

    }

    return {
      code: 201,
      message: 'Leave requests processed successfully.',
    };
  } catch (error) {
    console.error(error);
    throw new HttpException(
      'Error creating dummy leave requests!',
      HttpStatus.BAD_REQUEST,
    );
  }
}

    async createLeaveHistory(
      employeeId: string,
      categoryId: string,
      changedBy: string,
      amount: string,
      action: string,
      date: string,
      actionType: string,
      note: string,
      companyId: string,
    ): Promise<HrmLeaveHistory> {
      const leaveHistory = new HrmLeaveHistory();
      leaveHistory.employeeId = employeeId;
      leaveHistory.categoryId = categoryId;
      leaveHistory.changedBy = changedBy;
      leaveHistory.amount = amount;
      leaveHistory.action = action;
      leaveHistory.date = date;
      leaveHistory.actionType = actionType;
      leaveHistory.note = note;
      leaveHistory.companyId = companyId;
      leaveHistory.createdAt = new Date();
      leaveHistory.modifiedAt = new Date();

      return await this.dataSource
        .getRepository(HrmLeaveHistory)
        .save(leaveHistory);
    }

    async postAbnVerification(abn: string, branchNo: string) {
      try {
        const res = {
          validate: false,
          message: "invalid",
          code: 404
        }
        const company = await this.APIService.getCompanyAbnVerification(abn, branchNo);
        if (company) {
          res.validate = true;
          res.message = 'success';
          res.code = 202;
        }
        return res;
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async postPhoneVerification(req: Request) {
      try {
        const companyId = req.body.companyId
        const body = await phoneVerificationTemplate(req.body.phoneNumber, req.body.companyName, req.body.companyId);
        const emitBody = { sapCountType:'phoneVerification', companyId, subjects: 'Request Phone Verification', email: process.env.ROMEOHR_CONTACT_EMAIL, body};
        this.eventEmitter.emit('send.email', emitBody);
        return {
          statusCode: 200,
          description: 'success',
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getVerifyPhone(companyId: string) {
      try {
        const company: CompanyDto = await this.APIService.getCompanyById(companyId);
        company.phoneNoVerified = true;
        await this.APIService.putCompany(company);
        return {
          statusCode: 200,
          description: 'success',
        };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCompanyStorage(companyId: string) {
      try {
        const company: CompanyDto = await this.APIService.getCompanyById(companyId);
        const files: Files[] = await this.dataSource.query(
          'SELECT * FROM files WHERE "companyId"=$1',
          [companyId],
        )
        let size = 0
        for (let i=0;i< files.length; i++) {
          if (files[i].size) {
            size = size + parseFloat(files[i].size);
          }
        }
        return {
          limit: company.dataRetention.maxStorage,
          usage: size * (1/1024) * (1/1024),
      };
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    async deleteEmployeeFields(companyId: string, idList: string[]) {
      try {
        await this.dataSource.getRepository(HrmConfigs)
        .createQueryBuilder()
        .delete()
        .where("companyId = :companyId AND id IN (:...idList)", {
          companyId: companyId,
          idList: idList
        })
        .execute();
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
}