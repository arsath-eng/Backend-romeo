
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewPerformanceController } from '../controller/new-performance.controller';
import { NewPerformanceService } from '../service/new-performance.service';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmPerformanceTask,
    ]),

  ],
  controllers: [NewPerformanceController],
  providers: [NewPerformanceService]
})
export class NewPerformanceModule {}
