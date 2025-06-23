import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingEmployeeController } from 'src/settingEmployee/controller/settingEmployee.controller';
import { SettingEmployeeService } from 'src/settingEmployee/service/settingEmployee.service';
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
  controllers: [SettingEmployeeController],
  providers: [SettingEmployeeService],
  exports: [SettingEmployeeService],
})
export class SettingEmployeeModule {}
