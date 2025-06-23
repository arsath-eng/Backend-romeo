import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query, Res } from '@nestjs/common';
import { PartnerPortalService } from './partner-portal.service';
import { PostSpecialUserDto, PostSwitchToSpecialUserDto, PutSpecialUserDto, SpecialUserDto } from '@flows/allDtos/specialUser.dto';

@Controller()
export class PartnerPortalController {
    constructor(private readonly partnerPortalService: PartnerPortalService) {}

    @Get('partner')
    async getPartnersByCompanyId(
      @Query('companyId') companyId: string,
      ) {
      try {
        return await this.partnerPortalService.getPartnersByCompanyId(companyId);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Post('partner')
    async postPartner(
      @Body() body: PostSpecialUserDto
      ) {
      try {
        return await this.partnerPortalService.postPartner(body);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Put('partner')
    async putPartner(
      @Body() body: PutSpecialUserDto
    ){
      try {
        return await this.partnerPortalService.putPartner(body);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Delete('partner')
    async deletePartnerById(
      @Query('id') id: string,
      @Query('companyId') companyId: string,
      ) {
      try {
        return await this.partnerPortalService.deletePartnerById(id, companyId);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Post('employee/partner')
    async switchToSpecialUser(
      @Body() body: PostSwitchToSpecialUserDto
      ) {
      try {
        return await this.partnerPortalService.switchToSpecialUser(body.employeeId, body.type);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
}
