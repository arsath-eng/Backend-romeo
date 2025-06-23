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
import { OffboardingTaskService } from '../service/service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OffboardingTaskController {
  constructor(
    private readonly offboardingTaskService: OffboardingTaskService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/offboarding/task')
  async postOffboardingTask(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.offboardingTaskService.postOffboardingTask(
        req,
          
        companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/offboarding/task')
  async getOffboardingTask( @Param('companyId') companyId: string) {
    try {
      return await this.offboardingTaskService.getOffboardingTask(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/offboarding/task/:id')
  async getOffboardingTaskById( @Param('id') id: string) {
    try {
      return await this.offboardingTaskService.getOffboardingTaskById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/offboarding/task/:id')
  async putOffboardingTaskById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.offboardingTaskService.putOffboardingTaskById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post('settings/offboarding/task/delete/:id')
  async deleteOffboardingTaskById(
    @Param('id') id: string,
     
    @Request() req
  ) {
    try {
      await this.offboardingTaskService.deleteOffboardingTaskById(
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
