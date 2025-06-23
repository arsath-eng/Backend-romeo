
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { GlobalService } from '@flows/company/global.service';
import { TimezoneService } from '../../timezone/timezone.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import {v4 as uuidv4} from 'uuid';
@Injectable()
export class OffboardingTasksService {
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

  async offboarding(newDate:Date, executionType:string) {
    try {
      const employeeId = GlobalService.employeeId;
      const offBoardingsTasksEmployees = await this.boardingTaskEmployeesRepository.find({where:{employeeId:employeeId}});
      for (let i = 0; i < offBoardingsTasksEmployees.length; i++) {
        const offBoardingsTask = await this.commonRepository.findOne({ where: { id: offBoardingsTasksEmployees[i].taskId } });
  
        const employee = await this.employeeDetailsRepository.findOne({ where: { employeeId: offBoardingsTasksEmployees[i].employeeId} })
        let effectiveDate = new Date(employee.terminationDate);
        if (offBoardingsTask.data.sendNotification != "Soon After Task Is Imported" && offBoardingsTask.data.dueDate["onTerminationDate"] == true
          && offBoardingsTask.data.dueDate["from"]["selected"] == false) {
          effectiveDate = new Date(employee.terminationDate);
        }
        if (offBoardingsTask.data.sendNotification != "Soon After Task Is Imported" && offBoardingsTask.data.dueDate["onTerminationDate"] == true
          && offBoardingsTask.data.dueDate["from"]["selected"] == true) {
          if (offBoardingsTask.data.dueDate["from"]["method"] === "days" && offBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
            effectiveDate.setDate(effectiveDate.getDate() + offBoardingsTask.data.dueDate["from"]["method"]["count"]);
          }
          if (offBoardingsTask.data.dueDate["from"]["method"] === "days" && offBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
            effectiveDate.setDate(effectiveDate.getDate() - offBoardingsTask.data.dueDate["from"]["method"]["count"]);
          }
          if (offBoardingsTask.data.dueDate["from"]["method"] === "weeks" && offBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
            effectiveDate.setDate(effectiveDate.getDate() + offBoardingsTask.data.dueDate["from"]["method"]["count"] * 7);
          }
          if (offBoardingsTask.data.dueDate["from"]["method"] === "weeks" && offBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
            effectiveDate.setDate(effectiveDate.getDate() - offBoardingsTask.data.dueDate["from"]["method"]["count"] * 7);
          }
          if (offBoardingsTask.data.dueDate["from"]["method"] === "months" && offBoardingsTask.data.dueDate["from"]["execute"] === 'after') {
            effectiveDate.setDate(effectiveDate.getMonth() + offBoardingsTask.data.dueDate["from"]["method"]["count"]);
          }
          if (offBoardingsTask.data.dueDate["from"]["method"] === "months" && offBoardingsTask.data.dueDate["from"]["execute"] === 'before') {
            effectiveDate.setDate(effectiveDate.getMonth() - offBoardingsTask.data.dueDate["from"]["method"]["count"]);
          }
        }
        const today = new Date(Date.now());
        const notifications = await this.notificationsRepository.find({where:{id:offBoardingsTasksEmployees[i].id}});
        const match = await this.TimezoneServiceService.dateMatches(newDate, format(new Date(effectiveDate), 'yyyy-MM-dd'), offBoardingsTasksEmployees[i].employeeId, 'PUT'); 
        const id = uuidv4();  
        if (match && (notifications.length==0)) {
          const type = 'offBoarding';
          const hidden = false;
          const createdAt = new Date(Date.now());
          const modifiedAt = new Date(Date.now());
          const companyId = employee.companyId;
          const offBoardingTaskEmployeeId = offBoardingsTasksEmployees[i].id;
          const mainData = {
            id,
            offBoardingTaskEmployeeId,
            createdAt,
            modifiedAt,
          };
          const data = (mainData)

        }
      }
    } catch (error) {
      console.log(error);
      
    }
  }
}



