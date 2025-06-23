import { Module } from '@nestjs/common';
import { SurveyService } from '../service/survey.service';
import { SurveyController } from '../controller/survey.controller';
import { hrmSurveyQuestionnaires } from '@flows/allEntities/hrmSurveyQuestionnaires.entity';
import { hrmSurveySurveys } from '@flows/allEntities/hrmSurveySurveys.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      hrmSurveyQuestionnaires,
      hrmSurveySurveys,
      HrmNotifications,
    ]),
    NotificationsModule
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
