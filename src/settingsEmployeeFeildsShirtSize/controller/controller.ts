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
import { ShirtSizeService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class ShirtSizeController {
  constructor(private readonly shirtSizeService: ShirtSizeService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/shirt-size')
  async postShirtSize(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.shirtSizeService.postShirtSize(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/shirt-size')
  async getShirtSize( @Param('companyId') companyId: string) {
    try {
      return await this.shirtSizeService.getShirtSize(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/shirt-size/:id')
  async putShirtSizeById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.shirtSizeService.putShirtSizeById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/shirt-size/:id')
  async deleteShirtSizeById(@Param('id') id: string,  ) {
    try {
      await this.shirtSizeService.deleteShirtSizeById(id  );
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
