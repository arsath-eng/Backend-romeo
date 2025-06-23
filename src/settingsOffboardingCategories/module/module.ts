import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffboardingCategoriesController } from '../controller/controller';
import { OffboardingCategoriesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmBoardingTaskEmployees,
    ]),
    
  ],
  controllers: [OffboardingCategoriesController],
  providers: [OffboardingCategoriesService],
  exports: [],
})
export class OffboardingCategoriesModule {}
