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
import { CandidatesCommentsService } from '../service/candidatesComments.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CandidatesCommentsController {
  constructor(
    private readonly candidatesCommentsService: CandidatesCommentsService,
  ) {}

  @HttpCode(200)
  @Post(':companyId/hiring/comments/candidates')
  async postcomments(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.candidatesCommentsService.postcomments(req,   companyId);

    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  

  @Get('hiring/comments/candidates/:id')
  async getCommentsByCandidateId(
    @Param('id') id: string,
  ) {
    try {
      return await this.candidatesCommentsService.getCommentsByCandidateId(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('hiring/comments/candidates/:id')
  async putCommentById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.candidatesCommentsService.putCommentById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('hiring/comments/candidates/:candidateId/:id')
  async deleteCommentById(@Param('id') id: string,@Param('candidateId') candidateId: string ) {
    try {
      await this.candidatesCommentsService.deleteCommentById(candidateId,id  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  // 
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  @HttpCode(200)
  @Post('hiring/comments/candidates/reply/:id')
  async postReplies(
     
    @Request() req,
    @Param('id') id: string,
  ) {
    try {
      return await this.candidatesCommentsService.postReplies(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('hiring/comments/candidates/reply/:id')
  async putReplyById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.candidatesCommentsService.putReplyById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('hiring/comments/candidates/reply/:candidateId/:id')
  async deleteReplyById(@Param('id') id: string,@Param('candidateId') candidateId:string  ) {
    try {
      await this.candidatesCommentsService.deleteReplyById(candidateId ,id);
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
