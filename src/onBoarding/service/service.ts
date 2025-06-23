
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
export class OnboardingTaskEmployeesService {
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

  async postOnboardingTaskEmployees(req: Request,   companyId: string) {
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
      
      const newOnboardingTask = this.boardingTaskEmployeesRepository.create(
        {
          type: 'onboarding',
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
      const savedTaskEmployee = await this.boardingTaskEmployeesRepository.save(newOnboardingTask);
      newOnboardingTask.form = (newOnboardingTask.form)
      if (preDefined) {
        const onBoardingsTask = await this.commonRepository.findOne({ where: { id: taskId } });
        if (onBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
          const type = 'onBoarding';
          const hidden = false;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const onBoardingTaskEmployeeId = savedTaskEmployee.id;
          const mainData = {
            id,
            onBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['data'] = newOnboardingTask;
          
          let data = (mainData)
          await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
        }
      } else {
        const type = 'onBoarding';
        const hidden = false;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const onBoardingTaskEmployeeId = savedTaskEmployee.id;
        const mainData = {
          id,
          onBoardingTaskEmployeeId,
          createdAt,
          modifiedAt,
        };
        mainData['data'] = newOnboardingTask;
        mainData['status'] = req.body.status;
        const data = (mainData)
        await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
      }
      return savedTaskEmployee;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOnboardingTaskEmployees(  companyId: string) {
    try {
      const onboardingTasks =
        await this.boardingTaskEmployeesRepository.find({ where: { companyId: companyId } });
       return (onboardingTasks);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOnboardingTaskEmployeesById(  id: string) {
    try {
      const onboardingTask =
        await this.boardingTaskEmployeesRepository.find({ where: { employeeId: id } });
       return (onboardingTask);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOnboardingTaskEmployeesById(
    id: string,
    body: Body,
      
  ) {
    try {
      const onboardingTask = await this.boardingTaskEmployeesRepository.findOneOrFail({
        where: { id: id },
      })
      const notifications = await this.notificationsRepository.findOne({ where: {id:onboardingTask.id}});
      if (body.hasOwnProperty('employeeId')) {
        onboardingTask.employeeId = body['employeeId'];
      }
      if (body.hasOwnProperty('preDefined')) {
        onboardingTask.preDefined = body['preDefined'];
      }
      if (body.hasOwnProperty('taskId')) {
        onboardingTask.taskId = body['taskId'];
      }
      if (body.hasOwnProperty('form')) {
        onboardingTask.form = (body['form']);
      }
      if (body.hasOwnProperty('completed')) {
        onboardingTask.completed = body['completed'];
      }
      if (body.hasOwnProperty('completedBy')) {
        onboardingTask.completedBy = body['completedBy'];
      }
      if (body.hasOwnProperty('completedDate')) {
        onboardingTask.completedDate = body['completedDate'];
      }
      onboardingTask.modifiedAt = new Date(Date.now());
      await this.boardingTaskEmployeesRepository.save(onboardingTask);
      if (onboardingTask.preDefined === true) {
        const onBoardingsTask = await this.commonRepository.findOne({ where: { id: onboardingTask.taskId } });
        if (onBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
          const type = 'onBoarding';
          const hidden = false;
          const companyId = onboardingTask.companyId;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const onBoardingTaskEmployeeId = id;
          const mainData = {
            id,
            onBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['status'] = body['status'];
          mainData['data'] = onboardingTask;
          const data = (mainData);
        }
      }
      else {
        const type = 'onBoarding';
        const hidden = false;
        const companyId = onboardingTask.companyId;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const onBoardingTaskEmployeeId = id;
        const mainData = {
          id,
          onBoardingTaskEmployeeId,
          createdAt,
          modifiedAt,
        };
        mainData['status'] = body['status'];
        mainData['data'] = onboardingTask;
        const data = (mainData);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }

  }

  async deleteOnboardingTaskEmployeesById(
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

  async postOnboardingTaskEmployeesRemoveAll(req: Request    ) {
    try {
      let removed = []
      const employeeId = req.body.employeeId;
      const completed = req.body.completed;
      const candidateStatus =
        await this.boardingTaskEmployeesRepository.find({
          where: { employeeId: employeeId, completed: completed }
        });
      for (let i = 0; i < candidateStatus.length; i++) {
        const res = await this.boardingTaskEmployeesRepository.remove(candidateStatus[i]);
        removed.push(res);
      }
      return removed;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postOnboardingTaskEmployeesMultiple(req: Request    ) {
    try {
      const saved = [];
      const employee = await this.employeeDetailsRepository.findOne({ where: { employeeId: req.body.employeeId,status: Not('Non Active') } });
      for (let i = 0; i < req.body.taskIdList.length; i++) {
        const onBoardingsTask = await this.commonRepository.findOne({ where: { id: req.body.taskIdList[i] } });
        const employeeId = req.body.employeeId;
        const preDefined = true;
        const taskId = req.body.taskIdList[i];
        const json = {};
        json["name"] = onBoardingsTask.data.name;
        json["assignTo"] = onBoardingsTask.data.assignTo;
        json["hireDate"] = employee.hireDate;
        json["description"] = onBoardingsTask.data.description;
        json["categoryId"] = onBoardingsTask.data.categoryId;
        json["attachFiles"] = onBoardingsTask.data.attachFiles;
        const form = (json);
        const completed = false;
        const completedBy = '';
        const completedDate = '';
        const companyId = employee.companyId;
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const id = uuidv4();
        const newOnboardingTask = this.boardingTaskEmployeesRepository.create(
          {
            id,
            type: 'onboarding',
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
        const savedTaskEmployee = await this.boardingTaskEmployeesRepository.save(newOnboardingTask);
        saved.push(savedTaskEmployee);
        if (preDefined === true) {
          if (onBoardingsTask.data.sendNotification === "Soon After Task Is Imported") {
            const type = 'onBoarding';
            const hidden = false;
            const createdAt = new Date(Date.now());
            const modifiedAt = new Date(Date.now());
            const onBoardingTaskEmployeeId = savedTaskEmployee.id;
            let mainData = {
              id,
              onBoardingTaskEmployeeId,
              createdAt,
              modifiedAt,
            };
            mainData['data'] = newOnboardingTask;
            mainData['status'] = 'pending';
            const data = (mainData);
            await this.notificationService.addNotifications('offboarding', 'offboarding message', savedTaskEmployee['id'], companyId, req.headers['userid'] as string);
          }
        } else {
          const type = 'onBoarding';
          const hidden = false;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const onBoardingTaskEmployeeId = savedTaskEmployee.id;
          let mainData = {
            id,
            onBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          mainData['data'] = newOnboardingTask;
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
