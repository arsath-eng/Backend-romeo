

import { TimezoneModule } from '../../timezone/timezone.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from '../controller/attendance.controller';
import { AttendanceService } from '../service/attendance.service';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import {HrmAttendanceSummary} from "@flows/allEntities/attendanceSummary.entity"
import { LeaveManagementModule } from '@flows/leave-management/leave-management.module';
import { S3Module } from '@flows/s3/module/module';
import { PdfModule } from '@flows/pdf/pdf.module';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';
import { SocketModule } from '@flows/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmAttendance,
      HrmEmployeeDetails,
      HrmNotifications,
      HrmConfigs,
      HrmAttendanceSummary
    ]),TimezoneModule, APIModule, LeaveManagementModule, S3Module, PdfModule, NotificationsModule, SocketModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
