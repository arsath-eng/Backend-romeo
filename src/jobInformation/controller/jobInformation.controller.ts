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
  Headers
} from '@nestjs/common';
import { JobInformationService } from '../service/jobInformation.service';
import { Response } from 'express';

import { JobInformationDto } from '../dto/jobInformation.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class JobInformationController {
  constructor(private readonly jobInformationService: JobInformationService) {}

  @HttpCode(200)
  @Post(':companyId/job-info')
  async postJobInformation(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.jobInformationService.postJobInformation(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/job-info')
  async getJobInformation( @Param('companyId') companyId: string) {
    try {
      return await this.jobInformationService.getJobInformation(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('job-info/:id')
  async getJobInformationById(@Param('id') id: string,  ) {
    try {
      return await this.jobInformationService.getJobInformationById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('job-info/:id')
  async putJobInformationById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.jobInformationService.putJobInformationById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('job-info/:employeeId/:id')
  async deleteJobInformationById(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Request() req,
  ) {
    try {
      await this.jobInformationService.deleteJobInformationById(id, employeeId, req);
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
