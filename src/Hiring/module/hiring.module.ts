import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '@flows/allEntities/candidate.entity';
import { HiringController } from 'src/Hiring/controller/hiring.controller';
import { CareerService } from 'src/Hiring/service/career.service';
import { JobOpeningsService } from 'src/Hiring/service/jobOpening.service';
import { OfferLettersService } from '@flows/Hiring/service/offerLetter.service';
import { CandidateService } from 'src/Hiring/service/candidate.service';
import { TalentPoolService } from 'src/Hiring/service/talentPool.service';
import { Job } from '@flows/allEntities/job.entity';
import { TalentPool } from '@flows/allEntities/talentPool.entity';




import { Career } from '@flows/allEntities/career.entity';
import { OfferLetters } from '@flows/allEntities/offerLetters.entity';

import { S3Module } from '@flows/s3/module/module';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';
import { Files } from '@flows/allEntities/newFiles.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Candidate,
            Job,
            TalentPool,
            Career,
            OfferLetters,
            Files,
            HrmEmployeeDetails,
            
            

        ]),
       
        S3Module,
        APIModule,
        NotificationsModule
      ],
      controllers: [HiringController],
      providers: [CandidateService,CareerService,JobOpeningsService,OfferLettersService,TalentPoolService],
      exports: [TypeOrmModule] 
})
export class HiringModule {}
