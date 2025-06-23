import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApprovalsEmployeesController } from '../controller/controller';
import { ApprovalsEmployeesService } from '../service/service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmEmployeeDetails]), ],
  controllers: [ApprovalsEmployeesController],
  providers: [ApprovalsEmployeesService],
  exports: [],
})
export class ApprovalsEmployeesModule {}
