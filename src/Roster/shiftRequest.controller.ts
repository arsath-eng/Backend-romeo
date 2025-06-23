import {
    Controller,
    Delete,
    Get,
 
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
    Res,
    Body,
    Req,
  } from '@nestjs/common';


import { HrmShiftRequestsService } from './shiftRequest.service';
import { RequestContext } from '@hubspot/api-client/lib/codegen/cms/blogs/blog_posts';
@Controller()
  
  export class ShiftRequestController {
    constructor(
     
      private readonly shiftRequestService:HrmShiftRequestsService
    ) {}


    @Post('shifts/requests')
    async createShiftRequest(@Req() req)
     {
      try {
        return await this.shiftRequestService.createShiftRequest(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  
    @Get('shifts/requests')
    async findAllrequests(
      @Query('companyId') companyId: string,
      @Query('employeeId') employeeId?: string,
      @Query('status') status?: string,
      @Query('id') id?: string
   
    )
      {
          const requests = await this.shiftRequestService.getShiftRequests(companyId, employeeId,status ,id);
          return { requests };
      }
  
      @Put('shifts/requests')
      async updateRequest(@Req() req) {
        
        const result = await this.shiftRequestService.updateShiftRequest(req.body);
        return { message: 'Shift request updated successfully', data: result };
      }
  
}