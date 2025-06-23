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
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { OffboardingCategoriesService } from '../service/service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class OffboardingCategoriesController {
  constructor(private readonly offboardingCategoriesService: OffboardingCategoriesService) {}

  @HttpCode(200)
  @Post(':companyId/settings/offboarding/categories')
  async postOffboardingCategories(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.offboardingCategoriesService.postOffboardingCategories(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/offboarding/categories')
  async getOffboardingCategories( @Param('companyId') companyId: string
  ) {
    try {
      return await this.offboardingCategoriesService.getOffboardingCategories(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/offboarding/categories/:id')
  async putOffboardingCategoriesById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.offboardingCategoriesService.putOffboardingCategoriesById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/offboarding/categories/:id')
  async deleteOffboardingCategoriesById(@Param('id') id: string,  ) {
    try {
      await this.offboardingCategoriesService.deleteOffboardingCategoriesById(id  );
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
