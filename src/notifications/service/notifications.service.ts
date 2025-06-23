import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import { SocketClient } from '@flows/socket/socket-client';
import { format } from 'date-fns';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
import { EmailsNewService } from '@flows/ses/service/emails.service';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { S3Service } from '@flows/s3/service/service';
import { HrmTimeEntries } from '@flows/allEntities/timeEntries.entity';
import { HrmInformationRequest } from '@flows/allEntities/informationRequest.entity';
import { HrmTimesheetRequests } from '@flows/allEntities/timesheetRequests.entity';
import { inflate } from 'zlib';
import { AccAssets } from '@flows/allEntities/assets.entity';
import { AccClaims } from '@flows/allEntities/claims.entity';
import { HrmLeaveRequests } from '@flows/allEntities/leaveRequests.entity';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';
import {OnboardingTask} from '@flows/allEntities/OnboardingTask.entity'
import { getAppraisalDto } from '@flows/allDtos/appraisal.dto';
import { canApprove } from '@flows/access-levels/accessLevels.util';
@Injectable()
export class NotificationService {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly s3Service: S3Service,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(OnboardingTask) private onboardingTasksRepository: Repository<OnboardingTask>,
    @InjectRepository(HrmNotifications) private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmVerification) private verificationRepository: Repository<HrmVerification>,
    @InjectDataSource() private dataSource: DataSource,
  ) { }

  async addNotifications(type: string, message: string, featureId: string, companyId: string, requesterId: string, eligibleIdList?: string[], sendEmail?: boolean) {
    const notification = {
      readIds: [],
      referenceIds: {
        featureId: featureId,
        employeeIds: [],
        requesterId: requesterId
      },
      type: type,
      message: message,
      companyId: companyId
    }
    const eligibleEmployeeList = [];

    const employees = await this.dataSource.query(
      `SELECT * FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`,
      [notification.companyId],
    );
    
    for (let i = 0; i < employees.length; i++) {
      if (notification.type === 'timesheetRequest') {
        const approve = await canApprove(this.dataSource, employees[i].employeeId, 'timesheet', requesterId);
        if (approve) {
          eligibleEmployeeList.push(employees[i].employeeId);
        }
      }
      else if (notification.type === 'assetRequest') {
        const approve = await canApprove(this.dataSource, employees[i].employeeId, 'assets', requesterId);
        if (approve) {
          eligibleEmployeeList.push(employees[i].employeeId);
        }
      }
      else if (notification.type === 'claimRequest') {
        const approve = await canApprove(this.dataSource, employees[i].employeeId, 'claims', requesterId);
        if (approve) {
          eligibleEmployeeList.push(employees[i].employeeId);
        }
      }
      else if (notification.type === 'leaveRequest') {
        const approve = await canApprove(this.dataSource, employees[i].employeeId, 'leaves', requesterId);
        if (approve) {
          eligibleEmployeeList.push(employees[i].employeeId);
        }
      }
      else if (notification.type === 'personalInfoUpdate' ||
               notification.type === 'promotion' ||
               notification.type === 'jobInfoUpdate' ||
               notification.type === 'compensationUpdate' ||
               notification.type === 'jobInvitation' ||
               notification.type === 'candidate' ||
               notification.type === 'empStatusUpdate') {
        const approve = await canApprove(this.dataSource, employees[i].employeeId, 'information', requesterId);
        if (approve) {
          eligibleEmployeeList.push(employees[i].employeeId);
        }
      }
      else {
        eligibleEmployeeList.push(employees[i].employeeId);
      }
    }
    notification.referenceIds.employeeIds = [...eligibleEmployeeList];
    if (!(notification.type === 'assetRequest' || 
          notification.type === 'claimRequest' || 
          notification.type === 'informationRequest' || 
          notification.type === 'leaveRequest' || 
          notification.type === 'timesheetRequest')) {
      delete notification.referenceIds.requesterId;
    }

    if (notification.type === 'alert') {
      notification.referenceIds.employeeIds = [requesterId];
      delete notification.referenceIds.featureId;
      delete notification.referenceIds.requesterId;
    }
    // else if (notification.type === 'appraisalEmployee' || 
    //          notification.type === 'appraisal360' ||
    //          notification.type === 'OnboardingTask') {
    //   notification.referenceIds.employeeIds = eligibleIdList;
    // }
    if (eligibleIdList) {
      notification.referenceIds.employeeIds = eligibleIdList;
    }

    const savedNotification = await this.dataSource.getRepository(HrmNotifications).save(notification);
    await this.socketClient.sendNotificationRequest(savedNotification);
}

  async postJobInformation(jobInfo, id: string, type: string) {}

  async addNoPay(notificationData) {
    const type = 'addNoPay';
    const hidden = false;
    const createdAt = new Date();
    const modifiedAt = new Date();
    notificationData['totalDays'] = notificationData['total'];
    delete notificationData['total']
    let data = (notificationData);
    const id = uuidv4();
    const newAddNoPayNotification = {
      id, data, createdAt, modifiedAt
    };
    const newNotification = {
      mainType: 'request',
      data:newAddNoPayNotification,
      id,
      type,
      hidden,
      createdAt,
      modifiedAt,
    }
    const savedNotification = await this.notificationsRepository.save(
      newNotification
    );
  }
  async removeNoPay(notificationData) {
    const type = 'removeNoPay';
    const hidden = false;
    const createdAt = new Date();
    const modifiedAt = new Date();
    notificationData['totalDays'] = notificationData['total'];
    delete notificationData['total']
    let data = (notificationData);
    const id = uuidv4();
    const newRemoveNoPayNotification = {
      id, data, createdAt, modifiedAt
    };
    const newNotification = {
      mainType: 'request',
      data:newRemoveNoPayNotification,
      id,
      type,
      hidden,
      createdAt,
      modifiedAt,
    }
    const savedNotification = await this.notificationsRepository.save(
      newNotification
    );
  }

  async postRequest(data) {
    try {
      let informationRequest = data;
      informationRequest['requesterId'] = data.employeeId;
      const savedInformationUpdate = await this.dataSource.getRepository(HrmInformationRequest).save(informationRequest);
      await this.addNotifications(informationRequest.type, `${informationRequest.employeeName} is requesting a Personal Information Update`, savedInformationUpdate['id'], informationRequest.companyId, informationRequest.employeeId);
      return {
        code: 201,
        data: savedInformationUpdate
      }
    }
    catch (error) {
      console.log(error);   
    }
  }
  async postNotificationTemplateResponse(req: Request, header: Headers) {
    try {
      let body = { status: req.body.status };
      const notificationTemplateRes = await this.verificationRepository.findOne({where: {id: req.body.token}});
      if (notificationTemplateRes.status === "approved") {
        return {status: "executed"};
      }
      else {
        notificationTemplateRes.status = req.body.status;
        await this.verificationRepository.save(notificationTemplateRes);
        req.headers['userid'] = notificationTemplateRes.employeeId;
        req.headers['token'] = notificationTemplateRes.id;
        //await this.putTimeoffNotificationsById(req.body.notificationId, body, header);
        // const timeoffRequestNotification = await this.notificationsRepository.findOne({where: {id: req.body.notificationId}});
        // return timeoffRequestNotification.data;
      }
    }
    catch (error) {
      console.log(error);   
    }
  }
  async getRequestNotifications(all: boolean, type: string, employeeId: string, companyId: string) {
    try {
      const informationRequestType = ['informationRequest', 'empstatus', 'personalInfoUpdate', 'promotion', 'jobInfoUpdate', 'compensationUpdate'];
      let res: HrmNotifications[] = [];
      let notifications: HrmNotifications[];    
      if (all) {
        notifications = await this.dataSource.query(
          `SELECT * FROM hrm_notifications WHERE "companyId" = $1`,
          [companyId]
        );
      }
      
      else {
        notifications = await this.dataSource.query(
          `SELECT * FROM hrm_notifications WHERE type = $1 AND "companyId" = $2`,
          [type, companyId],
        );
      }
      for (let i=0;i<notifications.length;i++) {
        if (notifications[i].referenceIds.employeeIds.includes(employeeId)) {
          if (informationRequestType.includes(notifications[i].type)) {
            notifications[i].type === informationRequestType[0];
          }
          res.push(notifications[i]);
        }
      }
      return {
        status: 'success',
        notifications: res
      }
    }
    catch (error) {
      console.log(error);   
    }
  }
  async getInformationRequestById(id: string) {
    try {
      const informationRequest: HrmInformationRequest = await this.dataSource.query(
        "SELECT * FROM hrm_information_request WHERE id = $1",
        [id],
      ).then((res) => res[0]);
      return informationRequest;
    }
    catch (error) {
      console.log(error);   
    }
  }
