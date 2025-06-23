import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidatesCommentsController } from '../controller/candidatesComments.controller';
import { CandidatesCommentsService } from '../service/candidatesComments.service';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([hrmHiring]),
    
  ],
  controllers: [CandidatesCommentsController],
  providers: [CandidatesCommentsService],
  exports: [],
})
export class CandidatesCommentsModule {}
