/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingController } from '../controller/controller';
import { TrainingService } from '../service/service';
import { TimezoneModule } from '../../timezone/timezone.module';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { TrainingTasksService } from '../service/training.task.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmEmployeeDetails,
      HrmTrainingComplete
    ]),
     TimezoneModule, APIModule
  ],
  controllers: [TrainingController],
  providers: [TrainingService,TrainingTasksService],
  exports: [TrainingService,TrainingTasksService],
})
export class TrainingModule {}
 */