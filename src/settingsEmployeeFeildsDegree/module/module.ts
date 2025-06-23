import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DegreeController } from '../controller/controller';
import { DegreeService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [DegreeController],
  providers: [DegreeService],
  exports: [],
})
export class DegreeModule {}
