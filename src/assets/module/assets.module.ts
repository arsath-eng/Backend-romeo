import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetsController } from '../controller/assets.controller';
import { AssetsService } from '../service/assets.service';
import { AccAssets } from '@flows/allEntities/assets.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccAssets]), NotificationsModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [],
})
export class AssetsModule {}
