import {
  Controller,
  Request,
  Post,
  Res,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { OffboardingTaskEmployeesService } from '../service/service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OffboardingTaskEmployeesController {
  constructor(
    private readonly offboardingTaskEmployeesService: OffboardingTaskEmployeesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/offboarding/task/employees')
  async postOffboardingTaskEmployees(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.offboardingTaskEmployeesService.postOffboardingTaskEmployees(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/offboarding/task/employees')
  async getOffboardingTaskEmployees( @Param('companyId') companyId: string) {
    try {
      return await this.offboardingTaskEmployeesService.getOffboardingTaskEmployees(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('offboarding/task/employees/:employeeId')
  async getOffboardingTaskEmployeesById( @Param('employeeId') id: string) {
    try {
      return await this.offboardingTaskEmployeesService.getOffboardingTaskEmployeesById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('offboarding/task/employees/:id')
  async putOffboardingTaskEmployeesById(
    @Param('id') id: string,
    @Body() body:Body,
     
  ) {
    try {
      return await this.offboardingTaskEmployeesService.putOffboardingTaskEmployeesById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('offboarding/task/employees/:id')
  async deleteOffboardingTaskEmployeesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.offboardingTaskEmployeesService.deleteOffboardingTaskEmployeesById(
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

  @HttpCode(200)
  @Post('offboarding/task/employees/removeall')
  async postOffboardingTaskEmployeesRemoveAll(  @Request() req) {
    try {
      return await this.offboardingTaskEmployeesService.postOffboardingTaskEmployeesRemoveAll(
        req
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('offboarding/termination/employee')
  async postOffboardingTerminationEmployee(  @Request() req) {
    try {
      return await this.offboardingTaskEmployeesService.postOffboardingTerminationEmployee(
        req
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('offboarding/task/employees/multiple')
  async postOffboardingTaskEmployeesMultiple(  @Request() req) {
    try {
      return await this.offboardingTaskEmployeesService.postOffboardingTaskEmployeesMultiple(
        req
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
