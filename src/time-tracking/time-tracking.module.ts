import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { Module } from '@nestjs/common';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';
import { SocketModule } from '@flows/socket/socket.module';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        HrmActivityTracking,
        HrmEmployeeDetails
      ]), APIModule, SocketModule, NotificationsModule
    ],
    controllers: [TimeTrackingController],
    providers: [TimeTrackingService],
    exports: [TimeTrackingService],
  })
export class TimeTrackingModule {}
