import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AbaFileService, Line, Company } from '../../aba-file/service/abaFile.service';
import { CombankFileInput, CombankFileService } from '../service/combankFile.service';

@Controller('aba')
export class AbaFileController {
  constructor(private readonly abaFileService: AbaFileService) {}

  @Post('generate')
  generateAbaFile(@Body() data: AbaFileInput, @Res() res: Response): void {
    const abaFileContent = this.abaFileService.generateAbaFile(data);
    const fileName = `ABA_File_${new Date().toISOString().slice(0,10)}.aba`;

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    res.send(Buffer.from(abaFileContent, 'utf-8'));
  }
}

@Controller('combank')
export class CombankFileController {
  constructor(private readonly combankFileService: CombankFileService) {}

  @Post('generate')
  generateCombankFile(@Body() data: CombankFileInput, @Res() res: Response): void {
    const combankFileContent = this.combankFileService.generateCombankFile(data);
    const fileName = `COMBANK_File_${new Date().toISOString().slice(0,10)}.txt`;

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    res.send(Buffer.from(combankFileContent, 'utf-8'));
  }
}
  
  export interface AbaFileInput {
    company: Company;
    lines: Line[];
    validUntil: string;
    totalCredit: number;
    totalDebit: number;
    netTotal: number;
  }