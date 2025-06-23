import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { GlobalService } from '../../company/global.service';
import { TimezoneService } from '../../timezone/timezone.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import {v4 as uuidv4} from 'uuid';
@Injectable()
export class onBoardingTasksService {
  constructor(
    @InjectRepository(HrmBoardingTaskEmployees)
    private boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private notificationsRepository: Repository<HrmNotifications>,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    private TimezoneServiceService: TimezoneService,
  ) { }
  async onboarding(newDate:Date, executionType:string) {
    try {
      const employeeId = GlobalService.employeeId;
      const onBoardingsTasksEmployees = await this.boardingTaskEmployeesRepository.find({where:{employeeId:employeeId}});
      for (let i = 0; i < onBoardingsTasksEmployees.length; i++) {
        if (onBoardingsTasksEmployees[i].preDefined === true) {
          const onBoardingsTask = await this.commonRepository.findOne({ where: { id: onBoardingsTasksEmployees[i].taskId } });
          onBoardingsTask.data.dueDate = (onBoardingsTask.data.dueDate);
          onBoardingsTask.data.eligible = (onBoardingsTask.data.eligible);
          const employee = await this.employeeDetailsRepository.findOne({ where: { employeeId: onBoardingsTasksEmployees[i].employeeId } })
          let effectiveDate = new Date(employee.hireDate);
          if (onBoardingsTask.data.sendNotification != "Soon After Task Is Imported" && onBoardingsTask.data.dueDate["onHireDate"] == true
            && onBoardingsTask.data.dueDate["from"]["selected"] == false) {
            effectiveDate = new Date(employee.hireDate);
          }
          if (onBoardingsTask.data.sendNotification != "Soon After Task Is Imported" && onBoardingsTask.data.dueDate["onHireDate"] == true
            && onBoardingsTask.data.dueDate["from"]["selected"] == true) {
            if (onBoardingsTask.data.dueDate["from"]["method"] === "days" && onBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
              effectiveDate.setDate(effectiveDate.getDate() + onBoardingsTask.data.dueDate["from"]["method"]["count"]);
            }
            if (onBoardingsTask.data.dueDate["from"]["method"] === "days" && onBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
              effectiveDate.setDate(effectiveDate.getDate() - onBoardingsTask.data.dueDate["from"]["method"]["count"]);
            }
            if (onBoardingsTask.data.dueDate["from"]["method"] === "weeks" && onBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
              effectiveDate.setDate(effectiveDate.getDate() + onBoardingsTask.data.dueDate["from"]["method"]["count"] * 7);
            }
            if (onBoardingsTask.data.dueDate["from"]["method"] === "weeks" && onBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
              effectiveDate.setDate(effectiveDate.getDate() - onBoardingsTask.data.dueDate["from"]["method"]["count"] * 7);
            }
            if (onBoardingsTask.data.dueDate["from"]["method"] === "months" && onBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
              effectiveDate.setDate(effectiveDate.getMonth() + onBoardingsTask.data.dueDate["from"]["method"]["count"]);
            }
            if (onBoardingsTask.data.dueDate["from"]["method"] === "months" && onBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
              effectiveDate.setDate(effectiveDate.getMonth() - onBoardingsTask.data.dueDate["from"]["method"]["count"]);
            }
          }
          const today = new Date(Date.now());
          const notifications = await this.notificationsRepository.find({where:{id:onBoardingsTasksEmployees[i].id}});
          const match = await this.TimezoneServiceService.dateMatches(newDate, format(new Date(effectiveDate), 'yyyy-MM-dd'), onBoardingsTasksEmployees[i].employeeId, 'PUT');
          const id = uuidv4();  
          if (match && (notifications.length==0)) {
            const type = 'onBoarding';
            const hidden = false;
            const createdAt = new Date(Date.now());
            const modifiedAt = new Date(Date.now());
            const companyId = employee.companyId;
            const onBoardingTaskEmployeeId = onBoardingsTasksEmployees[i].id;
            const mainData = {
              id,
              onBoardingTaskEmployeeId,
              createdAt,
              modifiedAt,
            };
            const data = (mainData)
          }
        }
  
      }
    } catch (error) {
      console.log(error);
      
    }
  }
}



