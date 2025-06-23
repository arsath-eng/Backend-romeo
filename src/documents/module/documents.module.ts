import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentsController } from '../controller/documents.controller';
import { DocumentService } from '../service/documents.service';
import { S3Module } from '../../s3/module/module';
import { TimeTrackingModule } from '../../time-tracking/time-tracking.module';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmFolders,
    HrmFiles,
    HrmEmployeeDetails,
  ]), S3Module,TimeTrackingModule, APIModule],
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentsModule {}