/* async putInformationRequestById(id: string, req: Request) {
    try {
        let informationRequest: HrmInformationRequest = await this.dataSource.query(
            "SELECT * FROM hrm_information_request WHERE id = $1",
            [id],
        ).then((res) => res[0]);

        if (!informationRequest) {
            throw new Error(`Information request with ID ${id} not found.`);
        }

        if (!informationRequest.formData || Object.keys(informationRequest.formData).length === 0) {
            throw new Error("No form data provided. Update cannot proceed.");
        }

        const existingEmployee = await this.dataSource.getRepository(HrmEmployeeDetails)
            .findOne({ where: { employeeId: informationRequest.employeeId } });

        if (!existingEmployee) {
            throw new Error(`Employee with ID ${informationRequest.employeeId} not found.`);
        }

        informationRequest.status = req.body.status;

        // Function to merge objects
        const mergeChanges = (target: any, source: any) => {
            for (const key in source) {
                if (Array.isArray(source[key])) {
                    target[key] = target[key] ? [...target[key], ...source[key]] : [...source[key]];
                } else if (source[key] instanceof Object && key in target) {
                    target[key] = mergeChanges({ ...target[key] }, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        let updatedEmployeeData = {
            ...existingEmployee,
            employeeId: informationRequest.employeeId,
        };

        updatedEmployeeData = mergeChanges(updatedEmployeeData, informationRequest.formData);

        await this.dataSource.getRepository(HrmInformationRequest).save(informationRequest);
        await this.dataSource.getRepository(HrmEmployeeDetails).save(updatedEmployeeData);

        return informationRequest;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
 */
  
