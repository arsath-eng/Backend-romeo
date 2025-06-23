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
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { OnboardingTaskService } from '../service/service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OnboardingTaskController {
  constructor(
    private readonly onboardingTaskService: OnboardingTaskService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/onboarding/task')
  async postOnboardingTask(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.onboardingTaskService.postOnboardingTask(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/onboarding/task')
  async getOnboardingTask( @Param('companyId') companyId: string) {
    try {
      return await this.onboardingTaskService.getOnboardingTask(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/onboarding/task/:id')
  async getOnboardingTaskById( @Param('id') id: string) {
    try {
      return await this.onboardingTaskService.getOnboardingTaskById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/onboarding/task/:id')
  async putOnboardingTaskById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.onboardingTaskService.putOnboardingTaskById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('settings/onboarding/task/delete/:id')
  async deleteOnboardingTaskById(
    @Param('id') id: string,
     
    @Request() req
  ) {
    try {
      await this.onboardingTaskService.deleteOnboardingTaskById(
        id,
        req,
          
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
