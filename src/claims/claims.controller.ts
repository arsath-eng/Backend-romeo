import { Controller, Param, Res, UploadedFiles,  Request, HttpException, HttpStatus, Post, UseInterceptors, Get, Headers, Put, Delete, Body, UploadedFile, Query, HttpCode} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ClaimsDto } from '../allDtos/claims.dto';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Claims')
export class ClaimsController {
    constructor(
        private readonly claimsService: ClaimsService,
    ) {}
    @HttpCode(201)
  @Post(':companyId/upload-claim-file')
    @UseInterceptors(
      FilesInterceptor('files', 10),
    )
    async uploadClaimFile(
      @Param('companyId') companyId: string,
        @Request() req,
        @UploadedFiles() files: Array<Express.Multer.File>,
         
      ) {
        try {
          return await this.claimsService.uploadClaimFile(files,  req,companyId);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }

    @HttpCode(200)
    @Post(':companyId/claims')
    @ApiResponse({ description: 'success', status: 200, content: {}})
    async postClaims(
        @Body() claimsDto: ClaimsDto,
        @Request() req,
        @Param('companyId') companyId: string,
         
      ) {
        try {
          return await this.claimsService.postClaims(req,  companyId, claimsDto);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
    @Delete('requests/claim-request/:id')
    async deleteClaimsRequest(
      @Param('id') id: string,
      @Body() body: Body,
       
      @Request() req,
    ) {
      try {
        await this.claimsService.deleteClaimsRequest(req,  id);
          return {
          statusCode: 200,
          description: 'success',
        };
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Put('request/claim/:id')
    async putClaims(
        @Request() req,
        @Param('id') id: string,
         
      ) {
        try {
          return await this.claimsService.putClaims(req,  id);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
    
    @Get(':companyId/claims-all?')
    async getClaimsByDataRange(
      @Query('from') from: string,
      @Query('to') to: string,
      @Param('companyId') companyId: string,
       
    ) {
      try {
        return await this.claimsService.getClaimsByDataRange(from, to, companyId  );
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Get('claims-all/:employeeId')
    async getClaimsByEmployeeId(
      @Param('employeeId') employeeId: string,
       
    ) {
      try {
        return await this.claimsService.getClaimsByEmployeeId(   employeeId);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Get('claims-single/:id')
    async getClaimsById(
      @Param('id') id: string,
       
    ) {
      try {
        return await this.claimsService.getClaimsById(   id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
}
