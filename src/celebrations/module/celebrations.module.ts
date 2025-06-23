import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CelebrationsController } from '../controller/celebrations.controller';
import { CelebrationsService } from '../service/celebrations.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmEmployeeDetails]), ],
  controllers: [CelebrationsController],
  providers: [CelebrationsService],
  exports: [CelebrationsService],
})
export class CelebrationsModule {}
