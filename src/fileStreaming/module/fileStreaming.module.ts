import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStreamingController } from '../controller/fileStreaming.controller';

@Module({
  imports: [],
  controllers: [FileStreamingController],
  providers: [],
  exports: [],
})
export class FileStreamingModule {}
