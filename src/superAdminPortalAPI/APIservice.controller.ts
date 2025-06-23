import { Controller, Param, Res, UploadedFiles,  Request, HttpException, HttpStatus, Post, UseInterceptors, Get, Headers, Put, Delete, Body, UploadedFile, UseGuards, HttpCode, Query} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { APIService } from './APIservice.service';
import { CompanyService } from '../company/service/company.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class APIController {
    constructor(
        private readonly APIService: APIService,
    ) {}
    @Get('sap/test')
    async getTestCompany( ) {
      try {
        const response = await this.APIService.getTestCompanies();
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get('connect-main/company-owner/:username')
    async getOwnerByUserName(  @Request() req, @Param('username') username: string) {
        try {
          const response = await this.APIService.getOwnerByUserName(username);
           return (response);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
    @Get('connect-main/company-owner-companyId/:companyId')
    async getOwnerByCompanyId(  @Request() req, @Param('companyId') companyId: string) {
        try {
          const response = await this.APIService.getOwnerByCompanyId(companyId);
           return (response);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
    @Get('connect-main/company-employees/:companyId')
    async getEmployeesByCompanyId(  @Request() req, @Param('companyId') companyId: string) {
        try {
          const response = await this.APIService.getEmployeesByCompanyId(companyId);
           return (response);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
    @Get('sap/company/features/single/:companyId')
    async getCompanyFeaturesActive(  @Request() req, @Param('companyId') companyId: string) {
      try {
        const response = await this.APIService.getSuperAdminCompanyFeaturesSingle(companyId);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get('sap/config/packages')
    async getPackages(  @Request() req) {
      try {
        const response = await this.APIService.getSuperAdminConfigPackages();
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get('sap/config/packages/:id')
    async getPackagesById(  @Request() req, @Param('id') id: string) {
      try {
        const response = await this.APIService.getSuperAdminConfigPackagesById(id);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get(':companyId/coupon')
    async getCouponByCompanyId(  @Request() req, @Param('companyId') companyId: string) {
      try {
        const response = await this.APIService.getCouponByCompanyId(companyId);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @HttpCode(201)
  @Post('package/upgrade')
    async upgradePackage(  @Request() req) {
      try {
        const response = await this.APIService.postPackageUpgrade(req.body);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @HttpCode(200)
  @Post('package/verify')
    async packageVerify(  @Request() req) {
      try {
        const response = await this.APIService.postPackageVerify(req.body);
         return (response);

      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @Delete(':companyId/package-unsubscribe')
    async removeSubscription(  @Request() req, @Param('companyId') companyId: string) {
      try {
        await this.APIService.deleteSubscripton(companyId);
          return {
          statusCode: 200,
          description: 'success',
        };

      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get(':companyId/retrieve-card-information')
    async getCard(@Request() req, @Param('companyId') companyId: string) {
        try {
          const response = await this.APIService.getCard(companyId);
          return response;
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @HttpCode(200)
  @Post(':companyId/update-card')
    async updateCard(@Request() req, @Param('companyId') companyId: string) {
        try {
          const response = await this.APIService.postUpdateCard(req.body, companyId);
          return response;
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Get('romeo-web-packages?')
    async romeoWebPackages(@Request() req, @Query('currency') currency: string,) {
        try {
          const response = await this.APIService.romeoWebPackages(currency);
          return response;
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Get('/:companyId/retrieve-bills')
    async getStripeInvoiceList(@Request() req, @Param('companyId') companyId: string) {
      try {
        const response = await this.APIService.getStripeInvoiceList(companyId);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Post(':companyId/renew-retry')
    async renewStripeSubscription(@Request() req, @Param('companyId') companyId: string) {
        try {
          const response = await this.APIService.postUpdateCard(req.body.execute, companyId);
          return response;
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Get('/:companyId/renew-retry')
    async getAttemptCount(@Request() req, @Param('companyId') companyId: string) {
      try {
        const response = await this.APIService.getAttemptCount(companyId);
         return (response);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
}
