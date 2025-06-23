import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnnouncementsController } from '../controller/announcements.controller';
import { AnnouncementsService } from '../service/announcements.service';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { SocketModule } from '@flows/socket/socket.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmAnnouncements,
      HrmNotifications,
      HrmEmployeeDetails
    ]),
     SocketModule, NotificationsModule
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [],
})
export class AnnouncementsModule {}
