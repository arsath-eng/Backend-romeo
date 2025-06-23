/* import { AuthGuard } from '@nestjs/passport';
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
} from '@nestjs/common';
import { CandidatesService } from '../service/candidates.services';

@Controller()
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @HttpCode(200)
  @Post(':companyId/hiring/candidates')
  async postCandidates(
    @Body() application,
     
    @Request() req,
    @Param('companyId') companyId: string
  ) {
    try {
      return await this.candidatesService.postCandidates(application,companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get(':companyId/hiring/candidates')
  async getCandidates(@Param('companyId') companyId: string) {
    try {
      return await this.candidatesService.getCandidates(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('hiring/candidates/:id')
  async getCandidatesById(@Param('id') id: string) {
    try {
      return await this.candidatesService.getCandidatesById(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Get('hiring/candidates/job-openings/:id')
  async getCandidatesOfJobOpeningById(
    @Param('id') id: string,
  ) {
    try {
      return await this.candidatesService.getCandidatesOfJobOpeningById(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('hiring/candidates/:id')
  async putCandidatesById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.candidatesService.putCandidatesById(id, body);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('hiring/candidates')
  async putCandidatesByIdBulk(@Body() body: Body,  ) {
    try {
      return await this.candidatesService.putCandidatesByIdBulk(body);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('hiring/candidates/job-opening/move/:id')
  async putCandidatesJobOpeningById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.candidatesService.putCandidatesJobOpeningById(id, body);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Put('hiring/candidates/job-opening/move')
  async putCandidatesJobOpeningByIdBulk(
    @Body() body: Body,
     
  ) {
    try {
      return await this.candidatesService.putCandidatesJobOpeningByIdBulk(body);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Delete('hiring/candidates/:id')
  async deleteCandidateById(@Param('id') id: string,  ) {
    try {
      await this.candidatesService.deleteCandidateById(id);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  
  @Delete('hiring/candidates')
  async deleteCandidateByIdBulk(@Body() body: Body,  ) {
    try {
      await this.candidatesService.deleteCandidateByIdBulk(body);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
 */