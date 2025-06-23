import { Module } from '@nestjs/common';
import { AppraisalController } from './appraisal.controller';
import { AppraisalService } from './appraisal.service';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [AppraisalController],
    providers: [AppraisalService],
    exports: [AppraisalService]
  })

export class AppraisalModule {}
