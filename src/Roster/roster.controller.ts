import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
    Res,
  } from '@nestjs/common';
  import { RosterService } from './roster.service';
  import { AuthGuard } from '@nestjs/passport';
import { id } from 'date-fns/locale';
import {addPositionDto, addSiteDto, checkEmployeeInactivityDto, checkPositionInactivityDto, checkSiteInactivityDto, getRosterEmployeesDto, getRosterPositionsDto, getRosterSitesDto, getRosterTemplatesDto, HrmRosterEmployeesDto, HrmRosterPositionsDto, HrmRosterShiftsDto, HrmRosterSitesDto, HrmRosterTemplatesDto, updateRosterSitesDto } from '@flows/allDtos/hrmRoster.dto';
import { HrmRosterPositions } from '@flows/allEntities/hrmRoster.entity';

import * as ExcelJS from 'exceljs';
import { Response } from 'express';
  
  @Controller('rostering')
  export class RosterController {
    constructor(private readonly rosterService: RosterService) {}
  
    
    @Post('employees')
    async addEmployeeToRoster(@Request() req, @Param() params)
    : Promise<{ message: string, rosterEmployees: HrmRosterEmployeesDto[], }> 
    {
      try {
        return await this.rosterService.addEmployeeToRoster(req, params);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

    }

    
    @Get('employees')
    async getRosterEmployees(
      @Request() req, 
      @Query('companyId') companyId: string
      ):Promise<{ message: string, rosterEmployees: getRosterEmployeesDto[], }> {
      try {
        return await this.rosterService.getRosterEmployees(companyId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Put('employees')
    async updateRosterEmployee(@Request() req)
    :Promise<{ message: string, rosterEmployee: HrmRosterEmployeesDto, }>  {
      try {
        return await this.rosterService.updateRosterEmployee(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
    
    
    @Get('employees/check-inactivity')
    async checkEmployeeInactivity(
      @Query('id') id: string
      ):Promise<checkEmployeeInactivityDto> {
      try {
        return await this.rosterService.checkEmployeeInactivity(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Delete('employees')
    async deleteEmployee(@Query('id') id: string)
    :Promise<{
      message: string,
      rosterEmployee: HrmRosterEmployeesDto,
    }>{
      try {
        return await this.rosterService.deleteRosterEmployee(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Post('settings/sites')
    async addSite(@Request() req)
    :Promise<{
      message: string,
      rosterSite: addSiteDto
    }> {
      try {
        return await this.rosterService.addSite(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('settings/sites')
    async getRosterSites(@Request() req, @Query('companyId') companyId
      ):Promise<{
        message: string,
        rosterSites: getRosterSitesDto[]
      }> {
      try {
        return await this.rosterService.getRosterSites(companyId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Put('settings/sites')
    async updateRosterSite(@Request() req)
    :Promise<{
      message: string,
      rosterSite: updateRosterSitesDto
    }> {
      try {
        return await this.rosterService.updateRosterSite(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('settings/sites/check-inactivity')
    async checkSiteInactivity(
      @Query('id') id: string
      ):Promise<checkSiteInactivityDto> {
      try {
        return await this.rosterService.checkSiteInactivity(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Delete('settings/sites')
    async deleteSite(@Query('id') id: string)
    :Promise<{
      message: string,
      rosterSite: HrmRosterSitesDto,
    }>{
      try {
        return await this.rosterService.deleteRosterSite(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
   

    
    @Post('settings/positions')
    async addPosition(@Request() req)
    :Promise<{
     message: string,
     rosterPosition: addPositionDto,
    }> 
    {
      try {
        return await this.rosterService.addPosition(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('settings/positions')
    async getRosterPositions(@Request() req, @Query('companyId') companyId: string)
    :Promise<{
      message: string,
      rosterPositions: getRosterPositionsDto[]
    }> {
      try {
        return await this.rosterService.getRosterPositions(companyId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Put('settings/positions')
    async updateRosterPosition(@Request() req)
    :Promise<{
      message: string,
      rosterPosition: HrmRosterPositions,
    }> 
    {
      try {
        return await this.rosterService.updateRosterPosition(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('settings/positions/check-inactivity')
    async checkPositionInactivity(
      @Query('id') id: string
      ):Promise<checkPositionInactivityDto> {
      try {
        return await this.rosterService.checkPositionInactivity(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Delete('settings/positions')
    async deletePosition(@Query('id') id: string)
    :Promise<{
      message: string,
      rosterPosition: HrmRosterPositionsDto[],
    }>{
      try {
        return await this.rosterService.deleteRosterPosition(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }


    
    @Post('/shifts')
    async addShift(@Request() req)
    :Promise<{
      message: string,
      rosterShifts: HrmRosterShiftsDto[],
    }> {
      try {
        return await this.rosterService.addRosterShift(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('/shifts')
    async getShifts(
      @Request() req, 
      @Query('companyId') companyId: string,
      @Query('employeeId') employeeId: string,
      @Query('timePeriod') timePeriod: string,
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string
      )
      :Promise<{
        message: string,
        rosterShifts: HrmRosterShiftsDto[],
      }> {
      try {
        return await this.rosterService.getRosterShifts(companyId,employeeId,timePeriod,startDate,endDate);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Put('/shifts')
    async updateShift(@Request() req)
    :Promise<{
      message: string,
      rosterShift: HrmRosterShiftsDto,
    }> {
      try {
        return await this.rosterService.updateRosterShift(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Delete('/shifts')
    async deleteShift(@Query('id') id: string)
    :Promise<{
      message: string,
      rosterShift: HrmRosterShiftsDto,
    }> {
      try {
        return await this.rosterService.deleteRosterShift(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }



    
    @Post('/settings/templates')
    async addTemplate(@Request() req)
    :Promise<{
      message: string,
      rosterTemplate: HrmRosterTemplatesDto,
    }>  {
      try {
        return await this.rosterService.addRosterTemplate(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Get('/settings/templates')
    async getTemplates(
      @Query('companyId') companyId: string,
      @Query('id') id: string
      )
      :Promise<getRosterTemplatesDto>  {
      try {
        return await this.rosterService.getRosterTemplates(companyId,id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Put('/settings/templates')
    async updateTemplate(@Request() req)
    :Promise<{
      message: string,
      rosterTemplate: HrmRosterTemplatesDto,
    }>  {
      try {
        return await this.rosterService.updateRosterTemplate(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    
    @Delete('/settings/templates')
    async deleteTemplate(@Query('id') id: string)
    :Promise<{
      message: string,
      rosterTemplate: HrmRosterTemplatesDto[],
    }> {
      try {
        return await this.rosterService.deleteRosterTemplate(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }


    @Post('/import-template')
    async importTemplate(@Request() req) {
      try {
        return await this.rosterService.importTemplate(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }  
   
    
    @Post('/generate-template')
    async generateTemplate(@Request() req)
    :Promise<{
      shifts: {
        day: string,
        site: string,
        start: string,
        end: string,
        empId: string
      }[],
    }> {
      try {
        return await this.rosterService.generateRoster(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }




  

  @Get('export')
  async exportSchedule(
    @Query('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.rosterService.exportSchedule(companyId, startDate, endDate);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${result.filename}`,
      );
      
      // Converting to Buffer for response
      const buffer = Buffer.from(result.buffer);
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'An error occurred while exporting the schedule.' 
      });
    }
  }


  
  }
 