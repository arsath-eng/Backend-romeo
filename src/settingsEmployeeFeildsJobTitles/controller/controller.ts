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
import { JobTitlesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class JobTitlesController {
  constructor(private readonly jobTitlesService: JobTitlesService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/job-titles')
  async postJobTitles(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.jobTitlesService.postJobTitles(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/job-titles')
  async getJobTitles( @Param('companyId') companyId: string
  ) {
    try {
      return await this.jobTitlesService.getJobTitles(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/job-titles/:id')
  async putJobTitlesById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.jobTitlesService.putJobTitlesById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/job-titles/:id')
  async deleteJobTitlesById(@Param('id') id: string,  ) {
    try {
      await this.jobTitlesService.deleteJobTitlesById(id  );
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
