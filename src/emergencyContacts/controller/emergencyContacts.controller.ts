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
  Headers
} from '@nestjs/common';
import { EmergencyContactsService } from '../service/emergencyContacts.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class EmergencyContactsController {
  constructor(
    private readonly emergencyContactsService: EmergencyContactsService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/emergency-contacts')
  async postEmergencyContacts(@Request() req,  @Param('companyId') companyId: string) {
    try {
      return await this.emergencyContactsService.postEmergencyContacts(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/emergency-contacts')
  async getEmergencyContacts( @Param('companyId') companyId: string) {
    try {
      return await this.emergencyContactsService.getEmergencyContacts(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('emergency-contacts/:id')
  async getEmergencyContactsById(
    @Param('id') id: string,
     
  ) {
    try {
      return await this.emergencyContactsService.getEmergencyContactsById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('emergency-contacts/:employeeId/:id')
  async putEmergencyContactsById(
    @Body() body: Body,
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
     
  ) {
    try {
      return await this.emergencyContactsService.putEmergencyContactsById(
        body,
        id,
        employeeId 
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('emergency-contacts/:employeeId/:id')
  async deleteEmergencyContactById(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
     
  ) {
    try {
      await this.emergencyContactsService.deleteEmergencyContactById(id, employeeId  );
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
