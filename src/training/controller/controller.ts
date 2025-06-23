/* import {
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
import { TrainingService } from '../service/service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @HttpCode(200)
  @Post(':companyId/training')
  async postTraining(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.trainingService.postTraining(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/training')
  async getTraining( @Param('companyId') companyId: string) {
    try {
      return await this.trainingService.getTraining(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/training/employee/:id')
  async getTrainingByEmployeeId( @Param('id') id: string,@Param('companyId') companyId: string) {
    try {
      return await this.trainingService.getTrainingByEmployeeId(  id,companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('training/:id')
  async putTrainingById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.trainingService.putTrainingById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('training/:id')
  async deleteTrainingById(@Param('id') id: string,  ) {
    try {
      await this.trainingService.deleteTrainingById(id  );
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
  @Post(':companyId/training-category')
  async postTrainingCategory(  @Request() req,@Param('companyId') companyId: string) {
    try {
      return await this.trainingService.postTrainingCategory(req,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/training-category')
  async getTrainingCategory( @Param('companyId') companyId: string) {
    try {
      return await this.trainingService.getTrainingCategory(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('training-category/:id')
  async getTrainingCategoryById( @Param('id') id: string) {
    try {
      return await this.trainingService.getTrainingCategoryById(  id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('training-category/:id')
  async putTrainingCategoryById(
    @Param('id') id: string,
    @Request() req,
     
  ) {
    try {
      return await this.trainingService.putTrainingCategoryById(id, req  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('training-category/:id')
  async deleteTrainingCategoryById(@Param('id') id: string,  ) {
    try {
      await this.trainingService.deleteTrainingCategoryById(id  );
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
 */