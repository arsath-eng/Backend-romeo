import { Module } from '@nestjs/common';
import { PartnerPortalController } from './partner-portal.controller';
import { PartnerPortalService } from './partner-portal.service';
import { SpecialUser } from '@flows/allEntities/specialUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { S3Module } from '@flows/s3/module/module';
import { APIModule } from '@flows/superAdminPortalAPI/APIservice.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        SpecialUser
      ]),
      EventEmitterModule, S3Module, APIModule
    ],
    controllers: [PartnerPortalController],
    providers: [PartnerPortalService],
    exports: [],
  })
export class PartnerPortalModule {}
