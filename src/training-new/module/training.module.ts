import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingCategoryService } from '../service/trainingCategories.service';
import { TrainingController } from '../controller/training.controller';
import { TrainingCategories } from '@flows/allEntities/trainingCategories.entity';
import { TrainingTemplate } from '@flows/allEntities/trainingTemplate.entity';
import { TrainingTemplateService } from '../service/trainingTemplate.service';
import { Training } from 'src/allEntities/trainings.entity';
import { TrainingService } from '../service/training.service';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
        TrainingCategories,
        TrainingTemplate,
        Training
    ]),
    NotificationsModule
  ],
    controllers: [TrainingController],
    providers: [TrainingCategoryService,TrainingTemplateService,TrainingService],
    exports: [TypeOrmModule]
})
export class TrainingsModule {}
