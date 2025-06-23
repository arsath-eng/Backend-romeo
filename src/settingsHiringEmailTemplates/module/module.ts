import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HiringEmailTemplatesController } from '../controller/controller';
import { HiringEmailTemplatesService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [HiringEmailTemplatesController],
  providers: [HiringEmailTemplatesService],
  exports: [],
})
export class HiringEmailTemplatesModule {}
