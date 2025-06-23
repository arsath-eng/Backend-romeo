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
import { DivisionService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/division')
  async postDivision(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.divisionService.postDivision(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/division')
  async getDivisions( @Param('companyId') companyId: string) {
    try {
      return await this.divisionService.getDivisions(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/division/:id')
  async putDivisionById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.divisionService.putDivisionById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/division/:id')
  async deleteDivisionById(@Param('id') id: string,  ) {
    try {
      await this.divisionService.deleteDivisionById(id  );
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
