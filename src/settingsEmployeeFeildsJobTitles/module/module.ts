import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobTitlesController } from '../controller/controller';
import { JobTitlesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmEmployeeDetails,
      HrmNotifications
    ]),
    
  ],
  controllers: [JobTitlesController],
  providers: [JobTitlesService],
  exports: [],
})
export class JobTitlesModule {}
