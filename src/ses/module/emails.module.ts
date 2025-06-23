import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesModule } from '@nextnm/nestjs-ses';
import { EmailsNewService } from '../service/emails.service';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import {HrmEmployeeDetails} from '../../allEntities/employeeDetails.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { EmailVerificationController } from '../controller/emails.controller.service';


@Module
({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmVerification
    ]),
    
    APIModule,
    SesModule,
  ],
   controllers: [EmailVerificationController],
  providers: [EmailsNewService],
  exports: [EmailsNewService],
})
export class EmailsNewModule { }
