

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimezoneController } from './timezone.controller';
import { TimezoneService } from './timezone.service';
import { APIModule } from '../superAdminPortalAPI/APIservice.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      HrmEmployeeDetails
    ]),APIModule
  ],
  controllers: [TimezoneController],
  providers: [TimezoneService],
  exports: [TimezoneService],
})
export class TimezoneModule {}
