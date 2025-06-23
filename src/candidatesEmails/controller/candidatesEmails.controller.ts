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
import { CandidatesEmailsService } from '../service/candidatesHistory.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CandidatesEmailsController {
  constructor(
    private readonly candidatesEmailsService: CandidatesEmailsService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/hiring/candidates/emails')
  async postCandidatesEmails(  @Request() req,@Param('companyId') companyId: string
  ) {
    try {
      return await this.candidatesEmailsService.postCandidatesEmails(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/hiring/emails/candidates')
  async getCandidatesEmails(@Param('companyId') companyId: string
  ) {
    try {
      return await this.candidatesEmailsService.getCandidatesEmails(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('hiring/candidates/:id/emails')
  async getCandidatesEmailsByCandidateId(@Param('id') id: string) {
    try {
      return await this.candidatesEmailsService.getCandidatesEmailsByCandidateId(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
 */