import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmShiftRequests } from '@flows/allEntities/hrmShiftRequests.entity';
import { HrmRosterEmployees,HrmRosterPositions,HrmRosterSites,HrmRosterShifts,HrmRosterTemplates} from '@flows/allEntities/hrmRoster.entity';
import { HrmShiftRequestsService } from './shiftRequest.service';
import { ShiftRequestController } from './shiftRequest.controller';
import { S3Module } from '@flows/s3/module/module';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';
import { APIModule } from "@flows/superAdminPortalAPI/APIservice.module";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmRosterEmployees,
      HrmRosterPositions,
      HrmRosterSites,
      HrmRosterShifts,
      HrmRosterTemplates,
      HrmShiftRequests
    ]),
    NotificationsModule,
    S3Module,
    APIModule
  ],
  controllers: [RosterController,ShiftRequestController],
  providers: [RosterService,HrmShiftRequestsService],
  exports: [],
})
export class RosterhModule {}
