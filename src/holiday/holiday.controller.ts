import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { AuthGuard } from '@nestjs/passport';
import { payrollSettingsHolidayDto, payrollSettingsHolidayGetAllDto, payrollSettingsHolidayGroupsDto } from '@flows/allDtos/holiday.dto';

@Controller('/holidays')
export class HolidayController {
    constructor(private readonly HolidayService: HolidayService) {}

    // @UseGuards(AuthGuard('JWT'))
    @Post()
    async postPayrollHoliday(
        @Body() data: payrollSettingsHolidayDto,
    ): Promise<any> {
        try {
        return await this.HolidayService.postPayrollHoliday(data);
        } catch (error) {
        console.log(error);
        new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Put()
    async putPayrollHoliday(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
        @Body() data: any,
    ): Promise<{ statusCode: number, description: string, }> {
        try {
        return await this.HolidayService.putPayrollHoliday(id, data,companyId);
        } catch (error) {
        console.log(error);
        new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Get()
    async getAllPayrollHoliday(
        @Query('companyId') companyId: string,
        @Query('id') id:string
    ): Promise<payrollSettingsHolidayGetAllDto> {
        try {
        return await this.HolidayService.getAllPayrollHoliday(companyId,id);
        } catch (error) {
        console.log(error);
        new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    @Delete()
    async deletePayrollHoliday(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
    ): Promise<{ statusCode: number, description: string, }> {
        try {
        return await this.HolidayService.deletePayrollHoliday(
            companyId,
            id,
        );
        } catch (error) {
        console.log(error);
        new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('/groups')
    async postPayrollHolidayGroup(
        @Body() data: payrollSettingsHolidayGroupsDto,
    ): Promise<any> {
        try {
        return await this.HolidayService.postPayrollHolidayGroup(data);
        } catch (error) {
        console.log(error);
        new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }

    @Put('groups')
    async updatePayrollSettingsHolidayGroup(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
        @Body() data: any,
    ) {
        try {
        return await this.HolidayService.putPayrollHolidayGroup(id, data,companyId);
        } catch (error) {
        console.log(error);
        return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }

    /* @Get('/groups')
    async getPayrollHolidayGroup(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
    ) {
        try {
        return await this.HolidayService.getPayrollHolidayGroup(
            companyId,
            id,
        );
        } catch (error) {
        console.log(error);
        return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    } */

    @Get('/groups')
    async getPayrollSettingsHolidayGroups(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
    ){
        try {
        return await this.HolidayService.getAllPayrollHolidayGroup(
            companyId,
            id
        );
        } catch (error) {
        console.log(error);
        return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('/groups')
    async deletePayrollHolidayGroup(
        @Query('companyId') companyId: string,
        @Query('id') id: string,
    ) {
        try {
        return await this.HolidayService.deletePayrollHolidayGroup(
            companyId,
            id,
        );
        } catch (error) {
        console.log(error);
        return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
}