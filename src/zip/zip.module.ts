import { Module } from '@nestjs/common';
import { ZipController } from './zip.controller';
import { ZipService } from './zip.service';

@Module({
    imports: [],
    controllers: [ZipController],
    providers: [ZipService],
    exports: [],
  })
export class ZipModule {}
