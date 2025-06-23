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
import { AssetsCategoryService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AssetsCategoryController {
  constructor(private readonly assetsCategoryService: AssetsCategoryService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/assets-category')
  async postAssetsCategory(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.assetsCategoryService.postAssetsCategory(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/assets-category')
  async getAssetsCategory( @Param('companyId') companyId: string
  ) {
    try {
      return await this.assetsCategoryService.getAssetsCategory(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/assets-category/:id')
  async putAssetsCategoryById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.assetsCategoryService.putAssetsCategoryById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/assets-category/:id')
  async deleteAssetsCategoryById(@Param('id') id: string,  ) {
    try {
      await this.assetsCategoryService.deleteAssetsCategoryById(id  );
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
