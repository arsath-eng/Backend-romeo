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
import { ClaimsCategoryService } from './claimCategory.service';
  
  @Controller()
  export class ClaimsCategoryController {
    constructor(private readonly claimService: ClaimsCategoryService) {}
  
    @HttpCode(200)
  @Post(':companyId/settings/employee-feilds/claim-category')
    async postClaim(  @Request() req,@Param('companyId') companyId: string) {
      try {
        return await this.claimService.postClaim(req,   companyId);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
  
    @Get(':companyId/settings/employee-feilds/claim-category')
    async getClaim( @Param('companyId') companyId: string) {
      try {
        return await this.claimService.getClaim(  companyId);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
  
    @Put('settings/employee-feilds/claim-category/:id')
    async putClaimById(
      @Param('id') id: string,
      @Request() req,
       
    ) {
      try {
        return await this.claimService.putClaimById(id, req  );
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
  
    @Delete('settings/employee-feilds/claim-category/:id')
    async deleteClaimById(@Param('id') id: string,  ) {
      try {
        await this.claimService.deleteClaimById(id  );
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
  