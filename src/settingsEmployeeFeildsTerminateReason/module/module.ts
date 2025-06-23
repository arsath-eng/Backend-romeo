import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TerminateReasonController } from '../controller/controller';
import { TerminateReasonService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmEmployeeDetails
    ]),
    
  ],
  controllers: [TerminateReasonController],
  providers: [TerminateReasonService],
  exports: [],
})
export class TerminateReasonModule {}
