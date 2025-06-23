
import { S3Module } from '../../s3/module/module';
import { S3Service } from '../../s3/service/service';
import { EmailsNewModule } from '../../ses/module/emails.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferLetterController } from '../controller/offer-letter.controller';
import { OfferLetterService } from '../service/offer-letter.service';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import {hrmHiring} from '@flows/allEntities/hrmHiring.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmOfferLetter,
      HrmEmployeeDetails,
      hrmHiring
    ]),EmailsNewModule,S3Module, APIModule],
  controllers: [OfferLetterController],
  providers: [OfferLetterService]
})
export class OfferLetterModule {}