async putInformationRequestById(id: string, req: Request) {
  try {
    
    let informationRequest: HrmInformationRequest = await this.dataSource.query(
      'SELECT * FROM hrm_information_request WHERE id = $1',
      [id],
    ).then((res) => res[0]);

   
    informationRequest.status = req.body.status;

   
    await this.dataSource.getRepository(HrmInformationRequest).save(informationRequest);

    
    if (req.body.status !== 'denied') {
      const existingEmployee = await this.dataSource.getRepository(HrmEmployeeDetails)
        .findOne({ where: { employeeId: informationRequest.employeeId } });

      if (!existingEmployee) {
        throw new Error('Employee not found');
      }

    
      const mergeChanges = (target: any, source: any) => {
        for (const key in source) {
            if (Array.isArray(source[key])) {
             
                target[key] = target[key] ? [...target[key], ...source[key]] : [...source[key]];
            } else if (source[key] instanceof Object && key in target) {
             
                target[key] = mergeChanges({...target[key]}, source[key]);
            } else {
                
                target[key] = source[key];
            }
        }
        return target;
    };

      
      let updatedEmployeeData = {
        ...existingEmployee, 
        employeeId: informationRequest.employeeId
      };

      updatedEmployeeData = mergeChanges(updatedEmployeeData, informationRequest.formData);
      await this.dataSource.getRepository(HrmEmployeeDetails).save(updatedEmployeeData);
    }

      return informationRequest;

  } catch (error) {
    console.log(error);
    throw error;
  }
}

  async deleteInformationRequestById(id: string) {
    try {
      await this.dataSource.getRepository(HrmInformationRequest).createQueryBuilder().delete().where({ id: id }).execute();
    }
    catch (error) {
      console.log(error);   
    }
  }
  async getTimesheetRequestById(id: string) {
    try {
      const timesheetRequest: HrmTimesheetRequests = await this.dataSource.query(
        "SELECT * FROM hrm_timesheet_requests WHERE id = $1",
        [id],
      ).then((res) => res[0]);
      return timesheetRequest;
    }
    catch (error) {
      console.log(error);   
    }
  }
  async postTimesheetRequest(req: Request) {
    const employee: HrmEmployeeDetails = await this.dataSource.query(
      'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
      [req.body.employeeId],
    ).then(res => res[0]);

      const timesheetRequest = {
        status: req.body.status,
        employeeId: req.body.employeeId,
        requestPeriod: req.body.requestPeriod,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        timeEntries: req.body.timeEntries,
        companyId: req.body.companyId,
        requesterId: req.headers['userid'] as string
      }
      for (let i=0;i<timesheetRequest.timeEntries.length;i++) {
        timesheetRequest.timeEntries[i].isRequested = true;
        const timeEntry = await this.dataSource.getRepository(HrmTimeEntries).save(timesheetRequest.timeEntries[i]);
      }
      const savedTimesheetRequest = await this.dataSource.getRepository(HrmTimesheetRequests).save(timesheetRequest);
      await this.addNotifications('timesheetRequest', `${employee.fullName.first + ' ' + employee.fullName.last} is requesting a Timesheet Approval for ${format(new Date(timesheetRequest.startDate), 'do MMM, y')} to ${format(new Date(timesheetRequest.endDate), 'do MMM, y')}.`, savedTimesheetRequest['id'], req.body.companyId, req.headers['userid'] as string);
      return {
        code: 201,
        data: savedTimesheetRequest
      }
  }
  async deleteTimesheetRequestById(id: string) {
    try {
      await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ id: id }).execute();
    }
    catch (error) {
      console.log(error);   
    }
  }
  async getRequestsByEmployeeId(all: boolean, type: string, from: string, to: string, employeeId: string, companyId: string) {
    try {
      let total = 0;
      let requests = [];
      const accessLevels: accessLevels[] = await this.dataSource.query(
        'SELECT * FROM access_levels WHERE "companyId"=$1 AND "accessLevelType" IN ($2, $3)', 
        [companyId, 'FULL_ADMIN', 'MANAGER']
      );
      const accessLevelIds = accessLevels.map(a => a.id);
      
      const employeeList: HrmEmployeeDetails[] = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "companyId"=$1',
        [companyId],
      );
      const reportableIds = [];
      for (let i=0;i<employeeList.length;i++) {
        const activeJobInformation = employeeList[i].jobInformation.find((j) => j.active === true);
        if (employeeList[i].owner) {
          reportableIds.push(employeeList[i].employeeId);
        }
        else if (accessLevelIds.includes(employeeList[i].accessLevelId)) {
          reportableIds.push(employeeList[i].employeeId);
        }
        else if (activeJobInformation && activeJobInformation.reportTo.reporterId === employeeId) {
          reportableIds.push(employeeList[i].employeeId);
        }
      }
      //console.log('reportableIds',reportableIds)
      if (all) {
        const assets: AccAssets[] = await this.dataSource.query(
          'SELECT * FROM acc_assets WHERE "companyId"=$1',
          [companyId],
        );
        const claims: AccClaims[] = await this.dataSource.query(
          'SELECT * FROM acc_claims WHERE "companyId"=$1',
          [companyId],
        );
        const informationRequest: HrmInformationRequest[] = await this.dataSource.query(
          'SELECT * FROM hrm_information_request WHERE "companyId"=$1',
          [companyId],
        );
        const leaveRequests: HrmLeaveRequests[] = await this.dataSource.query(
          'SELECT * FROM hrm_leave_requests WHERE "companyId"=$1',
          [companyId],
        );
        const timesheetRequests: HrmTimesheetRequests[] = await this.dataSource.query(
          'SELECT * FROM hrm_timesheet_requests WHERE "companyId"=$1',
          [companyId],
        );
        for (let i=0; i<assets.length; i++) {
          requests.push({
            type: "assetRequest",
            data: assets[i]
          });
        }
        for (let i=0; i<claims.length; i++) {
          requests.push({
            type: "claimRequest",
            data: claims[i]
          });
        }
        for (let i=0; i<informationRequest.length; i++) {
          requests.push({
            type: "informationRequest",
            data: informationRequest[i]
          });
        }
        for (let i=0; i<leaveRequests.length; i++) {
          requests.push({
            type: "leaveRequest",
            data: leaveRequests[i]
          });
        }
        for (let i=0; i<timesheetRequests.length; i++) {
          requests.push({
            type: "timesheetRequest",
            data: timesheetRequests[i]
          });
        }
        total = assets.length + claims.length + informationRequest.length + leaveRequests.length + timesheetRequests.length;
      }
      else {
        let tableName = '';
        if (type === 'assetRequest') {
          tableName = 'acc_assets'
        }
        else if (type === 'claimRequest') {
          tableName = 'acc_claims'
        }
        else if (type === 'informationRequest') {
          tableName = 'hrm_information_request'
        }
        else if (type === 'leaveRequest') {
          tableName = 'hrm_leave_requests'
        }
        else if (type === 'timesheetRequest') {
          tableName = 'hrm_timesheet_requests'
        }
        const request = await this.dataSource.query(
          `SELECT * FROM ${tableName} WHERE "companyId"=$1`,
          [companyId],
        );
        for (let i=0; i<request.length; i++) {
          requests.push({
            type: type,
            data: request[i]
          });
        }
        total = request.length;
      }
      requests.sort((a: {data: {createdAt: string}}, b: {data: {createdAt: string}}) => {
        return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
    });
      let filtered = [];
      let i = parseInt(from);
      for (i ; i<= parseInt(to); i++) {
        if (requests.length > i && reportableIds.includes(employeeId)) {
          filtered.push(requests[i]);
        }
      }
      return {
        total: total,
        requests: filtered
      }
    }
    catch (error) {
      console.log(error);   
    }
  }
  async getRequestById(id: string) {
    let request;
    const assets: AccAssets = await this.dataSource.query(
      'SELECT * FROM acc_assets WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    const claims: AccClaims = await this.dataSource.query(
      'SELECT * FROM acc_claims WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    const informationRequest: HrmInformationRequest = await this.dataSource.query(
      'SELECT * FROM hrm_information_request WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    const leaveRequests: HrmLeaveRequests = await this.dataSource.query(
      'SELECT * FROM hrm_leave_requests WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    const timesheetRequests: HrmTimesheetRequests = await this.dataSource.query(
      'SELECT * FROM hrm_timesheet_requests WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    if (assets) {
      request = {
        type: 'assetRequest',
        request: assets
      }
    }
    else if (claims) {
      request = {
        type: 'claimRequest',
        request: claims
      }
    }
    else if (informationRequest) {
      request = {
        type: 'informationRequest',
        request: informationRequest
      }
    }
    else if (leaveRequests) {
      request = {
        type: 'leaveRequest',
        request: leaveRequests
      }
    }
    else if (timesheetRequests) {
      request = {
        type: 'timesheetRequest',
        request: timesheetRequests
      }
    }
    return request;
  }
  async putRequestById(id: string, status: string) {
    const assets: AccAssets = await this.dataSource.query(
      'SELECT * FROM acc_assets WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    const claims: AccClaims = await this.dataSource.query(
      'SELECT * FROM acc_claims WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
   
    const timesheetRequests: HrmTimesheetRequests = await this.dataSource.query(
      'SELECT * FROM hrm_timesheet_requests WHERE "id"=$1',
      [id],
    ).then((res) => res[0]);
    if (assets) {
      assets.status = status;
      await this.dataSource.getRepository(AccAssets).save(assets);
    }
    else if (claims) {
      claims.status = status;
      if (status == 'denied'){
        await this.addNotifications('claims', `Your request has been denied`, claims.id, claims.companyId, claims.employeeId,[claims.employeeId]);
      }if(status == 'approved') {
        await this.addNotifications('claims', `Your request has been approved`, claims.id, claims.companyId, claims.employeeId,[claims.employeeId]);
      }
      await this.dataSource.getRepository(AccClaims).save(claims);
    }
    else if (timesheetRequests) {
      timesheetRequests.status = status;
      if (status === 'approved') {
      for (let i=0;i<timesheetRequests.timeEntries.length;i++) {
   
        timesheetRequests.timeEntries[i].isApproved = true;
        const timeEntry = await this.dataSource.getRepository(HrmTimeEntries).save(timesheetRequests.timeEntries[i]);
        
      }
    }
    if(status === 'withdrawn') {
      for (let i=0;i<timesheetRequests.timeEntries.length;i++) {
        timesheetRequests.timeEntries[i].isRequested = false;
        const timeEntry = await this.dataSource.getRepository(HrmTimeEntries).save(timesheetRequests.timeEntries[i]);
      }
    }
      await this.dataSource.getRepository(HrmTimesheetRequests).save(timesheetRequests);
    }
    return {
      status: 'success'
    }
  }
  async deleteRequestById(id: string) {
    await this.dataSource.getRepository(AccAssets).createQueryBuilder().delete().where({ id: id }).execute();
    await this.dataSource.getRepository(AccClaims).createQueryBuilder().delete().where({ id: id }).execute();
    await this.dataSource.getRepository(HrmInformationRequest).createQueryBuilder().delete().where({ id: id }).execute();
    await this.dataSource.getRepository(HrmLeaveRequests).createQueryBuilder().delete().where({ id: id }).execute();
    await this.dataSource.getRepository(HrmTimesheetRequests).createQueryBuilder().delete().where({ id: id }).execute();
    return {
      status: 'success'
    }
  }
  async addReadEmployee(notificationId: string, req: Request) {
    try {
      const notification: HrmNotifications = await this.dataSource.query(
        'SELECT * FROM hrm_notifications WHERE "id"=$1',
        [notificationId],
      ).then((res) => res[0]);
      notification.readIds.push(req.body.employeeId);
      await this.dataSource.getRepository(HrmNotifications).save(notification);
      return {
        status: 'success'
      }
    } catch (error) {
      console.log(error);   
    }
  }
  
}
