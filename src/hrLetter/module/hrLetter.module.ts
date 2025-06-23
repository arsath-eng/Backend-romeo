
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hrletterTemplateCategory } from '@flows/allEntities/hrletterTemplateCategory.entity';
import {hrletterTemplate } from '@flows/allEntities/hrletterTemplate.entity';
import { hrletterGenerate } from '@flows/allEntities/hrletterGenerate.entity';
import { HRLetterCategoriesService } from '../service/hrLetterCategories.service';
import { HRLetterController } from '@flows/hrLetter/controller/hrLetter.controller';
import { HRLetterTemplatesService } from '../service/hrLetterTemplate.service';
import { HRLetterGenerateService } from '../service/hrLetterGenerate.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';
import { HRLetterRequesteService } from '../service/hrLetterRequest.service';
import { hrletterRequest } from '@flows/allEntities/hrletterRequest.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
           
            hrletterTemplateCategory,
            hrletterTemplate,
            hrletterGenerate,
            hrletterRequest,
            
            HrmEmployeeDetails
        ]),
        APIModule,
        NotificationsModule
       
      
      ],
      controllers: [HRLetterController],
      providers: [HRLetterCategoriesService,HRLetterTemplatesService,HRLetterGenerateService,HRLetterRequesteService],
      exports: [TypeOrmModule] 
})
export class HRLetterModule {}
