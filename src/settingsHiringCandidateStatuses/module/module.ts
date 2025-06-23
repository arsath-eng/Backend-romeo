import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HiringCandidateStatusesController } from '../controller/controller';
import { HiringCandidateStatusesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [HiringCandidateStatusesController],
  providers: [HiringCandidateStatusesService],
  exports: [],
})
export class HiringCandidateStatusesModule {}
