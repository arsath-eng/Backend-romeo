/* import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { CandidatesHistoryService } from '../service/candidatesHistory.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CandidatesHistoryController {
  constructor(
    private readonly candidatesHistoryService: CandidatesHistoryService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/hiring/history/candidates')
  async postHistory(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.candidatesHistoryService.postHistory(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/hiring/history/candidates')
  async getHistory(@Param('companyId') companyId: string) {
    try {
      return await this.candidatesHistoryService.getHistory(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('hiring/history/candidates/:id')
  async getHistoryByCandidateId(@Param('id') id: string) {
    try {
      return await this.candidatesHistoryService.getHistoryByCandidateId(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
 */