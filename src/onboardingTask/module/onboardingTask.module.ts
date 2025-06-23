import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {OnboardingTask} from '../../allEntities/OnboardingTask.entity';
import {OnboardingTaskController} from '../controller/onboardingTask.controller'
import {onboardingTaskService} from '../service/onboardingTask.service'
import { NotificationsModule } from "@flows/notifications/module/notifications.module";
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmFiles } from '../../allEntities/hrmFiles.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            OnboardingTask,
            HrmNotifications,
            HrmFiles
            
        ]),
        NotificationsModule
        
    ],
    controllers: [OnboardingTaskController],
    providers:[onboardingTaskService]
})
export class onboardingTaskModule {}
