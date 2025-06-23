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
import { NotesService } from '../service/notes.service';
import { Response } from 'express';

import { NotesDto } from '../dto/notes.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  @HttpCode(200)
  @Post(':companyId/notes')
  async postNotes(
    @Body() notes: NotesDto,
     
    @Request() req,
    @Param('companyId') companyId: string

  ) {
    try {
      return await this.notesService.postNotes(notes,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/notes')
  async getNotes( @Param('companyId') companyId: string
  ) {
    try {
      return await this.notesService.getNotes(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('notes/:id')
  async getNotesById(@Param('id') id: string,  ) {
    try {
      return await this.notesService.getNotesById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('notes/:id')
  async putNotesById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.notesService.putNotesById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('notes/:id')
  async deleteNoteById(@Param('id') id: string,  ) {
    try {
      await this.notesService.deleteNoteById(id  );
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
