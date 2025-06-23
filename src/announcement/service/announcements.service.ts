
import { Announcements } from '@flows/allDtos/announcements.dto';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { SocketClient } from '@flows/socket/socket-client';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response, Request } from 'express';
import { Not, DataSource, Repository } from 'typeorm';
import {v4 as uuidv4} from 'uuid';
@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly notificationService: NotificationService,
    @InjectRepository(HrmAnnouncements)
    private announcementsRepository: Repository<HrmAnnouncements>,
    @InjectRepository(HrmNotifications)
    private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectDataSource() private dataSource: DataSource,
  ) { }

  async announcementsFilter(announcement: Announcements) {
    try {
      const activeEmployeeStatus = [];
      const activeJobInformation = [];
      let MainEmployeeIdList = [];
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: announcement.companyId, status: Not('Non Active')}});
      for (let i = 0; i < employeeDetails.length; i++) {
        const employeeStatus = employeeDetails[i].employeeStatus.find((status) => status.active === true);
        const jobInformation = employeeDetails[i].jobInformation.find((status) => status.active === true);
        activeEmployeeStatus.push(employeeStatus);
        activeJobInformation.push(jobInformation);
      }
      for (let i=0;i<employeeDetails.length;i++) {
        MainEmployeeIdList.push(employeeDetails[i].employeeId);
      }
      if (!announcement.emailAll) {
        if (announcement.emailList[0].list.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < announcement.emailList[0].list.length; j++) {
            const empIdsDepartment = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.department === announcement.emailList[0].list[j]);
  
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
          //
        }
        if (announcement.emailList[1].list.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < announcement.emailList[1].list.length; j++) {
            const empIdsDivision = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.division === announcement.emailList[1].list[j]);             
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
          //
        }
        if (announcement.emailList[2].list.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < announcement.emailList[2].list.length; j++) {
            const empIdsEmployementstatus = activeEmployeeStatus.filter((status) => status.active === true && status.status === announcement.emailList[2].list[j]);
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
          //
        }
        if (announcement.emailList[3].list.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < announcement.emailList[3].list.length; j++) {
            const empIdsJobtitle = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.jobTitle === announcement.emailList[3].list[j]);  
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
        if (announcement.emailList[4].list.length > 0) {
          let employeeIdList = [];
          for (let j = 0; j < announcement.emailList[4].list.length; j++) {
            const empIdsLocation = activeJobInformation.filter((jobInfo) => jobInfo.active === true && jobInfo.location === announcement.emailList[4].list[j]); 
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
      }
      MainEmployeeIdList = [...new Set(MainEmployeeIdList)];
      return MainEmployeeIdList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postAnnouncements(req: Request,  companyId: string) {
    try {
      let id = uuidv4();
      const title = req.body['title'];
      const email = (req.body['email']);
      const attachFiles = req.body['attachFiles'];
      const emailSend = req.body['emailSend'];
      const emailAll = req.body['emailAll'];
      const emailList = (req.body['emailList']);
      const status = req.body['status'];
      const author = req.body['author'];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newAnnouncement = this.announcementsRepository.create({
        id,
        title,
        email,
        attachFiles,
        emailSend,
        emailAll,
        emailList,
        status,
        author,
        createdAt,
        modifiedAt,
        companyId
      });
      const savedAnnouncement = await this.announcementsRepository.save(
        newAnnouncement,
      );
      if (status === 'published') {
        await this.notificationService.addNotifications('announcement',  `Announcement: ${savedAnnouncement.title}.`, savedAnnouncement['id'], companyId, req.headers['userid'] as string);
      }
      return savedAnnouncement;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAnnouncements(companyId: string) {
    try {
      const notes = await this.announcementsRepository.find({where: { companyId: companyId },}
        );
      return (notes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAnnouncementsById(
    id: string,
  ) {
    try {
      const notes = await this.announcementsRepository.findOne({
        where: { id: id },
      });
      return (notes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putAnnouncementsById(
    id: string,
    body: Body,
    req: Request  
  ) {
    try {
      const newAnnouncement = await this.announcementsRepository.findOne({
        where: { id: id },
      });
      const notifications: HrmNotifications = await this.dataSource.query(
        'SELECT * FROM hrm_notifications WHERE "referenceIds"->>\'featureId\' =$1  ',[id]
      ).then((res) => res[0]);
      const previouStatus = newAnnouncement.status;
      if (body.hasOwnProperty('title')) {
        newAnnouncement.title = body['title'];
      }
      if (body.hasOwnProperty('attachFiles')) {
        newAnnouncement.attachFiles = body['attachFiles'];
      }
      if (body.hasOwnProperty('author')) {
        newAnnouncement.author = body['author'];
      }
      if (body.hasOwnProperty('emailAll')) {
        newAnnouncement.emailAll = body['emailAll'];
      }
      if (body.hasOwnProperty('email')) {
        newAnnouncement.email = (body['email']);
      }
      if (body.hasOwnProperty('emailList')) {
        newAnnouncement.emailList = (body['emailList']);
      }
      if (body.hasOwnProperty('status')) {
        newAnnouncement.status = body['status'];
      }
      if (body.hasOwnProperty('emailSend')) {
        newAnnouncement.emailSend = body['emailSend'];
      }
      if(notifications && newAnnouncement.status === 'published'){
        // notifications.data.data.title = body['title'];
        // notifications.data.data.author = body['author'];
        // await this.notificationsRepository.save(notifications);
      }

      newAnnouncement.modifiedAt = new Date(Date.now());
      const savedAnnouncement = await this.announcementsRepository.save(newAnnouncement);
      if(previouStatus === 'draft' && newAnnouncement.status === 'published'){
        const type = 'announcement';
        const hidden = false;
        const companyId = body['companyId'];
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());


        const json = {};
        json['id'] = savedAnnouncement.id;
        json['title'] = newAnnouncement.title;
        json['author'] = newAnnouncement.author;
        let data = (json);
        const mainData = {
          id,
          data,
          createdAt,
          modifiedAt,
          hidden
        }
        await this.announcementsRepository.save(savedAnnouncement);
        //await this.socketClient.sendNotificationAnnouncement(socketData);
      }
      return savedAnnouncement;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAnnouncementsById(
    id: string,
  ) {
    try {
      const announcement = await this.announcementsRepository.findOneOrFail({
        where: { id: id },
      });
      
      if(announcement.status==='published'){
      
        const notification: HrmNotifications = await this.dataSource.query(
          'SELECT * FROM hrm_notifications WHERE "referenceIds"->>\'featureId\' =$1  ',[id]
        ).then((res) => res[0]);
      await this.announcementsRepository.remove(announcement);
      if (notification) {
        await this.notificationsRepository.remove(notification);
      }

    }else{
      await this.announcementsRepository.remove(announcement);
    }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}

