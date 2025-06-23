
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSupportController } from '../controller/customer-support.controller';
import { CustomerSupportService } from '../service/customer-support.service';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmCustomerSupport,
      HrmEmployeeDetails
    
    ]), APIModule],
  controllers: [CustomerSupportController],
  providers: [CustomerSupportService]
})
export class CustomerSupportModule {}
