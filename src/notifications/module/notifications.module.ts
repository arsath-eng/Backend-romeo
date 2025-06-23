
import { HrmEmployeeDetails } from "@flows/allEntities/employeeDetails.entity";

import { EmailsNewModule } from "@flows/ses/module/emails.module";
import { SocketModule } from "@flows/socket/socket.module";
import { APIModule } from "@flows/superAdminPortalAPI/APIservice.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsController } from "../controller/notifications.controller";
import { NotificationService } from "../service/notifications.service";
import { HrmNotifications } from "@flows/allEntities/notifications.entity";
import { HrmVerification } from "@flows/allEntities/verification.entity";
import { S3Module } from "@flows/s3/module/module";
import {OnboardingTask} from '@flows/allEntities/OnboardingTask.entity'



@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmNotifications,
      HrmVerification,
      OnboardingTask
    ]),
    EmailsNewModule, APIModule, SocketModule,S3Module
  ],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
