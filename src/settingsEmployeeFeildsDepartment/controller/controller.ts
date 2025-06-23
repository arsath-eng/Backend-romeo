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
import { DepartmentService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/department')
  async postDepartment(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.departmentService.postDepartment(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/department')
  async getDepartments( @Param('companyId') companyId: string) {
    try {
      return await this.departmentService.getDepartments(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/department/:id')
  async putDepartmentById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.departmentService.putDepartmentById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/department/:id')
  async deleteDepartmentById(@Param('id') id: string,  ) {
    try {
      await this.departmentService.deleteDepartmentById(id  );
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
