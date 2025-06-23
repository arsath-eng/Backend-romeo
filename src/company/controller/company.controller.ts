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
import { CompanyService } from '../service/company.service';
import { CompanyDto } from '../dto/company.dto';
import { AuthGuard } from '@nestjs/passport';
import { tr } from 'date-fns/locale';
@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  async getProfile(
    @Query('id') id: string,
  ) {
    try {
      return await this.companyService.getProfile(id);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get(':companyId/homepage-common')
  async getHome(
    @Param('companyId') companyId: string,
    @Headers() header,
    @Request() req,
  ) {
    try {
      return await this.companyService.getHome(
        header['userid'],
        companyId,
        req,
      );
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get('company')
  async getCompanies() {
    try {
      return await this.companyService.getCompanies();
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('health')
  async getHealth() {
    try {
      return await this.companyService.getHealth();
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @HttpCode(201)
  @Post('company')
  async postCompany(
    @Request() req,
  ) {
    try {
      const body = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        companyName: req.body.companyName,
        selectedCountry: req.body.selectedCountry,
        timezone: req.body.timezone,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        heroLogoURL: req.body.heroLogoURL,
        logoURL: req.body.logoURL,
        theme: req.body.theme,
        userId: req.body.userId,
        address: req.body.address,
        atoDetails: {abn: req.body.abn,branchNumber: req.body.branchNumber,stp:false},
      }
      if (req.body.hasOwnProperty('surveyAnswer')) {
        body['surveyAnswer'] = req.body.surveyAnswer;
      }
      return await this.companyService.postCompany(body);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  // @HttpCode(200)
  // @Post('destroy-pc')
  // async postFullCompany(
  //   @Body() notes: CompanyDto,

  //   @Request() req,
  // ) {
  //   try {
  //     await this.companyService.postFullCompany();
  //     return {
  //       statusCode: 200,
  //       description: 'success',
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }
  @HttpCode(201)
  @Post('signup/verification-step-one')
  async postCompanyVerificationStepOne(
    @Body() body: Body,

    @Request() req,
  ) {
    try {
      return await this.companyService.postCompanyVerificationStepOne(body);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @HttpCode(201)
  @Post('signup/verification-step-two')
  async postCompanyVerificationStepTwo(
    @Body() body: Body,

    @Request() req,
  ) {
    try {
      return await this.companyService.postCompanyVerificationStepTwo(body);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get(':companyId/company')
  async getCompany(@Param('companyId') companyId: string) {
    try {
      return await this.companyService.getCompany(companyId);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Put('company/:id')
  async putCompanyById(@Param('id') id: string, @Body() body: Body) {
    try {
      return await this.companyService.putCompanyById(id, body);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Delete('company/:id')
  async deleteCompanyById(
    @Param('id') id: string,

    @Body() body: Body,
  ) {
    try {
      const type = 'company';
      await this.companyService.deleteCompanyById(id, body, type);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Delete('connect-main/company/:id')
  async deleteCompanyByIdSAP(
    @Param('id') id: string,

    @Request() req,
    @Body() body: Body,
  ) {
    try {
      const type = 'company';
      await this.companyService.deleteCompanyById(id, req.body, type);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Delete('connect-main/company-all/:id')
  async deleteCompanyAllByIdSAP(
    @Param('id') id: string,

    @Request() req,
    @Body() body: Body,
  ) {
    try {
      const type = 'company';
      req.body['execute'] = true;
      await this.companyService.deleteCompanyById(id, req.body, type);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @HttpCode(200)
  @Post('dummy-data/:id')
  async deleteCompanyDummyById(
    @Param('id') id: string,

    @Body() body: Body,
  ) {
    try {
      const type = 'dummy';
      await this.companyService.deleteCompanyById(id, body, type);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get('elegibility-check/:companyId')
  async getEligibilityCheck(
    @Param('companyId') companyId: string,
    @Headers() req,
  ) {
    try {
      return await this.companyService.getEligibilityCheck(
        companyId,
        req['userid'],
      );
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('company-common/:companyId')
  async getCompanyCommon(
    @Param('companyId') companyId: string,
  ) {
    try {
      return await this.companyService.getCompanyCommon(companyId)
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('change-organisation')
  async postChangeOrg(
    @Request() req,
  ) {
    try {
      return await this.companyService.postChangeOrg(req.body.employeeId, req.body.companyId);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Post('direct-signup')
  async postDirectSignup(
    @Request() req,
  ) {
    try {
      return await this.companyService.postDirectSignup(req);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Post('update-employee-count')
  async updateItemCount(
    @Request() req,
  ) {
    try {
      return await this.companyService.updateItemCount(req);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('request-verification')
  async postPhoneVerification(
    @Request() req,
  ){
    try{
      return await this.companyService.postPhoneVerification(req);

    }catch(error){
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }

  }

  @Get('verify-phonenumber')
  async getVerifyPhone(
    @Query('companyId') companyId: string,
  ){
    try{
     return await this.companyService.getVerifyPhone(companyId);

    }catch(error){
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('abn-verification')
  async postAbnVerification(
    @Body() body: Body,
  ) {
    try {
      return await this.companyService.postAbnVerification(body["abn"], body["branchNo"]);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('storage')
  async getCompanyStorage(
    @Query('companyId') companyId: string,
  ){
    try{
     return await this.companyService.getCompanyStorage(companyId);

    }catch(error){
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('settings/employee-fields/multiple-delete')
  async deleteEmployeeFields(
    @Request() req,
  ) {
    try {
      return await this.companyService.deleteEmployeeFields(req.body.companyId, req.body.ids);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
