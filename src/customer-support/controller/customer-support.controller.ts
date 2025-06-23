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
  import { Response } from 'express';
  
  import { AuthGuard } from '@nestjs/passport';
  import { CustomerSupportService } from '../service/customer-support.service';
@Controller()
export class CustomerSupportController {
    constructor(
        private readonly CustomerSupportService: CustomerSupportService,
        
        ) {}
        @Get('/:companyId/customer-support-subjects')
        
        async getCustomerSupportSubjects(@Param('companyId') companyId: string) {
          try {
            return await this.CustomerSupportService.getCustomerSupportSubjects(companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Get('/connect-main/:companyId/customer-support-subjects')
        async getCustomerSupportSubjectsSAP(@Param('companyId') companyId: string) {
          try {
            return await this.CustomerSupportService.getCustomerSupportSubjects(companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Get('/customer-support/:msgId')
        
        async getCustomerSupport(@Param('msgId') msgId: string) {
          try {
            return await this.CustomerSupportService.getCustomerSupport(msgId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Get('connect-main/customer-support/:msgId')
        async getCustomerSupportSAP(@Param('msgId') msgId: string) {
          try {
            return await this.CustomerSupportService.getCustomerSupport(msgId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }

        @Post('/customer-support')
        
        async postCustomerSupport(  @Request() req) {
          try {
            return await this.CustomerSupportService.postCustomerSupportGlobal(req);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Post('connect-main/customer-support-post')
        async postSapCustomerSupport(@Request() req) {
          try {
            return await this.CustomerSupportService.postCustomerSupportGlobal(req);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
}
