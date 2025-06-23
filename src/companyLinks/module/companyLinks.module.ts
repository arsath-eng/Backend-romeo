import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyLinksController } from '../controller/companyLinks.controller';
import { CompanyLinksService } from '../service/companyLinks.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HrmConfigs]),
    
  ],
  controllers: [CompanyLinksController],
  providers: [CompanyLinksService],
  exports: [],
})
export class CompanyLinksModule {}
