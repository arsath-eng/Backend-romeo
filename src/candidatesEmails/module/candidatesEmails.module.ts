/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidatesEmailsController } from '../controller/candidatesEmails.controller';
import { CandidatesEmailsService } from '../service/candidatesHistory.service';
import { EmailsNewModule } from '../../ses/module/emails.module';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([hrmHiring]),
    
    EmailsNewModule
  ],
  controllers: [CandidatesEmailsController],
  providers: [CandidatesEmailsService],
  exports: [],
})
export class CandidatesEmailsModule {}
 */