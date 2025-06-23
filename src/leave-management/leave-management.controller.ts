import { Body, Controller, Delete, Get, Post, Put, Query, Request } from '@nestjs/common';
import { LeaveManagementService } from './leave-management.service';
import { postTimelineDto } from '@flows/allDtos/leaveManagement.dto.';

@Controller()
export class LeaveManagementController {
    constructor(
        private readonly leaveManagementService: LeaveManagementService
    ) {}

    @Post('leaves/categories')
    async postLeaveCategories(
      @Request() req,
    )
    //: Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.postLeaveCategory(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Get('leaves/categories?')
    async getLeaveCategories( 
        @Query('companyId') companyId: string,
        @Query('all') all?: boolean,
        @Query('id') id?: string,
    )
    //: Promise<getTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.getLeaveCategory(companyId, all, id);
      } catch (error) {
        console.log(error);
      }
    }  
    @Put('leaves/categories')
    async putLeaveCategories(
      @Request() req,
    )
    //: Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.putLeaveCategory(req);
      } catch (error) {
        console.log(error);
      }
    } 
    @Delete('leaves/categories?')
    async deleteLeaveCategories(
        @Query('categoryId') categoryId: string,
        @Query('companyId') companyId?: boolean,
    )
    //: Promise<deleteTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.deleteLeaveCategory(categoryId);
      } catch (error) {
        console.log(error);
      }
    }


    @Get('leaves/histories?')
    async getLeaveHistory( 
        @Query('employeeId') employeeId: string,
        @Query('categoryId') categoryId?: string,
    )
    //: Promise<getTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.getLeaveHistory(employeeId, categoryId);
      } catch (error) {
        console.log(error);
      }
    }  
    @Get('leaves/requests?')
    async getLeaveRequest( 
        @Query('companyId') companyId: string,
        @Query('all') all?: boolean,
        @Query('id') id?: string,
        @Query('employeeId') employeeId?: string,
    )
    //: Promise<getTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.getLeaveRequest(companyId, all, id, employeeId);
      } catch (error) {
        console.log(error);
      }
    }  
    @Post('leaves/requests')
    async postLeaveRequest(
      @Request() req,
    )
    //: Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.postLeaveRequest(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Put('leaves/requests')
    async putLeaveRequest(
      @Request() req,
    )
    //: Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.putLeaveRequest(req);
      } catch (error) {
        console.log(error);
      }
    }
    @Put('leaves/balances')
    async putLeaveBalance(
      @Request() req,
    )
    //: Promise<postTimesheetTemplatesDto> 
    {
      try {
        return await this.leaveManagementService.putLeaveBalance(req)
      } catch (error) {
        console.log(error);
      }
    } 

    @Post('employees/timeline')
    async postTimeline( 
        @Body() body: postTimelineDto,
    )
    {
      try {
        return await this.leaveManagementService.postTimeline(body);
      } catch (error) {
        console.log(error);
      }
    }  
    
}
