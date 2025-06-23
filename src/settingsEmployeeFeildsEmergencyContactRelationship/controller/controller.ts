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
import { EmergencyContactRelationshipService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class EmergencyContactRelationshipController {
  constructor(
    private readonly EmergencyContactRelationshipService: EmergencyContactRelationshipService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/emergency-contact-relationship')
  async postEmergencyContactRelationship(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.EmergencyContactRelationshipService.postEmergencyContactRelationship(
        req,
          companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/settings/employee-feilds/emergency-contact-relationship')
  async getEmergencyContactRelationship( @Param('companyId') companyId: string) {
    try {
      return await this.EmergencyContactRelationshipService.getEmergencyContactRelationship(
          companyId
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('settings/employee-feilds/emergency-contact-relationship/:id')
  async putEmergencyContactRelationshipById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.EmergencyContactRelationshipService.putEmergencyContactRelationshipById(
        id,
        req,
          
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('settings/employee-feilds/emergency-contact-relationship/:id')
  async deleteEmergencyContactRelationshipById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.EmergencyContactRelationshipService.deleteEmergencyContactRelationshipById(
        id,
          
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
