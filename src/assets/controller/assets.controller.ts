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
import { AssetsService } from '../service/assets.service';
import { Response } from 'express';

import { AssetsDto } from '../../allDtos/assets.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}
  @HttpCode(200)
  @Post(':companyId/assets')
  async postAssets(
    @Body() assets: AssetsDto,
     
    @Request() req,
    @Param('companyId') companyId: string
  ) {
    try {
      return await this.assetsService.postAssets(req, assets, companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/assets')
  async getAssets(@Param('companyId') companyId: string) {
    try {
      return await this.assetsService.getAssets(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('assets/:id')
  async getAssetsById(@Param('id') id: string) {
    try {
      return await this.assetsService.getAssetsById(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('assets/:id')
  async putAssetsById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.assetsService.putAssetsById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('assets/:id')
  async deleteAssetsById(@Param('id') id: string,  ) {
    try {
      await this.assetsService.deleteAssetsById(id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  // 
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
