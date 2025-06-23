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
import { CompanyLinksService } from '../service/companyLinks.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CompanyLinksController {
  constructor(private readonly companyLinksService: CompanyLinksService) {}

  @HttpCode(200)
  @Post(':companyId/company-links/categories')
  async postCompanyLinksCategories(
    @Body() body,
     
    @Request() req,
    @Param('companyId') companyId: string
  ) {
    try {
      return await this.companyLinksService.postCompanyLinksCategories(body,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/company-links/categories')
  async getCompanyLinksCategories( @Param('companyId') companyId: string) {
    try {
      return await this.companyLinksService.getCompanyLinksCategories(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('company-links/categories/:id')
  async getCompanyLinksCategoriesById(
    @Param('id') id: string,
     
  ) {
    try {
      return await this.companyLinksService.getCompanyLinksCategoriesById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Put('company-links/categories/:id')
  async putCompanyLinksCategoriesById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.companyLinksService.putCompanyLinksCategoriesById(
        id,
        body,
          
      );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Delete('company-links/categories/:id')
  async deleteCompanyLinksCategoriesById(
    @Param('id') id: string,
     
  ) {
    try {
      await this.companyLinksService.deleteCompanyLinksCategoriesById(id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @HttpCode(200)
  @Post(':companyId/company-links/links')
  async postCompanyLinks(@Body() body,   @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.companyLinksService.postCompanyLinks(body,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/company-links/links')
  async getCompanyLinks( @Param('companyId') companyId: string) {
    try {
      return await this.companyLinksService.getCompanyLinks(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('company-links/links/:id')
  async getCompanyLinksById(@Param('id') id: string,  ) {
    try {
      return await this.companyLinksService.getCompanyLinksById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Put('company-links/links/:id')
  async putCompanyLinksById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.companyLinksService.putCompanyLinksById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Delete('company-links/links/:id')
  async deleteCompanyLinksById(@Param('id') id: string,  ) {
    try {
      await this.companyLinksService.deleteCompanyLinksById(id  );
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
