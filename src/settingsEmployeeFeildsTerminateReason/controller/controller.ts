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
import { TerminateReasonService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class TerminateReasonController {
  constructor(
    private readonly terminateReasonService: TerminateReasonService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/terminate-reasons')
  async postTerminateReason(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.terminateReasonService.postTerminateReason(req,   companyId
        );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/terminate-reasons')
  async getTerminateReasons( @Param('companyId') companyId: string
  ) {
    try {
      return await this.terminateReasonService.getTerminateReasons(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/terminate-reasons/:id')
  async putTerminateReasonById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.terminateReasonService.putTerminateReasonById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/terminate-reasons/:id')
  async deleteTerminateReasonById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.terminateReasonService.deleteTerminateReasonById(id  );
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
