import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyLogoController } from '../controller/companyLogo.controller';
import { CompanyLogoService } from '../service/companyLogo.service';
import { S3Module } from '../../s3/module/module';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmFolders,
    HrmFiles,
    HrmEmployeeDetails,
  ]), S3Module, APIModule],
  controllers: [CompanyLogoController],
  providers: [CompanyLogoService],
  exports: [],
})
export class CompanyLogoModule {}
