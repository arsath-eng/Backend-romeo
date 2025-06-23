import { Module } from '@nestjs/common';
import { EmergencyContactsController } from '../controller/emergencyContacts.controller';
import { EmergencyContactsService } from '../service/emergencyContacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails
    ]),
    
  ],
  controllers: [EmergencyContactsController],
  providers: [EmergencyContactsService],
  exports: [],
})
export class EmergencyContactsModule {}
