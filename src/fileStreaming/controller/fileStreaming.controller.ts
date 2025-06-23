import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class FileStreamingController {
  @Get('document-stream/:name')
  getDocumentStream(@Param('name') name: string): StreamableFile {
    const document = createReadStream(join(process.cwd(), 'public/assets/documents/',name));
    return new StreamableFile(document);
  }

  @Get('file-stream/:name')
  getFileStream(@Param('name') name: string): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'public/assets/files/',name));
    return new StreamableFile(file);
  }
}