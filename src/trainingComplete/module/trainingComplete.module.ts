import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingCompleteController } from '../controller/trainingComplete.controller';
import { TrainingCompleteService } from '../service/trainingComplete.service';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmTrainingComplete,
    ]),
    
  ],
  controllers: [TrainingCompleteController],
  providers: [TrainingCompleteService],
  exports: [],
})
export class TrainingCompleteModule {}
