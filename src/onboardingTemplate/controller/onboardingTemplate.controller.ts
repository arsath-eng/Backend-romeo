import { Controller,Request,Post, Body, HttpStatus,HttpCode, HttpException,UseGuards,Query,Get,Delete,Put,Param, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import {onboardingTemplateService} from '../service/onboardingTemplate.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

// @UseGuards(AuthGuard('JWT'))
@Controller('onboarding')
export class onboardingController {
    constructor(private readonly onboardingTemplateService:onboardingTemplateService){}

    @HttpCode(200)
    @Post('templates')
    @UseInterceptors(FileInterceptor('files'))
    async postOnboardingTemplate(
        @Req() Req,
        @Body() body: Body,
        @UploadedFile() files: Express.Multer.File
    ){
        try{
            return await this.onboardingTemplateService.postOnboardingTemplate(Req,files)
        }catch(error){
            console.error(error);
            throw new HttpException('Error creating template!', HttpStatus.BAD_REQUEST)
        }

    }

    @Get('templates')
    async getOnboardingTemplates(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
        @Query('all') all: boolean,
        @Query('start') start: number,
        @Query('end') end: number,
    ) {
    try {
      return await this.onboardingTemplateService.getOnboardingTemplates(
        companyId,
        id,
        all,
        start,
        end,
      );
    } catch (error) {
      console.error(error);
      throw new HttpException('Error fetching templates!', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('templates')
  @UseInterceptors(FileInterceptor('files'))
  async updateOnboardingTemplate(
    @Req() req: Request,
    @Query('id') id: string,
    @Query('companyId') companyId: string,
    @UploadedFile() files: Express.Multer.File
  ) {
    try {
      return await this.onboardingTemplateService.updateOnboardingTemplate(req,id,files);
    } catch (error) {
      console.error(error);
      throw new HttpException('Error updating template!', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('templates')
  async deleteOnboardingTemplate(@Query('id') id: string) {
    try {
      return await this.onboardingTemplateService.deleteOnboardingTemplate(id);
    } catch (error) {
      console.log(error);
      throw new HttpException('Error deleting template!', HttpStatus.BAD_REQUEST)
    }
  }
}
