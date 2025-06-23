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
} from '@nestjs/common';
import { HiringEmailTemplatesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class HiringEmailTemplatesController {
  constructor(
    private readonly hiringEmailTemplatesService: HiringEmailTemplatesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/hiring/email-templates')
  async postHiringEmailTemplates(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.hiringEmailTemplatesService.postHiringEmailTemplates(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/hiring/email-templates')
  async getHiringEmailTemplates( @Param('companyId') companyId: string) {
    try {
      return await this.hiringEmailTemplatesService.getHiringEmailTemplates(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/hiring/email-templates/:id')
  async getHiringEmailTemplatesById( @Param('id') id: string,) {
    try {
      return await this.hiringEmailTemplatesService.getHiringEmailTemplatesById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/hiring/email-templates/:id')
  async putHiringEmailTemplatesById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.hiringEmailTemplatesService.putHiringEmailTemplatesById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/hiring/email-templates/:id')
  async deleteHiringEmailTemplatesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.hiringEmailTemplatesService.deleteHiringEmailTemplatesById(
        id,
          
      );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
