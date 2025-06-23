import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { S3Module } from '@flows/s3/module/module';
import { EmailsNewModule } from '@flows/ses/module/emails.module';

@Module({
    imports: [
        S3Module, EmailsNewModule
    ],
    controllers: [PdfController],
    providers: [PdfService],
    exports: [PdfService],
  })
export class PdfModule {}
