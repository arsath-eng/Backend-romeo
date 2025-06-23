/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidatesHistoryController } from '../controller/candidatesHistory.controller';
import { CandidatesHistoryService } from '../service/candidatesHistory.service';
import {hrmHiring} from "../../allEntities/hrmHiring.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([hrmHiring]),
    
  ],
  controllers: [CandidatesHistoryController],
  providers: [CandidatesHistoryService],
  exports: [],
})
export class CandidatesHistoryModule {}
 */