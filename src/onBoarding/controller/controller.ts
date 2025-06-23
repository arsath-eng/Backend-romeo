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
import { OnboardingTaskEmployeesService } from '../service/service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OnboardingTaskEmployeesController {
  constructor(
    private readonly onboardingTaskEmployeesService: OnboardingTaskEmployeesService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/onboarding/task/employees')
  async postOnboardingTaskEmployees(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.onboardingTaskEmployeesService.postOnboardingTaskEmployees(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/onboarding/task/employees')
  async getOnboardingTaskEmployees( @Param('companyId') companyId: string) {
    try {
      return await this.onboardingTaskEmployeesService.getOnboardingTaskEmployees(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('onboarding/task/employees/:employeeId')
  async getOnboardingTaskEmployeesById( @Param('employeeId') id: string) {
    try {
      return await this.onboardingTaskEmployeesService.getOnboardingTaskEmployeesById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('onboarding/task/employees/:id')
  async putOnboardingTaskEmployeesById(
    @Param('id') id: string,
    @Body() body:Body,
     
  ) {
    try {
      return await this.onboardingTaskEmployeesService.putOnboardingTaskEmployeesById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('onboarding/task/employees/:id')
  async deleteOnboardingTaskEmployeesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.onboardingTaskEmployeesService.deleteOnboardingTaskEmployeesById(
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
  @Post('onboarding/task/employees/removeall')
  async postOnboardingTaskEmployeesRemoveAll(  @Request() req) {
    try {
      return await this.onboardingTaskEmployeesService.postOnboardingTaskEmployeesRemoveAll(
        req
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('onboarding/task/employees/multiple')
  async postOnboardingTaskEmployeesMultiple(  @Request() req) {
    try {
      return await this.onboardingTaskEmployeesService.postOnboardingTaskEmployeesMultiple(
        req
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
