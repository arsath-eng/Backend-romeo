import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { NotesDto } from '../dto/notes.dto';
import { HrmNotes } from '@flows/allEntities/notes.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(HrmNotes)
    private notesRepository: Repository<HrmNotes>,
  ) {}

  async postNotes(notes: NotesDto,  companyId: string) {
    try {
      const employeeId = notes.employeeId;
      const senderId = notes.senderId;
      const senderName = notes.senderName;
      const note = notes.note;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newnote = this.notesRepository.create({
        employeeId,
        senderId,
        senderName,
        note,
        createdAt,
        modifiedAt,
        companyId
      });
      return await this.notesRepository.save(newnote);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getNotes( companyId: string) {
    try {
      const notes = await this.notesRepository.find({where: { companyId: companyId }});
       return (notes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getNotesById(id: string     ) {
    try {
      const notes = await this.notesRepository.find({
        where: { employeeId: id },
      });
       return (notes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putNotesById(
    id: string,
    body: Body,
      
  ) {
    try {
      const newNote = await this.notesRepository.findOneOrFail({
        where: { id: id },
      });
      if (body.hasOwnProperty('note')) {
        newNote.note = body['note'];
      }
      if (body.hasOwnProperty('senderId')) {
        newNote.senderId = body['senderId'];
      }
      newNote.modifiedAt = new Date(Date.now());
      return await this.notesRepository.save(newNote);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteNoteById(id: string     ) {
    try {
      const note = await this.notesRepository.findOneOrFail({
        where: { id: id },
      });
      await this.notesRepository.remove(note);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
