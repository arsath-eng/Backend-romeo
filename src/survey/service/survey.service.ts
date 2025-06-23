import { hrmSurveyQuestionnaires } from '@flows/allEntities/hrmSurveyQuestionnaires.entity';
import { hrmSurveySurveys } from '@flows/allEntities/hrmSurveySurveys.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {Request} from 'express';
import { NotificationService } from '@flows/notifications/service/notifications.service';
const axios = require('axios')
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SurveyService {
  private readonly API;
  constructor(
    @InjectRepository(hrmSurveyQuestionnaires)
    private readonly surveyQuestionnairesRepository: Repository<hrmSurveyQuestionnaires>,
    @InjectRepository(hrmSurveySurveys)
    private readonly surveyRepository: Repository<hrmSurveySurveys>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {
    this.API = axios.create({
      baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
    })
  }

  async postSurveyQuestionnair(body: Body) {
    try {
      const survey = new hrmSurveyQuestionnaires();
      survey.name = body['name'];
      survey.description = body['description'];
      survey.companyId = body['companyId'];
      survey.isDefault = body['isDefault'];
      survey.questions = body['questions'];
      survey.companyId = body['companyId'];
      if (body['isDefault']) {
        await this.surveyQuestionnairesRepository.update(
          { companyId: survey.companyId },
          { isDefault: false },
        );
      }
      const surveyQuestionnair = await this.surveyQuestionnairesRepository.save(
        survey,
      );
      return {
        id: surveyQuestionnair.id,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getSurveyQuestionnaires(
    companyId: string,
    id: string,
    all: boolean,
    start: number,
    end: number,
  ) {
    try {
      console.log(companyId, id, all, start, end);
      let query = `SELECT * FROM hrm_survey_questionnaires WHERE "companyId" = $1`;
      let params = [companyId];
      if (id) {
        query += ` AND "id" = $2`;
        params.push(id);
      }

      query += ` ORDER BY "createdAt" DESC`;
      let surveyQuestionnaires = await this.dataSource.query(query, params);
      const totalCount = surveyQuestionnaires.length;
      surveyQuestionnaires = surveyQuestionnaires.slice(start, end);

      const response = {
        code: '',
        totalCount: totalCount.toString(),
        surveys: surveyQuestionnaires,
      };

      return response;
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putSurveyQuestionnaires(body: Body, id: string) {
    try {
      let surveyQuestionnair = await this.dataSource
        .query(`SELECT * FROM hrm_survey_questionnaires WHERE "id" = $1`, [id])
        .then((res) => res[0]);
      surveyQuestionnair.name = body['name'];
      surveyQuestionnair.description = body['description'];
      surveyQuestionnair.questions = body['questions'];
      surveyQuestionnair.isDefault = body['isDefault'];

      if (body['isDefault']) {
        await this.surveyQuestionnairesRepository.update(
          { companyId: surveyQuestionnair.companyId },
          { isDefault: false },
        );
      }

      const surveyQuestionnairSaved =
        await this.surveyQuestionnairesRepository.save(surveyQuestionnair);
      return {
        id: surveyQuestionnairSaved.id,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSurveyQuestionnaires(id: string) {
    try {
      await this.surveyQuestionnairesRepository.delete(id);
      return {
        status: 200,
        description: 'Success',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postSurveys(req: Request) {
    try {
      const survey = new hrmSurveySurveys();
      survey.name = req.body['name'];
      survey.description = req.body['description'];
      survey.companyId = req.body['companyId'];
      survey.questions = req.body['questions'];
      survey.startDate = req.body['startDate'];
      survey.endDate = req.body['endDate'];
      survey.status = req.body['status'];
      survey.assignees = req.body['assignees'];
      survey.responses = [];
      let usersId;
      if (survey.assignees['everyone'] === true) {
        usersId = await this.dataSource.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active'`,
          [survey.companyId],
        );
        for (const user of usersId) {
          survey.responses.push({
            userId: user.employeeId,
            responses: [],
          });
        }
      } else if (survey.assignees['employeeIds']) {
        for (const user of survey.assignees['employeeIds']) {
          survey.responses.push({
            userId: user,
            responses: [],
          });
        }
      }
      const surveySaved = await this.surveyRepository.save(survey);
      if (
        new Date(surveySaved.startDate).setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0) &&
        surveySaved.status === 'published'
      ) {
        await this.notificationService.addNotifications('survey', "A new survey is available. Your feedback is valued!", surveySaved['id'], surveySaved.companyId, req.headers['userid'] as string);
      }
      return surveySaved;
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getSurveys(
    companyId: string,
    id: string,
    all: string,
    start: number,
    end: number,
    status: string,
    employeeId: string,
    response: string,
  ) {
    try {
      let query = `SELECT * FROM hrm_survey_surveys WHERE "companyId" = $1`;
      let params = [companyId];
      if (employeeId) {
        query += ` AND "employeeId" = $${params.length + 1}`;
        params.push(employeeId);
      }

      if (id) {
        query += ` AND "id" = $${params.length + 1}`;
        params.push(id);
      }

      if (status) {
        query += ` AND "status" = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY "createdAt" DESC`;

      let surveys: hrmSurveySurveys[] = await this.dataSource.query(query, params);
      const totalCount = surveys.length;
      surveys = surveys.slice(start, end);

      if (employeeId) {
        for (const survey of surveys) {
          survey.responses = survey.responses.filter(
            (res) => res.userId === employeeId,
          );
        }
        surveys = surveys.filter((s) => s.assignees.find((a) => a.employeeIds.includes(employeeId)));
      }
      if (response === 'false') {
        for (const survey of surveys) {
          delete survey.responses;
        }
      }
      const responseObj = {
        code: '',
        totalCount: totalCount.toString(),
        surveys: surveys,
      };

      return responseObj;
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putSurveys(req: Request, id: string) {
    try {
      let survey = await this.dataSource.query(
        `SELECT * FROM hrm_survey_surveys WHERE "id" = $1`,
        [id],
      ).then((res) => res[0]);
      
      // Store existing responses before updating
      const existingResponses = survey.responses || [];
      
      survey.name = req.body['name'];
      survey.description = req.body['description'];
      survey.questions = req.body['questions'];
      survey.startDate = req.body['startDate'];
      survey.endDate = req.body['endDate'];
      survey.status = req.body['status'];
      survey.assignees = req.body['assignees'];
      
      let newUsers = [];
      if (req.body['assignees']['everyone'] === true) {
        const usersId = await this.dataSource.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status"='Active'`,
          [survey.companyId],
        );
        newUsers = usersId.map(user => user.employeeId);
      } else if (survey.assignees['employeeIds']) {
        newUsers = survey.assignees['employeeIds'];
      }
      
      // Keep existing responses and add new users without responses
      const existingUserIds = existingResponses.map(response => response.userId);
      const usersToAdd = newUsers.filter(userId => !existingUserIds.includes(userId));
      
      // add new users
      survey.responses = existingResponses;
      
      // Add new users with empty responses
      for (const userId of usersToAdd) {
        survey.responses.push({
          userId: userId,
          responses: []
        });
      }
      const surveySaved = await this.surveyRepository.save(survey);
      if (
        surveySaved.startDate === new Date().toISOString().split('T')[0] &&
        surveySaved.status === 'published'
      ) {
        // const notification = new HrmNotifications();
        // if (surveySaved.assignees['everyone'] === true) {
        //   notification.data = {
        //     employeeIds: [],
        //     featureId: surveySaved.id,
        //     name: surveySaved.name,
        //     status: 'pending',
        //   };
        // } else {
        //   notification.data = {
        //     employeeIds: surveySaved.assignees['employeeIds'],
        //     featureId: surveySaved.id,
        //     name: surveySaved.name,
        //     status: 'pending',
        //   };
        // }
        await this.notificationService.addNotifications('survey', "A new survey is available. Your feedback is valued!", surveySaved['id'], surveySaved.companyId, req.headers['userid'] as string);
      }
      return surveySaved;
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSurveys(id: string) {
    try {
      await this.surveyRepository.delete(id);
      return {
        status: 200,
        description: 'Success',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postSurveyResponses(body: Body) {
    try {
      const survey = await this.dataSource
        .query(`SELECT * FROM hrm_survey_surveys WHERE "id" = $1`, [
          body['surveyPollId'],
        ])
        .then((res) => res[0]);

        if (!survey.responses) {
          survey.responses = [];
        }
        

      let userFound = false;
      for (const response of survey.responses) {
        if (response.userId === body['employeeId']) {
          response.responses = body['answers'];
          userFound = true;
          break;
        }
      }
      if (!userFound && survey.assignees[0].everyone === true) {
        survey.responses.push({
          userId: body['employeeId'],
          responses: body['answers'],
        });
      }

      const surveySaved = await this.surveyRepository.save(survey);
      // console.log(surveySaved);
      return surveySaved;
      

    } catch (error) {
      console.error(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async  generateSurveys(req){
    try {
       const response = await this.API.post('/survey/questions', req.body, {timeout: 600000});
       return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
