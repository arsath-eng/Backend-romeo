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
  Headers,
  Query
} from '@nestjs/common';
import { NotificationService } from '../service/notifications.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { uuid } from 'aws-sdk/clients/customerprofiles';
import { EmailsNewService } from '../../ses/service/emails.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmInformationRequest } from '@flows/allEntities/informationRequest.entity';
import { HrmTimesheetRequests } from '@flows/allEntities/timesheetRequests.entity';
@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService
  ) {}

  @Post('/request')
  async postRequest(
    @Body() informationRequest: any,
  ) :Promise<{ code: number, data: any }>{
    try {
      return await this.notificationService.postRequest(informationRequest);
    } catch (error) {
      console.log(error);
      throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Post('/timeoff-email-approval')
  async postNotificationTemplateResponse(
    @Headers() header,
    @Request() req,
  ) :Promise<{ status: string }>{
    try {
      return await this.notificationService.postNotificationTemplateResponse(req, header);
    } catch (error) {
      console.log(error);
      throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('notifications/:employeeId')
  async getRequestNotifications(
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId: string,
    @Query('type') type?: string,
    @Query('all') all?: boolean,
  ) :Promise<{ status: string, notifications: HrmNotifications[] }>{
    try {
      const response = await this.notificationService.getRequestNotifications(all, type, employeeId, companyId);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  
  @Get('information-request/:id')
  async getInformationRequestById(
    @Param('id') id: string,
  ):Promise<HrmInformationRequest> {
    try {
      const response = await this.notificationService.getInformationRequestById(id);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Put('information-request/:id')
  async putInformationRequestById(
    @Param('id') id: string,
    @Request() req
  ):Promise<HrmInformationRequest> {
    try {
      const response = await this.notificationService.putInformationRequestById(id, req);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Delete('information-request/:id')
  async deleteInformationRequestById(@Param('id') id: string,  ):Promise<{
    statusCode: 200,
    description: 'success',
  }> {
    try {
      await this.notificationService.deleteInformationRequestById(id);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  
  @Post('timesheet-request')
  async postLeaveRequest(
    @Request() req,
  )
  :Promise<{ code: number, data: HrmTimesheetRequests }>
  {
    try {
      return await this.notificationService.postTimesheetRequest(req);
    } catch (error) {
      console.log(error);
    }
  }
  
  @Get('timesheet-request/id')
  async getTimesheetRequestById(
    @Param('id') id: string,
  ):Promise<HrmTimesheetRequests> {
    try {
      const response = await this.notificationService.getTimesheetRequestById(id);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Delete('timesheet-request/:id')
  async deleteTimesheetRequestById(@Param('id') id: string,  ):Promise<{
    statusCode: 200,
    description: 'success',
  }> {
    try {
      await this.notificationService.deleteTimesheetRequestById(id);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  
  @Get('requests/:companyId/:employeeId')
  async getRequestsByEmployeeId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type?: string,
    @Query('all') all?: boolean,
  ):Promise<{ total: number, requests: any[] }> {
    try {
      const response = await this.notificationService.getRequestsByEmployeeId(all, type, from, to, employeeId, companyId);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get('request/:id')
  async getRequestById(
    @Param('id') id: string,
  ):Promise<{ type: string, requests: any[] }> {
    try {
      const response = await this.notificationService.getRequestById(id);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Put('request/:id')
  async putRequestById(
    @Param('id') id: string,
    @Request() req
  ):Promise<{ status: string }> {
    try {
      const response = await this.notificationService.putRequestById(id, req.body.status);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Delete('request/:id')
  async deleteRequestById(
    @Param('id') id: string,
  ):Promise<{ status: string }> {
    try {
      const response = await this.notificationService.deleteRequestById(id);
      return response;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  //
  @Post('notifications/read/:notificationId')
  async addReadEmployee(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ):Promise<{ status: string }> {
    try {
      return await this.notificationService.addReadEmployee(notificationId, req);
    } catch (error) {
      console.log(error);
    }
  }
}
