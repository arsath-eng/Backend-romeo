import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Repository } from 'typeorm';
@Injectable()
export class OffboardingTaskService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmBoardingTaskEmployees)
    private readonly boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
  ) { }

  async postOffboardingTask(req: Request,   companyId: string) {
    try {
      const name = req.body.name;
      const categoryId = req.body.categoryId;
      const description = req.body.description;
      const assignTo = req.body.assignTo;
      const dueDate = (req.body.dueDate);
      const sendNotification = req.body.sendNotification;
      const attachFiles = req.body.attachFiles;
      const allEmployees = req.body.allEmployees;
      const eligible = (req.body.eligible);
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newOffboardingTaskData = {
          name,
          categoryId,
          description,
          assignTo,
          dueDate,
          sendNotification,
          attachFiles,
          allEmployees,
          eligible,
        };
        return await this.commonRepository.save({
        type: 'offboardingTask',
        data: newOffboardingTaskData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOffboardingTask(  companyId: string) {
    try {
      const offboardingTasks =
        await this.commonRepository.find({ where: { companyId: companyId,type: "offboardingTask" } });
      const offboardingTaskList = [];
      for(let i=0;i<offboardingTasks.length;i++){
        const offboardingTask = {
          id:offboardingTasks[i].id,
          ...offboardingTasks[i].data,
          createdAt: offboardingTasks[i].createdAt,
          modifiedAt: offboardingTasks[i].modifiedAt,
          companyId: offboardingTasks[i].companyId,
        }
        offboardingTaskList.push(offboardingTask);
      }
      return offboardingTaskList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOffboardingTaskById(  id: string) {
    try {
      const offboardingTask =
        await this.commonRepository.findOne({ where: { id: id } });
       const offboardingTaskData = {
          id:offboardingTask.id,
          ...offboardingTask.data,
          createdAt: offboardingTask.createdAt,
          modifiedAt: offboardingTask.modifiedAt,
          companyId: offboardingTask.companyId,
        }
      return offboardingTaskData;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOffboardingTaskById(
    id: string,
    req: Request,
      
  ) {
    try {
      const offboardingTask = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        offboardingTask.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('categoryId')) {
        offboardingTask.data.categoryId = req.body['categoryId'];
      }
      if (req.body.hasOwnProperty('description')) {
        offboardingTask.data.description = req.body['description'];
      }
      if (req.body.hasOwnProperty('assignTo')) {
        offboardingTask.data.assignTo = req.body['assignTo'];
      }
      if (req.body.hasOwnProperty('dueDate')) {
        offboardingTask.data.dueDate = (req.body['dueDate']);
      }
      if (req.body.hasOwnProperty('sendNotification')) {
        offboardingTask.data.sendNotification = req.body['sendNotification'];
      }
      if (req.body.hasOwnProperty('attachFiles')) {
        offboardingTask.data.attachFiles = req.body['attachFiles'];
      }
      if (req.body.hasOwnProperty('allEmployees')) {
        offboardingTask.data.allEmployees = req.body['allEmployees'];
      }
      if (req.body.hasOwnProperty('eligible')) {
        offboardingTask.data.eligible = (req.body['eligible']);
      }
      offboardingTask.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(offboardingTask);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteOffboardingTaskById(
    id: string,
    req: Request,
      
  ) {
    try {
      const leave = req.body.leave;
      const anywhere = req.body.anywhere;
      const offboardingTask =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });

      if (leave === true) {
        await this.commonRepository.remove(offboardingTask);
        const offboardingTasks = await this.boardingTaskEmployeesRepository.find({ where: { taskId: id, completed: false } });
        await this.boardingTaskEmployeesRepository.remove(offboardingTasks);
      }
      if (anywhere === true) {
        await this.commonRepository.remove(offboardingTask);
        const offboardingTasks = await this.boardingTaskEmployeesRepository.find({ where: { taskId: id } });
        await this.boardingTaskEmployeesRepository.remove(offboardingTasks);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
