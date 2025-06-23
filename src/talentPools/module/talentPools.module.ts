/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TalentPoolsController } from '../controller/talentPools.controller';
import { TalentPoolsService } from '../service/talentPools.service';
import { EmailsNewModule } from '../../ses/module/emails.module';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { S3Module } from '@flows/s3/module/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      hrmHiring
    ]),
    EmailsNewModule,S3Module
  ],
  controllers: [TalentPoolsController],
  providers: [TalentPoolsService],
  exports: [],
})
export class TalentPoolsModule {}

 */