/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidatesController } from '../controller/candidates.controller';
import { CandidatesService } from '../service/candidates.services';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      hrmHiring
    ]),
    
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [],
})
export class CandidatesModule {}
 */