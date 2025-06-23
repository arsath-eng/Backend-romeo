import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DivisionController } from '../controller/controller';
import { DivisionService } from '../service/service';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmEmployeeDetails,
      HrmNotifications,
    ]),
    
  ],
  controllers: [DivisionController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}
