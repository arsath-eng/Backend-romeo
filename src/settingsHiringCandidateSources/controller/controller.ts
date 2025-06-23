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
import { HiringCandidateSourcesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class HiringCandidateSourcesController {
  constructor(
    private readonly hiringCandidateSourcesService: HiringCandidateSourcesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/hiring/candidates-sources')
  async postHiringCandidateSources(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.hiringCandidateSourcesService.postHiringCandidateSources(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/hiring/candidates-sources')
  async getHiringCandidateSources( @Param('companyId') companyId: string) {
    try {
      return await this.hiringCandidateSourcesService.getHiringCandidateSources(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/hiring/candidates-sources/:id')
  async deleteHiringCandidateSourcesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.hiringCandidateSourcesService.deleteHiringCandidateSourcesById(
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
