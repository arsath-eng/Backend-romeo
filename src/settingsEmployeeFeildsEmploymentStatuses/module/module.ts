import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmploymentStatusesController } from '../controller/controller';
import { EmploymentStatusesService } from '../service/service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HrmEmployeeDetails,HrmConfigs]),
    
  ],
  controllers: [EmploymentStatusesController],
  providers: [EmploymentStatusesService],
  exports: [EmploymentStatusesService],
})
export class EmploymentStatusesModule {}
