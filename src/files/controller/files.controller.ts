import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Headers,
  Query
} from '@nestjs/common';
import { FilesService } from '../service/files.service';

import {
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

const path = require('path');


@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('/folders')
  async postFolders(@Request() req) {
    try {
      return await this.filesService.postFolders(req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('/folders')
  async getFolders(
      @Query('all') all: boolean,
      @Query('companyId') companyId: string,
      @Query('employeeId') employeeId?: string,
      @Query('id') id?: string,
      @Query('from') from?: number,
      @Query('to') to?: number,
  ) {
    try {
      return await this.filesService.getFolders(companyId, employeeId, id, all, from, to);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Put('/folders')
  async putFolders(
    @Request() req,   
  ) {
    try {
      await this.filesService.putFolders(req.body);
      return {
          statusCode: 200,
          description: 'success',
        };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Delete('/folders')
  async deleteFolder(
      @Query('id') id?: string,
  ) {
    try {
      await this.filesService.deletefolder(id);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Post('/file/new/files')
  async postFiles(@Request() req) {
    try {
      return await this.filesService.postFiles(req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Post('/file/new/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  async postUploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
     
  ) {
    try {
      return await this.filesService.postUploadFiles(files, req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('/file/new/files')
  async getFiles(
      @Query('companyId') companyId: string,
      @Query('all') all: boolean,
      @Query('employeeId') employeeId?: string,
      @Query('folderId') folderId?: string,
      @Query('type') type?: string,
      @Query('id') id?: string,
      @Query('from') from?: number,
      @Query('to') to?: number,
  ) {
    try {
      return await this.filesService.getFiles(companyId, employeeId, folderId, type, id, all, from, to);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Put('/file/new/files')
  async putFiles(
    @Request() req,   
  ) {
    try {
      await this.filesService.putFiles(req.body);
      return {
          statusCode: 200,
          description: 'success',
        };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Delete('/file/new/files')
  async deleteFile(
      @Query('id') id?: string,
  ) {
    try {
      await this.filesService.deleteFile(id);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/getSignedUrl?')
  async getSignedUrl(
    @Query('url') url: string,
    
  ) {
    try {
      return await this.filesService.getSignedUrl(url);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/getLogoUrl?')
  async getLogoUrl(
    @Query('url') url: string,
    
  ) {
    try {
      return await this.filesService.getLogoUrl(url);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
