import {
  Body,
  Controller,
  Request,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Headers,
  Req
} from '@nestjs/common';
import { DocumentService } from '../service/documents.service';
import { Response } from 'express';

import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from './helper';
import { AuthGuard } from '@nestjs/passport';
const path = require('path');

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}
  
  @HttpCode(200)
  @Post(':companyId/folders')
  async postFolders(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.documentService.postFolders(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get(':companyId/folders')
  async getFolders( @Param('companyId') companyId: string) {
    try {
      return await this.documentService.getFolders(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('folders/:id')
  async putCommentById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.documentService.putFolderById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Delete('folders/:id')
  async deleteCommentById(@Param('id') id: string,  ) {
    try {
      await this.documentService.deleteFolderById(id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @HttpCode(200)
  @Post(':companyId/documents')
  async postDocuments(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.documentService.postDocuments(req,companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @HttpCode(201)
  @Post(':companyId/upload-documents')
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  async postDuplicateDocuments(
    @Param('companyId') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
     
  ) {
    try {
      return await this.documentService.postDuplicateDocuments(files,  id, req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('documents/:id')
  async getDocumentsByEmployeeId(
    @Param('id') id: string, 
  ) {
    try {
      return await this.documentService.getDocumentsByEmployeeId(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('documents/single/:id')
  async getDocumentsById(
    @Param('id') id: string, 
  ) {
    try {
      return await this.documentService.getDocumentsById(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get(':companyId/documents')
  async getDocuments(
     @Param('companyId') companyId: string
  ) {
    try {
      return await this.documentService.getDocuments(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('documents-single/:id')
  async getDocumentById(
     @Param('id') id: string
  ) {
    try {
      return await this.documentService.getDocumentById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get(':companyId/documents/count/:id')
  async getDocumentsCountByEmployeeId(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
     
  ) {
    try {
      return await this.documentService.getDocumentsCountByEmployeeId(id, companyId );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get(':companyId/access-levels/documents/employee/:id')
  async getSharedDocumentsByEmployeeId(
    @Param('id') id: string,
    @Param('companyId') companyId: string, 
  ) {
    try {
      return await this.documentService.getSharedDocumentsByEmployeeId(id, companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('documents/folders/:id')
  async getDocumentsByFolderId(@Param('id') id: string,  ) {
    try {
      return await this.documentService.getDocumentsByFolderId(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Delete('documents/:id')
  async deleteDocumentById(@Param('id') id: string,   @Request() req) {
    try {
      await this.documentService.deleteDocumentById(req, id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('documents/:id')
  async putDocumentsById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.documentService.putDocumentsById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('delete/documents')
  async putDeleteMultipleDocumentsById(@Request() req,  ) {
    try {
      await this.documentService.putDeleteMultipleDocumentsById(req  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('move/documents')
  async putMoveMultipleDocumentsById(@Request() req,  ) {
    try {
      return await this.documentService.putMoveMultipleDocumentsById(req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
