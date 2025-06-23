import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessLevelsEmployeesController } from '../controller/controller';
import { AccessLevelsEmployeesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmConfigs,
    HrmEmployeeDetails
  ]), ],
  controllers: [AccessLevelsEmployeesController],
  providers: [AccessLevelsEmployeesService],
  exports: [AccessLevelsEmployeesService],
})
export class AccessLevelsEmployeesModule {}
