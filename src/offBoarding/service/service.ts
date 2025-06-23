

import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Not, DataSource, Repository } from 'typeorm';
import {v4 as uuidv4} from 'uuid';
@Injectable()
export class OffboardingTaskEmployeesService {
  constructor(
    @InjectRepository(HrmBoardingTaskEmployees)
    private boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    private readonly notificationService: NotificationService,
    @InjectDataSource() private dataSource: DataSource,

  ) { }

  async postOffboardingTaskEmployees(req: Request,   companyId: string) {
    try {
      const employeeId = req.body.employeeId;
      const preDefined = req.body.preDefined;
      const taskId = req.body.taskId;
      const form = (req.body.form);
      const completed = req.body.completed;
      const completedBy = req.body.completedBy;
      const completedDate = req.body.completedDate;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const id = uuidv4();
      const newOffboardingTask = this.boardingTaskEmployeesRepository.create(
        {
          type: 'offboarding',
          id,
          employeeId,
          preDefined,
          taskId,
          form,
          completed,
          completedBy,
          completedDate,
          createdAt,
          modifiedAt,
          companyId
        },
      );
      const savedTaskEmployee = await this.boardingTaskEmployeesRepository.save(newOffboardingTask);
      newOffboardingTask.form = (newOffboardingTask.form)
      if (preDefined === true) {
        const offBoardingsTask = await this.commonRepository.findOne({ where: { id: taskId } });
        if (offBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
          const type = 'offboarding';
          const hidden = false;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());

          const offBoardingTaskEmployeeId = savedTaskEmployee.id;
          const mainData = {
            id,
            offBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['data'] = newOffboardingTask;
          mainData['status'] = req.body.status;
          const data = (mainData)
          await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
        }
      }
      else {
        const type = 'offboarding';
        const hidden = false;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());

        const offBoardingTaskEmployeeId = savedTaskEmployee.id;
        const mainData = {
          id,
          offBoardingTaskEmployeeId,
          createdAt,
          modifiedAt,
        };
        mainData['data'] = newOffboardingTask;
        mainData['status'] = 'pending';
        const data = (mainData)
        await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
      }
      return savedTaskEmployee;

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOffboardingTaskEmployees(  companyId: string) {
    try {
      const offboardingTasks =
        await this.boardingTaskEmployeesRepository.find({ where: { companyId: companyId } });
       return (offboardingTasks);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOffboardingTaskEmployeesById(  id: string) {
    try {
      const offboardingTask =
        await this.boardingTaskEmployeesRepository.find({ where: { employeeId: id } });
       return (offboardingTask);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOffboardingTaskEmployeesById(
    id: string,
    body: Body,
      
  ) {
    try {
      const offboardingTask = await this.boardingTaskEmployeesRepository.findOneOrFail({
        where: { id: id },
      });
      const notifications = await this.notificationsRepository.findOne({ where: {id:offboardingTask.id}});
      if (body.hasOwnProperty('employeeId')) {
        offboardingTask.employeeId = body['employeeId'];
      }
      if (body.hasOwnProperty('preDefined')) {
        offboardingTask.preDefined = body['preDefined'];
      }
      if (body.hasOwnProperty('taskId')) {
        offboardingTask.taskId = body['taskId'];
      }
      if (body.hasOwnProperty('form')) {
        offboardingTask.form = (body['form']);
      }
      if (body.hasOwnProperty('completed')) {
        offboardingTask.completed = body['completed'];
      }
      if (body.hasOwnProperty('completedBy')) {
        offboardingTask.completedBy = body['completedBy'];
      }
      if (body.hasOwnProperty('completedDate')) {
        offboardingTask.completedDate = body['completedDate'];
      }
      offboardingTask.modifiedAt = new Date(Date.now());
      await this.boardingTaskEmployeesRepository.save(offboardingTask);
      const offBoardingsTask = await this.commonRepository.findOne({ where: { id: offboardingTask.taskId } });
      if (offboardingTask.preDefined === true) {
        if (offBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
          const type = 'offBoarding';
          const hidden = false;
          const companyId = offboardingTask.companyId;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const offBoardingTaskEmployeeId = id;
          const mainData = {
            id,
            offBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['data'] = offboardingTask;
          const data = (mainData)
        }
      }
      else {
        const type = 'offBoarding';
        const hidden = false;
        const companyId = offboardingTask.companyId;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const offBoardingTaskEmployeeId = id;
        const mainData = {
          id,
          offBoardingTaskEmployeeId,
          createdAt,
          modifiedAt,
        };
        mainData['data'] = offboardingTask;
        mainData['status'] = body['status'];
        const data = (mainData)
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }

  }

  async deleteOffboardingTaskEmployeesById(
    id: string,
      
  ) {
    try {
      const candidateStatus =
        await this.boardingTaskEmployeesRepository.findOneOrFail({
          where: { id: id },
        });
      await this.boardingTaskEmployeesRepository.remove(candidateStatus);
      const notifications: HrmNotifications = await this.dataSource.query(
        'SELECT * FROM hrm_notifications WHERE "referenceIds"->>\'featureId\' =$1  ',[id]
      ).then((res) => res[0]);
      if (notifications) {
        await this.notificationsRepository.remove(notifications);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postOffboardingTaskEmployeesRemoveAll(req: Request    ) {
    try {
      const arr = []
      const employeeId = req.body.employeeId;
      const completed = req.body.completed;
      const candidateStatus =
        await this.boardingTaskEmployeesRepository.find({
          where: { employeeId: employeeId, completed: completed }
        });
      for (let i = 0; i < candidateStatus.length; i++) {
        const removed = await this.boardingTaskEmployeesRepository.remove(candidateStatus[i]);
        arr.push(removed);
      }
      return arr;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postOffboardingTerminationEmployee(req: Request    ) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: req.body.employeeId, status: Not('Non Active') }
      });
      employee.terminationDate=req.body.teminationDate;
      await this.employeeDetailsRepository.save(employee);
      return employee;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOffboardingTaskEmployeesMultiple(req: Request    ) {
    try {
      const saved = [];
      const employee = await this.employeeDetailsRepository.findOne({ where: { employeeId: req.body.employeeId,status: Not('Non Active') } });
      for (let i = 0; i < req.body.taskIdList.length; i++) {
        const offBoardingsTask = await this.commonRepository.findOne({ where: { id: req.body.taskIdList[i] } });
        const employeeId = req.body.employeeId;
        const preDefined = true;
        const taskId = req.body.taskIdList[i];
        const json = {};
        json["name"] = offBoardingsTask.data.name;
        json["assignTo"] = offBoardingsTask.data.assignTo;
        json["hireDate"] = employee.hireDate;
        json["description"] = offBoardingsTask.data.description;
        json["categoryId"] = offBoardingsTask.data.categoryId;
        json["attachFiles"] = offBoardingsTask.data.attachFiles;
        const form = (json);
        const completed = false;
        const completedBy = '';
        const completedDate = '';
        const companyId = employee.companyId;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const id = uuidv4();
        const newoffboardingTask = this.boardingTaskEmployeesRepository.create(
          {
            id,
            type: 'offboarding',
            employeeId,
            preDefined,
            taskId,
            form,
            completed,
            completedBy,
            completedDate,
            createdAt,
            modifiedAt,
            companyId
          }
        );
        const savedTaskEmployee = await this.boardingTaskEmployeesRepository.save(newoffboardingTask);
        saved.push(savedTaskEmployee);
        if (preDefined === true) {
          if (offBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
            const type = 'offBoarding';
            const hidden = false;
            const createdAt = new Date(Date.now());
            const modifiedAt = new Date(Date.now());
            const offBoardingTaskEmployeeId = savedTaskEmployee.id;
            let mainData = {
              id,
              offBoardingTaskEmployeeId,
              createdAt,
              modifiedAt,
            };
            mainData['data'] = newoffboardingTask;
            mainData['status'] = 'pending';
            const data = (mainData);
            await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
          }
        } else {
          const type = 'offBoarding';
          const hidden = false;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const offBoardingTaskEmployeeId = savedTaskEmployee.id;
          let mainData = {
            id,
            offBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['data'] = newoffboardingTask;
          mainData['status'] = 'pending';
          const data = (mainData);
          await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
        }
      }
      return saved;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
