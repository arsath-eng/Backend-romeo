import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetsCategoryController } from '../controller/controller';
import { AssetsCategoryService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmConfigs]), ],
  controllers: [AssetsCategoryController],
  providers: [AssetsCategoryService],
  exports: [],
})
export class AssetsCategoryModule {}
