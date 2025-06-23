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
import { TrainingCompleteService } from '../service/trainingComplete.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class TrainingCompleteController {
  constructor(private readonly trainingCompleteService: TrainingCompleteService) {}
  @HttpCode(200)
  @Post(':companyId/training-complete')
  async postTrainingComplete(@Body() body,   @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.trainingCompleteService.postTrainingComplete(body,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/training-complete')
  async getTrainingComplete( @Param('companyId') companyId: string) {
    try {
      return await this.trainingCompleteService.getTrainingComplete(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('training-complete/employee/:id')
  async getTrainingCompleteByEmployeeId(@Param('id') id: string,  ) {
    try {
      return await this.trainingCompleteService.getTrainingCompleteByEmployeeId(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('training-complete/:id')
  async putTrainingCompleteById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.trainingCompleteService.putTrainingCompleteById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('training-complete/:id')
  async deleteTrainingCompleteById(@Param('id') id: string,  ) {
    try {
      await this.trainingCompleteService.deleteTrainingCompleteById(id);
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
