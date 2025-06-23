import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnboardingCategoriesController } from '../controller/controller';
import { OnboardingCategoriesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs,
      HrmBoardingTaskEmployees,
    ]),
    
  ],
  controllers: [OnboardingCategoriesController],
  providers: [OnboardingCategoriesService],
  exports: [],
})
export class OnboardingCategoriesModule {}
