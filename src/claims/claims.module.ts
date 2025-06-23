
import { S3Module } from '../s3/module/module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { APIModule } from '..//superAdminPortalAPI/APIservice.module';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { AccClaims } from '@flows/allEntities/claims.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        AccClaims,
        HrmFiles,
        HrmFolders,
        HrmNotifications,
        HrmEmployeeDetails
    ]), S3Module, APIModule, NotificationsModule],
    controllers: [ClaimsController],
    providers: [ClaimsService],
    exports: [],
  })
export class ClaimsModule {}
