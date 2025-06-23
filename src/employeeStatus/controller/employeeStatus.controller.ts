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
import { EmployeeStatusService } from '../service/employeeStatus.service';
import { Response } from 'express';

import { EmployeeStatusDto } from '../dto/employeeStatus.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class EmployeeStatusController {
  constructor(private readonly employeeStatusService: EmployeeStatusService) {}

  @HttpCode(200)
  @Post(':companyId/employement-statuses')
  async postEmployeeStatus(
    @Body() employeeStatus: EmployeeStatusDto,
     
    @Request() req,
    @Param('companyId') companyId: string

  ) {
    try {
      return await this.employeeStatusService.postEmployeeStatus(employeeStatus,   companyId, req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/employement-statuses')
  async getEmployeeStatus( @Param('companyId') companyId: string
  ) {
    try {
      return await this.employeeStatusService.getEmployeeStatus(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('employement-statuses/:employeeId')
  async getEmployeeStatusById(@Param('id') id: string, @Param('employeeId') employeeId: string  ) {
    try {
      return await this.employeeStatusService.getEmployeeStatusById(employeeId );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('employement-statuses/:employeeId/:id')
  async putEmployeeStatusById(
    @Param('id') id: string,
    @Body() body: Body,
    @Request() req,
    @Param('employeeId') employeeId: string,
  ) {
    try {
      return await this.employeeStatusService.putEmployeeStatusById(id, body, req, employeeId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('employement-statuses/:employeeId/:id')
  async deleteEmployeeStatusById(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Request() req,
  ) {
    try {
      await this.employeeStatusService.deleteEmployeeStatusById(id, req, employeeId);
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
