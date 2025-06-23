import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, Request, Query, Headers, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimeTrackingService } from './time-tracking.service';
import { deleteEntriesResponseDto, deleteProjectsResponseDto, deleteTimesheetTemplatesDto, entriesResponseDto, getEntriesResponseDto, getProjectsResponseDto, getTimesheetTemplatesDto, postTimesheetTemplatesDto, projectsResponseDto, putProjectCommonDto } from '@flows/allDtos/time-tracking.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';


@Controller()
@ApiTags('TimeSheet')
export class TimeTrackingController {
    constructor(private readonly timeTrackingService: TimeTrackingService) {}

    @Get(':companyId/activity-tracking')
    async getActivityTracking(@Param('companyId') companyId: string) {
      try {
        return await this.timeTrackingService.getActivityTracking(  companyId);
        
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }

    @Post('timesheet/projects')
    async postProjectsTime(
      @Request() req,
  
    ): Promise<projectsResponseDto> {
      try {
        return await this.timeTrackingService.postProjectsTime(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Get(':companyId/timesheet/projects?')
    async getProjectsTime( 
        @Param('companyId') companyId: string,
        @Query('all') all?: boolean,
        @Query('id') id?: string,
        @Query('employeeId') employeeId?: string,
    ): Promise<getProjectsResponseDto> {
      try {
        return await this.timeTrackingService.getProjectsTime(id, companyId,employeeId);
      } catch (error) {
        console.log(error);
      }
    }  
    @Put('timesheet/projects/:id')
    async putProjectsTime(
      @Param('id') id: string,
      @Request() req,
    ): Promise<projectsResponseDto> {
      try {
        return await this.timeTrackingService.putProjectsTime(req, id);
      } catch (error) {
        console.log(error);
      }
    } 
    @Delete('timesheet/projects/:id')
    async deleteProjectsTime(
      @Param('id') id: string  
    ): Promise<deleteProjectsResponseDto> {
      try {
        return await this.timeTrackingService.deleteProjectsTime(id);
      } catch (error) {
        console.log(error);
      }
    }

    @Post('timesheet/entry')
    async postProjectsTimeEntries(
      @Request() req,
    ): Promise<entriesResponseDto> {
      try {
        return await this.timeTrackingService.postProjectsTimeEntries(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Get(':companyId/timesheet/entry?')
    async getProjectsTimeEntries( 
      @Request() req,
        @Param('companyId') companyId: string,
        @Query('all') all?: boolean,
        @Query('id') id?: string,
        @Query('filter_by') filter_by?: string,
        @Query('date_from') date_from?: string,
        @Query('date_to') date_to?: string,
        @Query('type') type?: string,
        @Query('employeeId') employeeId?: string,
    ): Promise<getEntriesResponseDto> {
      try {
        return await this.timeTrackingService.getProjectsTimeEntries(id, companyId, filter_by, date_from, date_to, type, req, employeeId);
      } catch (error) {
        console.log(error);
      }
    }  
    @Put('timesheet/entry/:id')
    async putProjectsTimeEntries(
      @Param('id') id: string,
      @Request() req,
    ): Promise<entriesResponseDto> {
      try {
        return await this.timeTrackingService.putProjectsTimeEntries(req, id);
      } catch (error) {
        console.log(error);
      }
    } 
    @Delete('timesheet/entry/:id?')
    async deleteProjectsTimeEntries(
      @Param('id') id: string,
      @Query('notificationId') notificationId?: string, 
    ): Promise<deleteEntriesResponseDto> {
      try {
        return await this.timeTrackingService.deleteProjectsTimeEntries(id, notificationId);
      } catch (error) {
        console.log(error);
      }
    }

    @Get(':companyId/timesheet/entry/me')
    async getProjectsTimeEntryMe( 
        @Param('companyId') companyId: string,
        @Headers() headers
    ): Promise<getEntriesResponseDto> {
      try {
        console.log(headers['userid']);
        
        return await this.timeTrackingService.getProjectsTimeEntryMe(companyId, headers['userid']);
      } catch (error) {
        console.log(error);
      }
    }  

    @Post('timesheet/templates')
    async postTimesheetTemplates(
      @Request() req,
    )
    : Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.timeTrackingService.postTimesheetTemplates(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Get(':companyId/timesheet/templates?')
    async getTimesheetTemplates( 
        @Param('companyId') companyId: string,
        @Query('all') all?: boolean,
        @Query('id') id?: string,
        @Query('type') type?: string,
    )
    //: Promise<getTimesheetTemplatesDto> 
    {
      try {
        return await this.timeTrackingService.getTimesheetTemplates(id, companyId, type);
      } catch (error) {
        console.log(error);
      }
    }  
    @Put('timesheet/templates/:id')
    async putTimesheetTemplates(
      @Param('id') id: string,
      @Request() req,
    )
    : Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.timeTrackingService.putTimesheetTemplates(req, id);
      } catch (error) {
        console.log(error);
      }
    } 
    @Delete('timesheet/templates/:id')
    async deleteTimesheetTemplates(
      @Param('id') id: string  
    )
    : Promise<deleteTimesheetTemplatesDto> 
    {
      try {
        return await this.timeTrackingService.deleteTimesheetTemplates(id);
      } catch (error) {
        console.log(error);
      }
    }
    @Post('timesheet/export')
    async exportTemplate(
      @Request() req,
      @Res() res: Response
  
    )
    //: Promise<entriesResponseDto> 
    {
      try {
        return await this.timeTrackingService.exportTemplate(req, res);
      } catch (error) {
        console.log(error);
      }
    }
    @Put('timesheet/project-common')
    async putProjectCommon(
      @Request() req,
    )
    : Promise<putProjectCommonDto> 
    {
      try {
        return await this.timeTrackingService.putProjectCommon(req);
      } catch (error) {
        console.log(error);
      }
    }
}
