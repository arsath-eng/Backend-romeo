import { Controller, Get, Res, Post, Query, Body, Req, Param } from '@nestjs/common';
import { Response } from 'express';
import { ZipService } from './zip.service';

@Controller()
export class ZipController {
    constructor(private readonly ZipService: ZipService) {}

    @Post('/:companyId/generate-zip/files')
    async generateZip(@Res() res: Response, @Param('companyId') companyId: string,@Req() req:any) {
      await this.ZipService.generateZip(req.body['fileIdArray'], companyId);
      res.download('files.zip');
    }
}
