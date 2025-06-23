import { Controller, Post, Get, Put, Delete, Param, Body, Query, HttpException, HttpStatus, Req } from '@nestjs/common';
import { TrainingCategoryService } from '../service/trainingCategories.service';
import { TrainingTemplateService } from '../service/trainingTemplate.service';
import { TrainingService } from '../service/training.service';

@Controller()
export class TrainingController {
  constructor(
    private readonly trainingCatorgoriesService: TrainingCategoryService,
    private readonly trainingTemplateService: TrainingTemplateService,
    private readonly trainingService:TrainingService


) {}

  @Post('training/catorgories')
  async createTrainingCatorgories(
    @Body() body: any
) {
    return this.trainingCatorgoriesService.createTrainingCategory(body);
  }


  @Get('training/catorgories')
  async getAllTranings(
  @Query('companyId') companyId?: string,
  @Query('id') id?: string,
) {
  try{
  }catch(error){
      console.log(error)
      throw new HttpException('error',HttpStatus.BAD_REQUEST)
  }
  return await this.trainingCatorgoriesService.getTrainingCategories(companyId,id);
}

@Put('training/catorgories')
  async updateTrainingcatorgory(
    @Query('id') id: string,
    @Body() body: any,
  ) {
    try{
        return this.trainingCatorgoriesService.updateTrainingcatorgory(id, body);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating Training catorgory!', HttpStatus.BAD_REQUEST)
    }
   
  }

  @Delete('training/catorgories')
  async deleteTrainingcatorgory(
    @Query('id') id: string
) {
    try{
        return this.trainingCatorgoriesService.deletetrainingCategory(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting Training catorgory!', HttpStatus.BAD_REQUEST)
    }
    
  }



  /*================ traning template=========== */

  
    @Post('/training/templates')
    async createTemplate(@Body() body: any) {

        try{
            return this.trainingTemplateService.createTemplate(body);
        }catch(error){
            console.error(error)
            throw new HttpException('Error deleting Training catorgory!', HttpStatus.BAD_REQUEST)
        }
      
    }

    @Get('training/templates')
    async getTraningTemplate(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
    ) {
    try{
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    return await this.trainingTemplateService.getTraningTemplate(companyId,id);
    }


    @Put('training/templates')
    async updateTrainingTemplate(
        @Query('id') id: string,
        @Body() body: any,
    ) {
        try{
            return this.trainingTemplateService.updateTrainingTemplate(id, body);
        }catch(error){
            console.error(error);
            throw new HttpException('Error updating Training Template!', HttpStatus.BAD_REQUEST)
        }
    
    }

  @Delete('training/templates')
  async deletetrainingTemplate(
    @Query('id') id: string
) {
    try{
        return this.trainingTemplateService.deletetrainingTemplate(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting Training Template!', HttpStatus.BAD_REQUEST)
    }
    
  }


  /* training */



  @Post('trainings')
  async createTraining(
    @Req() req
) {
    try{
        return this.trainingService.createTraining(req);
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
      }
    
  }


@Get('trainings')
async getTraning(
  @Query('companyId') companyId?: string,
  @Query('id') id?: string,
  @Query('employeeId') employeeId?:string,
  ) {
  try{
    return await this.trainingService.getTraining(companyId,id,employeeId);
  }catch(error){
    console.log(error)
    throw new HttpException('error',HttpStatus.BAD_REQUEST)
  }
 
  }


@Put('trainings')
async updateTraining(
    @Query('id') id: string,
    @Req() req: any,
) {
    try{
        return this.trainingService.updateTraining(id, req);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating Training Template!', HttpStatus.BAD_REQUEST)
    }
  
  }

@Delete('trainings')
async deletetraining(
  @Query('id') id: string
) {
  try{
    return this.trainingService.deletetraining(id);
  }catch(error){
    console.error(error)
    throw new HttpException('Error deleting Training Template!', HttpStatus.BAD_REQUEST)
  }
  
}


@Put('training/submissions')
async updateTrainingResponse(
    @Query('id') trainingId: string,
    @Body() body: any,
  ) {
    try {
      return await this.trainingService.updateTrainingResponse(body.trainingId, body);
    } catch (error) {
      console.error(error);
      throw new HttpException('Error updating training response',HttpStatus.BAD_REQUEST);
    }
  }

  @Get('training/courses')
  async searchCourses(
    @Query('search') search?: string,
    @Query('page') page?: number, 
    @Query('courseId') courseId?: string
) {
    /* if (!search ) {
      throw new HttpException('Query parameter is required',HttpStatus.BAD_REQUEST,
      );
    } */
    try {
        const pageNumber = page ? parseInt(page as any, 10) : 1;
        const result = await this.trainingService.searchUdemyCourses(search, pageNumber,courseId);
        return result;
    } catch (error) {
      throw new HttpException(`Failed to search courses: ${error.message}`,HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}