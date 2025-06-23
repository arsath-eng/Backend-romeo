import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HiringCandidateSourcesController } from '../controller/controller';
import { HiringCandidateSourcesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [HiringCandidateSourcesController],
  providers: [HiringCandidateSourcesService],
  exports: [],
})
export class HiringCandidateSourcesModule {}
