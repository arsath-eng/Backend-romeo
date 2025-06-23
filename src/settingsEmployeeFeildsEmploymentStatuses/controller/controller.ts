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
import { EmploymentStatusesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class EmploymentStatusesController {
  constructor(
    private readonly employmentStatusesService: EmploymentStatusesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/employment-statuses')
  async postEmploymentStatuses(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.employmentStatusesService.postEmploymentStatuses(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/employment-statuses')
  async getEmploymentStatuses( @Param('companyId') companyId: string) {
    try {
      return await this.employmentStatusesService.getEmploymentStatuses(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/employment-statuses/:id')
  async putEmploymentStatusesById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.employmentStatusesService.putEmploymentStatusesById(
        id,
        req,
          
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/employment-statuses/:id')
  async deleteEmploymentStatusesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.employmentStatusesService.deleteEmploymentStatusesById(
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
