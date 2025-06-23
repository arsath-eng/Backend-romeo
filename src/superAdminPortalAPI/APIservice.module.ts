
import { CompanyModule } from '../company/module/company.module';
import { CompanyService } from '../company/service/company.service';
import { S3Module } from '../s3/module/module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APIController } from './APIservice.controller';
import { APIService } from './APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        HrmEmployeeDetails
    ]), S3Module,],
    controllers: [APIController],
    providers: [APIService],
    exports: [APIService],
  })
export class APIModule {}
