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
import { AccessLevelsEmployeesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AccessLevelsEmployeesController {
  constructor(
    private readonly accessLevelsEmployeesService: AccessLevelsEmployeesService,
  ) {}

  @Get('settings/access-levels/employee/:employeeId')
  async getAccessLevelsByEmployeeId( @Param('employeeId') employeeId: string) {
    try {
      return await this.accessLevelsEmployeesService.getAccessLevelsByEmployeeId(employeeId  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @HttpCode(200)
  @Post(':companyId/settings/access-levels/employees')
  async postAccessLevelsEmployees(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.accessLevelsEmployeesService.postAccessLevelsEmployees(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/access-levels/employees')
  async getAccessLevelsEmployees( @Param('companyId') companyId: string) {
    try {
      return await this.accessLevelsEmployeesService.getAccessLevelsEmployees(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/access-levels/employees/:id')
  async getAccessLevelsEmployeesById(
    @Param('id') id: string,
     
  ) {
    try {
      return await this.accessLevelsEmployeesService.getAccessLevelsEmployeesById(
        id,
          
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/access-levels/employees/:employeeId')
  async putAccessLevelsEmployeesById(
    @Request() req,
    @Param('employeeId') employeeId: string, 
  ) {
    try {
      console.log(req.body);
      
      return await this.accessLevelsEmployeesService.putAccessLevelsEmployeesById(req, employeeId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
