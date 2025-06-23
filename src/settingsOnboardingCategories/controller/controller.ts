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
import { OnboardingCategoriesService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OnboardingCategoriesController {
  constructor(private readonly onboardingCategoriesService: OnboardingCategoriesService) {}

  @HttpCode(200)
  @Post(':companyId/settings/onboarding/categories')
  async postOnboardingCategories(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.onboardingCategoriesService.postOnboardingCategories(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/onboarding/categories')
  async getOnboardingCategories( @Param('companyId') companyId: string
  ) {
    try {
      return await this.onboardingCategoriesService.getOnboardingCategories(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/onboarding/categories/:id')
  async putOnboardingCategoriesById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.onboardingCategoriesService.putOnboardingCategoriesById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/onboarding/categories/:id')
  async deleteOnboardingCategoriesById(@Param('id') id: string,  ) {
    try {
      await this.onboardingCategoriesService.deleteOnboardingCategoriesById(id  );
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
