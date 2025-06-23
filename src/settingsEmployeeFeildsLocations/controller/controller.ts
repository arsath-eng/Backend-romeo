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
import { LocationsService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/locations')
  async postLocations(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.locationsService.postLocations(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/locations')
  async getLocations( @Param('companyId') companyId: string
  ) {
    try {
      return await this.locationsService.getLocations(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/locations/:id')
  async putLocationsById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.locationsService.putLocationsById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/locations/:id')
  async deleteLocationsById(@Param('id') id: string,  ) {
    try {
      await this.locationsService.deleteLocationsById(id  );
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
