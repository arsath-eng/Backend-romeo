import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppraisalService } from './appraisal.service';
import { AppraisalRequest360Dto, AppraisalResponseDto, getAppraisalDto, getAppraisalResponseDto, getAppraisalTemplateDto, getAppraisalTemplateResponseDto, postAppraisalDto, postAppraisalTemplateDto, putAppraisalDto, putAppraisalTemplateDto, SubmitAppraisalDto } from '@flows/allDtos/appraisal.dto';
import { ApiTags } from '@nestjs/swagger';
//import { KeycloakAuthGuard } from '@flows/auth/auth.guard';

@Controller('appraisal')
@ApiTags('Appraisal')
export class AppraisalController {
    constructor(private readonly AppraisalService: AppraisalService) {}

    @Get('appraisal-templates')
    async getAppraisalTemplates(
      @Query('companyId') companyId: string,
      @Query('id') id?: string
      
      ): Promise<getAppraisalTemplateResponseDto> {
      try {
        return await this.AppraisalService.getAppraisalTemplates(companyId, id);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Post('appraisal-templates')
    async postAppraisalTemplate(
      @Body() postAppraisalTemplate: postAppraisalTemplateDto
      ): Promise<getAppraisalTemplateResponseDto> {
      try {
        return await this.AppraisalService.postAppraisalTemplate(postAppraisalTemplate);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Put('appraisal-templates')
    async putAppraisalTemplate(
      @Body() putAppraisalTemplate: putAppraisalTemplateDto
    ): Promise<getAppraisalTemplateResponseDto> {
      try {
        return await this.AppraisalService.putAppraisalTemplate(putAppraisalTemplate);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Delete('appraisal-templates')
    async deleteAppraisalTemplate(
      @Query('id') id: string
    ): Promise<AppraisalResponseDto> {
      try {
        return await this.AppraisalService.deleteAppraisalTemplate(id);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    //@UseGuards(KeycloakAuthGuard)
    @Get()
    async getAppraisals(
      @Query('companyId') companyId: string,
      @Query('employeeId') employeeId?: string,
      @Query('360Id') id360?: string,
      @Query('id') id?: string
      
      ): Promise<getAppraisalResponseDto> {
      try {
        return await this.AppraisalService.getAppraisals(companyId, employeeId, id360, id);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Post()
    async postAppraisal(
      @Body() postAppraisal: postAppraisalDto
      ): Promise<getAppraisalResponseDto> {
      try {
        return await this.AppraisalService.postAppraisal(postAppraisal);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Put()
    async putAppraisal(
      @Body() putAppraisal: putAppraisalDto
    ): Promise<AppraisalResponseDto> {
      try {
        return await this.AppraisalService.putAppraisal(putAppraisal);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    @Delete()
    async deleteAppraisal(
      @Query('id') id: string
    ): Promise<AppraisalResponseDto> {
      try {
        return await this.AppraisalService.deleteAppraisal(id);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    @Post('submit')
    async postSubmitAppraisal(
      @Body() SubmitAppraisal: SubmitAppraisalDto
      ): Promise<AppraisalResponseDto> {
      try {
        return await this.AppraisalService.postSubmitAppraisal(SubmitAppraisal);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }

    @Post('request360')
    async post360AppraisalRequest(
      @Body() AppraisalRequest360: AppraisalRequest360Dto
      ): Promise<AppraisalResponseDto> {
      try {
        return await this.AppraisalService.post360AppraisalRequest(AppraisalRequest360);
      } catch (error) {
        new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
}
