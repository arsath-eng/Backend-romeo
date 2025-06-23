import { Controller, Post, Get, Put, Delete, Query, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { onboardingTaskService } from '../service/onboardingTask.service';

@Controller('onboardingTasks')
export class OnboardingTaskController {
  constructor(private readonly onboardingTaskService: onboardingTaskService) {}

  @Post('tasks')
  async createOnboardingTask(
    @Body() body: any,
    @Req() req,
) {
    try{
        return this.onboardingTaskService.createOnboardingTask(req, body);
    }catch(error){
        console.error(error);
        throw new HttpException('Error creating onboarding Tasks!', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Get('tasks')
  async getOnboardingTasks(
    @Query('companyId') companyId: string,
    @Query('id') id?: string,
  ) {
    try{
        return this.onboardingTaskService.getOnboardingTasks(companyId, id);
    }catch(error){
        console.error(error);
        throw new HttpException('Error getting onboarding Tasks!', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Put('tasks')
  async updateOnboardingTask(
    @Query('id') id: string,
    @Req() req,
  ) {
    try{
        return this.onboardingTaskService.updateOnboardingTask(id, req);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating onboarding Tasks!', HttpStatus.BAD_REQUEST)
    }
   
  }

  @Delete('tasks')
  async deleteOnboardingTask(@Query('id') id: string) {
    try{
        return this.onboardingTaskService.deleteOnboardingTask(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting onboarding Tasks!', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Post('tasks/submit')
  async submitOnboardingAnswers(
    @Req() req,
    @Body('onboardingTaskId') onboardingTaskId: string,
    @Body('employeeId') employeeId: string,
    @Body('status') status: string,
    @Body('answers') answers: any[],
    @Body('adminAction') adminAction?: string,
) {
    return this.onboardingTaskService.submitOnboardingAnswers(req, onboardingTaskId, employeeId, answers,status,adminAction);
}

}
