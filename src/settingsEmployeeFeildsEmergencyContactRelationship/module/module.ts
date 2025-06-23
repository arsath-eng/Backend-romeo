import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmergencyContactRelationshipController } from '../controller/controller';
import { EmergencyContactRelationshipService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HrmConfigs]),
    
  ],
  controllers: [EmergencyContactRelationshipController],
  providers: [EmergencyContactRelationshipService],
  exports: [EmergencyContactRelationshipService],
})
export class EmergencyContactRelationshipModule {}
