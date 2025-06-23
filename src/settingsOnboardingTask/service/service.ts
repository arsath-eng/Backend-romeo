import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';
@Injectable()
export class OnboardingTaskService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmBoardingTaskEmployees)
    private boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
  ) { }

  async postOnboardingTask(req: Request,   companyId: string) {
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

      const newOnboardingTaskData = 
        {
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
      const newOnboardingTask = await this.commonRepository.create({
        type:'onboardingTask',
        data: newOnboardingTaskData,
        createdAt,
        modifiedAt,
        companyId,
      });
      return await this.commonRepository.save(newOnboardingTask);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOnboardingTask(  companyId: string) {
    try {
      const onboardingTasks = await this.commonRepository.find({ where: { companyId: companyId,type:"onboardingTask" } });
      const employees = await this.employeeDetailsRepository.find({ where: { companyId: companyId,status: Not('Non Active') } });
      const onboardingTaskList = [];
      for (let i = 0; i < onboardingTasks.length; i++) {
        onboardingTasks[i].data.dueDate = (onboardingTasks[i].data.dueDate);
        onboardingTasks[i].data.eligible = (onboardingTasks[i].data.eligible);

        let reqFilterEmployees = [];
        const reqFilterList = onboardingTasks[i].data.eligible;
        const allEmployees = await this.employeeDetailsRepository.find({where:{companyId: companyId,status: Not('Non Active')}});
        if (onboardingTasks[i].data.allEmployees == false) {
          for (let k = 0; k < reqFilterList.length; k++) {
            if (reqFilterList[k]["name"] === 'department') {
              for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
                const empIds = [];
                allEmployees.forEach(employee => {
                  if(employee.jobInformation[0].department == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[0].active == true){
                    empIds.push(employee.employeeId);
                  }
                });
                for (let m = 0; m < empIds.length; m++) {
                  reqFilterEmployees.push(empIds[m].employeeId);
                }
              }
            }
            if (reqFilterList[k]["name"] === 'division') {
              for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
                const empIds = [];
                allEmployees.forEach(employee => {
                  if(employee.jobInformation[0].division == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[0].active == true){
                    empIds.push(employee.employeeId);
                  }
                });
                for (let m = 0; m < empIds.length; m++) {
                  reqFilterEmployees.push(empIds[m].employeeId);
                }
              }
            }
            if (reqFilterList[k]["name"] === 'employement_status') {
              for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
                const empIds = [];
                allEmployees.forEach(employee => {
                  if(employee.employeeStatus[0].status == reqFilterList[k]["list"][l] 
                  && employee.employeeStatus[0].active == true){
                    empIds.push(employee.employeeId);
                  }
                });
                for (let m = 0; m < empIds.length; m++) {
                  reqFilterEmployees.push(empIds[m].employeeId);
                }
              }
            }
            if (reqFilterList[k]["name"] === 'job_title') {
              for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
                const empIds = [];
                allEmployees.forEach(employee => {
                  if(employee.jobInformation[0].jobTitle == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[0].active == true){
                    empIds.push(employee.employeeId);
                  }
                });
                for (let m = 0; m < empIds.length; m++) {
                  reqFilterEmployees.push(empIds[m].employeeId);
                }
              }
            }
            if (reqFilterList[k]["name"] === 'location') {
              for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
                const empIds = [];
                allEmployees.forEach(employee => {
                  if(employee.jobInformation[0].location == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[0].active == true){
                    empIds.push(employee.employeeId);
                  }
                });
                for (let m = 0; m < empIds.length; m++) {
                  reqFilterEmployees.push(empIds[m].employeeId);
                }
              }
            }
          }
        } else if (onboardingTasks[i].data.allEmployees == true) {
          for (let m = 0; m < employees.length; m++) {
            reqFilterEmployees.push(employees[m].employeeId);
          }
        }
        reqFilterEmployees = [...new Set(reqFilterEmployees)];
        onboardingTasks[i].data["eligibleList"] = reqFilterEmployees;
        onboardingTaskList.push({
          id: onboardingTasks[i].id,
          ...onboardingTasks[i].data,
          companyId: onboardingTasks[i].companyId,
          createdAt: onboardingTasks[i].createdAt,
          modifiedAt: onboardingTasks[i].modifiedAt,
        });
      }
       return onboardingTaskList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOnboardingTaskById(  id: string) {
    try {
      const onboardingTasks = await this.commonRepository.findOne({ where: { id: id } });
      const employees = await this.employeeDetailsRepository.find({ where: { companyId: onboardingTasks.companyId ,status: Not('Non Active')} });
      onboardingTasks.data.dueDate = (onboardingTasks.data.dueDate);
      onboardingTasks.data.eligible = (onboardingTasks.data.eligible);
      let reqFilterEmployees = [];
      const reqFilterList = onboardingTasks.data.eligible;
      const allEmployees = await this.employeeDetailsRepository.find({where:{companyId: onboardingTasks.companyId,status: Not('Non Active')}});
      if (onboardingTasks.data.allEmployees == false) {
        for (let k = 0; k < reqFilterList.length; k++) {
          if (reqFilterList[k]["name"] === 'department') {
            for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
              const empIds = [];
              allEmployees.forEach(employee => {
                for (let j = 0; j < employee.jobInformation.length; j++) {
                  if(employee.jobInformation[j].department == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[j].active == true){
                    empIds.push(employee.employeeId);
                    break;
                  }
                }
              });
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]["name"] === 'division') {
            for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
              const empIds = [];
              allEmployees.forEach(employee => {
                for (let j = 0; j < employee.jobInformation.length; j++) {
                  if(employee.jobInformation[j].division == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[j].active == true){
                    empIds.push(employee.employeeId);
                    break;
                  }
                }
              });
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]["name"] === 'employement_status') {
            for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
              const empIds = [];
              allEmployees.forEach(employee => {
                for (let j = 0; j < employee.employeeStatus.length; j++) {
                  if(employee.employeeStatus[j].status == reqFilterList[k]["list"][l] 
                  && employee.employeeStatus[j].active == true){
                    empIds.push(employee.employeeId);
                    break;
                  }
                }
              })
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]["name"] === 'job_title') {
            for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
              const empIds = [];
              allEmployees.forEach(employee => {
                for (let j = 0; j < employee.jobInformation.length; j++) {
                  if(employee.jobInformation[j].jobTitle == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[j].active == true){
                    empIds.push(employee.employeeId);
                    break;
                  }
                }
              })
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
          if (reqFilterList[k]["name"] === 'location') {
            for (let l = 0; l < reqFilterList[k]["list"].length; l++) {
              const empIds = [];
              allEmployees.forEach(employee => {
                for (let j = 0; j < employee.jobInformation.length; j++) {
                  if(employee.jobInformation[j].location == reqFilterList[k]["list"][l] 
                  && employee.jobInformation[j].active == true){
                    empIds.push(employee.employeeId);
                    break;
                  }
                }
              });
              for (let m = 0; m < empIds.length; m++) {
                reqFilterEmployees.push(empIds[m].employeeId);
              }
            }
          }
        }
      } else if (onboardingTasks.data.allEmployees == true) {
        for (let m = 0; m < employees.length; m++) {
          reqFilterEmployees.push(employees[m].employeeId);
        }
      }
        reqFilterEmployees = [...new Set(reqFilterEmployees)];
        onboardingTasks.data["eligibleList"] = reqFilterEmployees;
      
       let onboardingTaskObj = {
        id: onboardingTasks.id,
        ...onboardingTasks.data,
        companyId: onboardingTasks.companyId,
        createdAt: onboardingTasks.createdAt,
        modifiedAt: onboardingTasks.modifiedAt,
      };
       return onboardingTaskObj;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOnboardingTaskById(
    id: string,
    req: Request,
      
  ) {
    try {
      const onboardingTask = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        onboardingTask.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('categoryId')) {
        onboardingTask.data.categoryId = req.body['categoryId'];
      }
      if (req.body.hasOwnProperty('description')) {
        onboardingTask.data.description = req.body['description'];
      }
      if (req.body.hasOwnProperty('assignTo')) {
        onboardingTask.data.assignTo = req.body['assignTo'];
      }
      if (req.body.hasOwnProperty('dueDate')) {
        onboardingTask.data.dueDate = (req.body['dueDate']);
      }
      if (req.body.hasOwnProperty('sendNotification')) {
        onboardingTask.data.sendNotification = req.body['sendNotification'];
      }
      if (req.body.hasOwnProperty('attachFiles')) {
        onboardingTask.data.attachFiles = req.body['attachFiles'];
      }
      if (req.body.hasOwnProperty('allEmployees')) {
        onboardingTask.data.allEmployees = req.body['allEmployees'];
      }
      if (req.body.hasOwnProperty('eligible')) {
        onboardingTask.data.eligible = (req.body['eligible']);
      }
      onboardingTask.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(onboardingTask);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteOnboardingTaskById(
    id: string,
    req: Request,
      
  ) {
    try {
      const leave = req.body.leave;
      const anywhere = req.body.anywhere;
      const onboardingTask =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });

      if (leave === true) {
        await this.commonRepository.remove(onboardingTask);
        const onboardingTasks = await this.boardingTaskEmployeesRepository.find({ where: { taskId: id, completed: false } });
        for (let i = 0; i < onboardingTasks.length; i++) {
          await this.boardingTaskEmployeesRepository.remove(onboardingTasks[i]);
        }
      }
      if (anywhere === true) {
        await this.commonRepository.remove(onboardingTask);
        const onboardingTasks = await this.boardingTaskEmployeesRepository.find({ where: { taskId: id } });
        for (let i = 0; i < onboardingTasks.length; i++) {
          await this.boardingTaskEmployeesRepository.remove(onboardingTasks[i]);
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
