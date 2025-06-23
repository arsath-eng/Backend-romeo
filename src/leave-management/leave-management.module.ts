import { NotificationsModule } from '@flows/notifications/module/notifications.module';
import { SocketModule } from '@flows/socket/socket.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveManagementController } from './leave-management.controller';
import { LeaveManagementService } from './leave-management.service';
import { S3Module } from '@flows/s3/module/module';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';

@Module({
    imports: [
      TypeOrmModule.forFeature(),
      SocketModule, NotificationsModule, S3Module, APIModule
    ],
    controllers: [LeaveManagementController],
    providers: [LeaveManagementService],
    exports: [LeaveManagementService],
  })
export class LeaveManagementModule {}
