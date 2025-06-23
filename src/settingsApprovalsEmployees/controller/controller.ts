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
import { ApprovalsEmployeesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class ApprovalsEmployeesController {
  constructor(
    private readonly approvalsEmployeesService: ApprovalsEmployeesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/approvals/employees')
  async postApprovalsEmployees(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.approvalsEmployeesService.postApprovalsEmployees(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/approvals/employees')
  async getApprovalsEmployees( @Param('companyId') companyId: string
  ) {
    try {
      return await this.approvalsEmployeesService.getApprovalsEmployees(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/approvals/employees/:id')
  async getApprovalsEmployeesById(
    @Param('employeeId') id: string,
     
  ) {
    try {
      return await this.approvalsEmployeesService.getApprovalsEmployeesById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/approvals/employees/:id')
  async putApprovalsEmployeesById(
    @Param('employeeId') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.approvalsEmployeesService.putApprovalsEmployeesById(
        id,
        req,
          
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
