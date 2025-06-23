import {
  Controller,
  Request,
  Post,
  Res,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  HttpCode,
  Headers
} from '@nestjs/common';
import { CompanyLogoService } from '../service/companyLogo.service';
import { Response } from 'express';
import {
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
const path = require('path');

@Controller()
export class CompanyLogoController {
  constructor(private readonly companyLogoService: CompanyLogoService) {}

  @HttpCode(200)
  @Post(':companyId/logo-folders')
  async postFolders(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.companyLogoService.postFolders(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/logo-folders')
  async getFolders( @Param('companyId') companyId: string) {
    try {
      return await this.companyLogoService.getFolders(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('logo-folders/:id')
  async putFolderById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.companyLogoService.putFolderById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('logo-folders/:id')
  async deleteFolderById(@Param('id') id: string,  ) {
    try {
      await this.companyLogoService.deleteFolderById(id  );
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
  @Post(':companyId/logo-documents')
  async postDocuments(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.companyLogoService.postDocuments(req,companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('upload-logo')
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  async postDuplicateDocuments(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
     
  ) {
    try {
      return await this.companyLogoService.postDuplicateDocuments(files  , req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/logo-documents')
  async getDocuments(
     @Param('companyId') companyId: string
  ) {
    try {
      return await this.companyLogoService.getDocuments(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('logo-documents/:id')
  async deleteDocumentById(@Param('id') id: string,  ) {
    try {
      await this.companyLogoService.deleteDocumentById(id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('logo-documents/:id')
  async putDocumentsById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.companyLogoService.putDocumentsById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
