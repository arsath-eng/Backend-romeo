import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsCategoryController } from './claimCategory.controller';
import { ClaimsCategoryService } from './claimCategory.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmConfigs
]),],
  controllers: [ClaimsCategoryController],
  providers: [ClaimsCategoryService]
})
export class ClaimsCategoryModule {}
