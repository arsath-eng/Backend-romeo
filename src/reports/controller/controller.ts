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
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ReportsService } from '../service/service';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from '../../company/service/company.service';

@Controller()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly CompanyService: CompanyService,
    ) {}

  @HttpCode(200)
  @Post(':companyId/generate-reports')
  async generateReports(  @Request() req,@Param('companyId') companyId: string) {
    try {
      await this.reportsService.deleteReportsByCompanyId(companyId,    req);
      const dummyData = await this.CompanyService.getDummyJsondata("ReportsData");
      return await this.CompanyService.postReports(companyId,dummyData);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post(':companyId/reports')
  async postReports(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.reportsService.postReports(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Get(':companyId/get-reports')
  async getReports(  @Request() req,@Param('companyId') companyId: string) {
    try {
      const response = await this.reportsService.getReports(   req,companyId);
      return response
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    } 
  }

  @Get(':companyId/report-list')
  async getReportList(@Request() req,@Param('companyId') companyId: string) {
    try {
      const response = await this.reportsService.getReportList(req,companyId);
      return response
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @HttpCode(201)
  @Get('get-reports/:id?')
  async getReportsById(
    @Param('id') id: string,
    @Query('list') plist: any,
    @Request() req,
  ) {
    try {
      let list = [];
      if (plist) {
        list = plist
      }
     
      let report = await this.reportsService.getReportsById(id, req, list);
      return report;
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('reports/:id')
  async putReportsById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.reportsService.putReportsById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('reports/manage-reports/change')
  async putBulkReportsById(
    @Request() req,
     
  ) {
    try {
      return await this.reportsService.putBulkReportsById(req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('reports/:id')
  async deleteReportsById(@Param('id') id: string,  @Request() req) {
    try {
      await this.reportsService.deleteReportsById(id,    req);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('reports/manage-reports/delete')
  async deleteBulkReportsById( @Request() req) {
    try {
      return await this.reportsService.deleteBulkReportsById(req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post(':companyId/reports-folders')
  async postFolders(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.reportsService.postFolders(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/reports-folders')
  async getFolders(@Param('companyId') companyId: string) {
    try {
      const response = await this.reportsService.getFolders(companyId);
      return response;
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('reports-folders/:id')
  async putCommentById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.reportsService.putFolderById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('reports-folders/:id')
  async deleteFolderById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      await this.reportsService.deleteFolderById(id);
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
  @Post(':companyId/access-levels/reports/employees')
  async postAccessLevels(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.reportsService.postAccessLevels(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/access-levels/reports/employees')
  async getAccessLevels(@Param('companyId') companyId: string) {
    try {
      const response = await this.reportsService.getAccessLevels(companyId);
      return response
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('access-levels/reports/employees/:id')
  async putAccessLevels(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.reportsService.putAccessLevels(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
