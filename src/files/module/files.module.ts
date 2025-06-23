import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from '../controller/files.controller';
import { FilesService } from '../service/files.service';
import { S3Module } from '../../s3/module/module';
import { TimeTrackingModule } from '../../time-tracking/time-tracking.module';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmFiles,
      HrmFolders,
      Files
    ]),
    
    S3Module,
    TimeTrackingModule,
    APIModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
