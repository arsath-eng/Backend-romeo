import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Query,
  Post,
  Put,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SurveyService } from '../service/survey.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @HttpCode(200)
  @Post('questionnaires')
  async postSurveyQuestionnaires(
    @Req() Req,
    @Body() body: Body,
  ): Promise<{id: string}> {
    try {
      return await this.surveyService.postSurveyQuestionnair(body);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('questionnaires')
  async getSurveyQuestionnaires(
    @Query('companyId') companyId: string,
    @Query('id') id: string,
    @Query('all') all: boolean,
    @Query('start') start?: number,
    @Query('end') end?: number,
  ) {
    try {
      return await this.surveyService.getSurveyQuestionnaires(
        companyId,
        id,
        all,
        start,
        end,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Put('questionnaires')
  async putSurveyQuestionnaires(@Body() body: Body, @Query('id') id: string) {
    try {
      return await this.surveyService.putSurveyQuestionnaires(body, id);
    } catch (error) {
      console.log(error);
    }
  }

  @Delete('questionnaires')
  async deleteSurveyQuestionnaires(@Query('id') id: string) {
    try {
      return await this.surveyService.deleteSurveyQuestionnaires(id);
    } catch (error) {
      console.log(error);
    }
  }

  @Post('surveys')
  async postSurveySurveys(@Req() req) {
    try {
      return await this.surveyService.postSurveys(req);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('surveys')
  async getSurveySurveys(
    @Query('companyId') companyId,
    @Query('id') id: string,
    @Query('all') all: string,
    @Query('start') start: number,
    @Query('end') end: number,
    @Query('status') status: string,
    @Query('employeeId') employeeId: string,
    @Query('response') response: string,
  ) {
    try {
      return await this.surveyService.getSurveys(
        companyId,
        id,
        all,
        start,
        end,
        status,
        employeeId,
        response,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Put('surveys')
  async putSurveySurveys(@Req() req, @Query('id') id: string) {
    try {
      return await this.surveyService.putSurveys(req, id);
    } catch (error) {
      console.log(error);
    }
  }

  @Delete('surveys')
  async deleteSurveySurveys(@Query('id') id: string) {
    try {
      return await this.surveyService.deleteSurveys(id);
    } catch (error) {
      console.log(error);
    }
  }

  @Post('surveys/submit')
  async postSurveyResonses(@Body() body: Body) {
    try {
      return await this.surveyService.postSurveyResponses(body);
    } catch (error) {
      console.log(error);
    }
  }

  @Post('generate-surveys')
    async generateSurveys(@Req() req)
     {
      try {
        return await this.surveyService.generateSurveys(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
}
