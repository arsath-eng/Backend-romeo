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
import { AnnouncementsService } from '../service/announcements.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}
  @HttpCode(200)
  @Post(':companyId/announcement')
  async postAnnouncements(@Body() body,   @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.announcementsService.postAnnouncements(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/announcement')
  async getAnnouncements(@Param('companyId') companyId: string,) {
    try {
      return await this.announcementsService.getAnnouncements(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('announcement/:id')
  async getAnnouncementsById(@Param('id') id: string) {
    try {
      return await this.announcementsService.getAnnouncementsById(id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('announcement/:id')
  async putAnnouncementsById(
    @Param('id') id: string,
    @Body() body: Body,
    @Request() req 
  ) {
    try {
      return await this.announcementsService.putAnnouncementsById(id, body, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('announcement/:id')
  async deleteAnnouncementsById(@Param('id') id: string,  ) {
    try {
      await this.announcementsService.deleteAnnouncementsById(id);
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
}
