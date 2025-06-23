import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotesController } from '../controller/notes.controller';
import { NotesService } from '../service/notes.service';
import { HrmNotes } from '@flows/allEntities/notes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrmNotes]), ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [],
})
export class NotesModule {}
