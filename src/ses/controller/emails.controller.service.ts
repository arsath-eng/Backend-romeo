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


import { EmailsNewService } from '../service/emails.service';

@Controller()
export class EmailVerificationController {
  constructor(
    private readonly EmailsNewService: EmailsNewService
) {}
@Post('custom-email')
  async verifyEmailIdentity(
    @Query('companyId') companyId: string,
    @Body() body: Body
    ){
      try{
        return await this.EmailsNewService.verifyEmailIdentity(body,companyId);
        //return { message: `Verification email sent` };
      }catch(error){
        console.log(error);
      }
    
  }

  @Put('custom-email')
  async completeVerification(
    @Query('companyId') companyId: string,
    @Query('token') token: string,
    @Body() body: Body
  ) {
    try{
      return await this.EmailsNewService.completeVerification(token, body,companyId);
      //return { message: 'Verification process completed' };
    }catch(e){
      console.log(e);
    }
    
  }

  
 
}
