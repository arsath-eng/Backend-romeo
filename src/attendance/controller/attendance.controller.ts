import { AuthGuard } from '@nestjs/passport';
import {
    Controller,
    Post,
    UseGuards,
    HttpCode,
    HttpException,
    HttpStatus,
    Get,
    Param,
    Put,
    Delete,
    Query,
    Body,
    ParseBoolPipe,
    Res,
    UseInterceptors,
    StreamableFile,
    Req,
  } from '@nestjs/common';
import { AttendanceService } from '../service/attendance.service';
import { attendance, CheckLocationDto, postAttendanceRequestDto, putAttendanceRequestDto } from '@flows/allDtos/attendance.dto';
import { Request, Response } from 'express';
import { PdfService } from '@flows/pdf/pdf.service';
import { getAttendanceSettings } from '../attendanceSettings.util';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
const { Readable } = require('stream');

@Controller('attendance')
export class AttendanceController {
    constructor(
      private readonly AttendanceService: AttendanceService,
      private readonly pdfService: PdfService,
      @InjectDataSource() private dataSource: DataSource,
    ) {}
    @Get('attendance')
    async getAttendance(
      @Query('companyId') companyId: string,
      @Query('all') all: boolean,
      @Query('employeeId') employeeId?: string,
      @Query('date') date?: string,
      
      ) {
        return await this.AttendanceService.getAttendance(companyId, all, employeeId, date);
    }

    @Post('attendance')
    async postAttendance(
      @Body() body
      ) {
        const attendance = await this.AttendanceService.postAttendance(body);
        attendance['action'] = 'clockIn';
        attendance['attendanceId'] = attendance.id;
        return await this.AttendanceService.postClock(attendance);
    }

    @Put('attendance')
    async updateAttendance(
      @Query('id') id: string,
      @Body() body
    ){
      return await this.AttendanceService.updateAttendance(id,body);
    }

    @Delete('attendance')
    async deleteAttendance(
      @Query('id') id: string
    ){
      return await this.AttendanceService.deleteAttendance(id);
    }

    @Post('/clock')
    async postClock(@Body() body) {
      return await this.AttendanceService.postClock(body);
    }

    @Get('/settings')
    async getSettings(
      @Query('companyId') companyId: string
      ) {
        return await getAttendanceSettings(this.dataSource, companyId);
    }

    @Put('/settings')
    async updateSettings(
      @Body() body
      ) {
        return await this.AttendanceService.updateSettings(body);
    }

    @Post('/weekly-summary')
    async postSummary(
      @Body() body
      ) {
        return await this.AttendanceService.postSummary(body);
    }

    @Get('/weekly-summary')
    async getSummary(
      @Query('companyId') companyId,
      @Query('weekStartDate') weekStartDate,
      @Query('weekEndDate') weekEndDate,
      @Query('id') id

      ) {
        return await this.AttendanceService.getSummary(weekStartDate, weekEndDate, companyId,id);
    }

    @Put('/weekly-summary')
    async updateSummary(
      @Body() body
      ) {
        return await this.AttendanceService.updateSummary(body);
    }

    @Get('/reports')
    async getReport(
      @Query('companyId') companyId: string,
      @Query('dateFrom') dateFrom: string,
      @Query('dateTo') dateTo: string,
      @Query('type') type: string,
      @Query('pdf', ParseBoolPipe) pdf: boolean,
      @Query('employeeId') employeeId?: string,
    ) {
      const response = await this.AttendanceService.getReport(dateFrom, dateTo, companyId, type, employeeId, pdf);
      
      if ('report' in response && pdf) {
        const templatePath = `src/pdf/template/${type}.pug`;
        const pdfBuffer = await this.pdfService.generatePdf(templatePath, { details: response.report });
        const pdfStream = Readable.from(pdfBuffer);
        return new StreamableFile(pdfStream, {
          type: 'application/pdf',
          disposition: 'attachment; filename="attendance report.pdf"',
          length: pdfBuffer.length,
        });
      } else {
        return response;
      }
    }
    @Post('requests')
    async postAttendanceRequest(
      @Body() attendanceRequest: postAttendanceRequestDto,
      @Req() req: Request
    ) {
      try{
        return this.AttendanceService.postAttendanceRequest(attendanceRequest, req);
      }catch(error){
        throw error
      }
    }

    @Get('requests')
    async getAttendanceRequest(
      @Query('companyId') companyId: string,
      @Query('dateFrom') dateFrom: string,
      @Query('dateTo') dateTo: string,
      @Query('status') status: string,
      @Query('employeeId') employeeId?: string,

    ) {
      try{
        return this.AttendanceService.getAttendanceRequest(dateFrom, dateTo, companyId, status, employeeId);
      }catch(error){
        throw error
      }
    }

    @Put('requests')
    async putAttendanceRequest(@Body() attendanceRequest: putAttendanceRequestDto) {
      try{
        return this.AttendanceService.putAttendanceRequest(attendanceRequest.id, attendanceRequest.status, attendanceRequest.attendanceId);
      }catch(error){
        throw error
      }
    }

     @Post('check-location')
    async checkLocation(@Body() checkLocationDto: CheckLocationDto) {
      try{
        return this.AttendanceService.checkLocation(checkLocationDto);
       
      }catch(error){
        throw error
      }
    }
      
  
  }

