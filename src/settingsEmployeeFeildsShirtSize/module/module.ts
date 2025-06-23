import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShirtSizeController } from '../controller/controller';
import { ShirtSizeService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [ShirtSizeController],
  providers: [ShirtSizeService],
  exports: [],
})
export class ShirtSizeModule {}
