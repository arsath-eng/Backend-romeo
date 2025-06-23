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
import { HiringCandidateStatusesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class HiringCandidateStatusesController {
  constructor(
    private readonly hiringCandidateStatusesService: HiringCandidateStatusesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/hiring/candidate-satatuses')
  async postHiringCandidateStatuses(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.hiringCandidateStatusesService.postHiringCandidateStatuses(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/hiring/candidate-satatuses')
  async getHiringCandidateStatuses( @Param('companyId') companyId: string) {
    try {
      return await this.hiringCandidateStatusesService.getHiringCandidateStatuses(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/hiring/candidate-satatuses/:id')
  async deleteHiringCandidateStatusesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.hiringCandidateStatusesService.deleteHiringCandidateStatusesById(
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
