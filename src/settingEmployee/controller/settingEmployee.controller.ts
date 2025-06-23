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
  Query,
} from '@nestjs/common';
import { SettingEmployeeService } from 'src/settingEmployee/service/settingEmployee.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class SettingEmployeeController {
  constructor(
    private readonly settingEmployeeService: SettingEmployeeService
) {}

  @HttpCode(200)
  @Post('settings/employee-feilds/licences')
  async postDivision(  @Request() req) {
    try {
      return await this.settingEmployeeService.postlicenses(req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('settings/employee-feilds/licences')
  async getLicenses(
     @Query('companyId') companyId: string) {
        try {
            return await this.settingEmployeeService.getLicenses(companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }

    
  }

  @Put('settings/employee-feilds/licences')
  async putLicensesById(

     @Request() req,
    ) {
        try {
            return await this.settingEmployeeService.putLicensesById(req);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }

    
  }

  @Delete('settings/employee-feilds/licences')
  async deleteLicensesById(
    @Query('id') id: string
    ) {
    try {
      await this.settingEmployeeService.deleteLicensesById(id );
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
