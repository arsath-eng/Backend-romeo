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
import { DegreeService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/degree')
  async postdegree(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.degreeService.postDegree(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/degree')
  async getDegrees( @Param('companyId') companyId: string) {
    try {
      return await this.degreeService.getDegrees(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/degree/:id')
  async putDegreeById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.degreeService.putDegreeById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/degree/:id')
  async deleteDegreeById(@Param('id') id: string,  ) {
    try {
      await this.degreeService.deleteDegreeById(id  );
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
