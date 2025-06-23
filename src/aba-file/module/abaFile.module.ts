import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbaFileController } from '../controller/abaFile.controller';
import { AbaFileService } from '../service/abaFile.service';
import { CombankFileController } from '../controller/abaFile.controller';
import { CombankFileService } from '../service/combankFile.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          
        ]),
        
      ],
      controllers: [AbaFileController, CombankFileController],
      providers: [AbaFileService, CombankFileService],
      exports: [],
})
export class AbaFileModule {}
