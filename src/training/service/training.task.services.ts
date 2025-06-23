/* 
import { GlobalService } from '../../company/global.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Injectable()
export class TrainingTasksService {
  constructor(
    private readonly APIService: APIService,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) { }

  async training(newDate:Date) {
    try {
      const companyId = GlobalService.companyId;
      const company = await this.APIService.getCompanyById(companyId)
      const companyTimezone = newDate.toLocaleString("en-US", { timeZone: company.timezone });
      const companyTime = format(new Date(companyTimezone), 'HH:mm');
      const date = new Date(Date.now());
      const month = date.getMonth()
      const trainings = await this.commonRepository.find({where:{companyId:companyId, type:'training'}});
      if (companyTime === '00:00') {
        for (let i = 0; i < trainings.length; i++) {
          if (trainings[i].data.monthNo.includes(month)) {
            trainings[i].data.completedList=[];
            await this.commonRepository.save(trainings[i]);
           }
          
        }
      }
    } catch (error) {
      console.log(error);
      
    }
  }
}

 */