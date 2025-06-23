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
    UseInterceptors,
    UploadedFiles,
    Headers
  } from '@nestjs/common';
  
  import {
    AnyFilesInterceptor,
    FilesInterceptor,
  } from '@nestjs/platform-express';
import { Response } from 'express';
import { OfferLetterService } from '../service/offer-letter.service';
import { AuthGuard } from '@nestjs/passport';
@Controller()
export class OfferLetterController {
    constructor (private readonly OfferLetterService: OfferLetterService) {}
    
    @Get('offer-letter-docs/:id')
    async getOfferLetterDocsById(  @Request() req, @Param('id') id: string) {
      try {
        return await this.OfferLetterService.getOfferLetterDocsById(  req,id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get('offer-letter/:id')
    async getOfferLetter(  @Request() req, @Param('id') id: string) {
      try {
        return await this.OfferLetterService.getOfferLetter(  req,id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @Get('candidate-offer-letter/:id')
    async getOfferLetterCandidate(  @Request() req, @Param('id') id: string) {
      try {
        return await this.OfferLetterService.getOfferLetterCandidate(  req,id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @HttpCode(200)
    @Post('offer-letter')
    async postOfferLetter(  @Request() req) {
      try {
        return await this.OfferLetterService.postOfferLetter(  req);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Put('offer-letter/:id')
    async putOfferLetter(  @Request() req, @Param('id') id: string) {
      try {
        return await this.OfferLetterService.putOfferLetter(  req,id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @Put('revise-offer-letter/:id')
    async putOfferLetterRevised(  @Request() req, @Param('id') id: string) {
      try {
        return await this.OfferLetterService.putOfferLetterRevised(  req,id);
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @Delete('offer-letter/:id')
    async deleteOfferLetter(  @Request() req, @Param('id') id: string) {
      try {
        await this.OfferLetterService.deleteOfferLetter(  req,id);

          return {
          statusCode: 200,
          description: 'success',
        };
      } catch (error) {
        console.log(error);
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    
    @HttpCode(200)
    @Post('offer-letter/upload')
    @UseInterceptors(
      FilesInterceptor('files', 10),
    )
    async uploadOfferLetter(
        @UploadedFiles() files: Express.Multer.File,
        @Headers() req,
         
      ) {
        try {
          return await this.OfferLetterService.postDuplicateOfferLetter(files, req);
        } catch (error) {
          console.log(error);
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));
        }
    }
}
