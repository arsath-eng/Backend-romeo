import { Injectable, HttpException, HttpStatus,Logger, InternalServerErrorException  } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from 'src/allEntities/trainings.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
// import puppeteer from 'puppeteer';
import { AxiosInstance } from 'axios';
import * as http from 'http';
import * as https from 'https';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { DataSource } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class TrainingService {
    private readonly logger = new Logger(TrainingService.name);
    private axiosInstance: AxiosInstance;
  constructor(
    private notificationService: NotificationService,
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,
    private configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.axiosInstance = axios.create({
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
  }

  async createTraining(req: Request) {
    try {
      const training = this.trainingRepository.create(req.body);
      const savedTraining = await this.trainingRepository.save(training);
      const trainingRecord = Array.isArray(savedTraining) ? savedTraining[0] : savedTraining;

    let employeeIds: string[] = [];

    if (req.body.employeeIds.all) {
      const allEmployees = await this.dataSource.query(
        `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = '${trainingRecord.companyId}' AND "status" != 'Non Active'`
      );
      employeeIds = allEmployees.map((employee: any) => employee.employeeId);
    } else {
      employeeIds = req.body.employeeIds.ids;
    }
    if (req.body.status !== 'Draft') {
      await this.notificationService.addNotifications(
        'alert',
        `You are eligible for a ${req.body.name} Training! Please complete this training`,
        trainingRecord.id,
        trainingRecord.companyId,
        req.headers['userid'] as string,
        employeeIds
      );
    }
    return {
        code: '200',
        training,
      };

    } catch (error) {
        this.logger.error(`Failed to retrieve  training`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async getTraining(companyId: string, id?: string,employeeId?:string) {
    try {
      const query = this.trainingRepository.createQueryBuilder('training')
        .where('training.companyId = :companyId', { companyId })
        .orderBy('training.createdAt', 'DESC');

      if (id) {
        query.andWhere('training.id = :id', { id });
      }

      if (employeeId) {
        query.andWhere(`
          (
            "training"."employeeIds"->>'all' = 'true' OR 
            "training"."employeeIds"->'ids' @> :employeeIdJson
          )
        `, {
          employeeIdJson: JSON.stringify([employeeId]), 
        });
      }

      const training = await query.getMany();

      return {
        code: '200',
        training,
      };
    } catch (error) {
        this.logger.error(`Failed to retrieve training`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async updateTraining(id: string, req: Request) {
    try {
      
      let training = await this.trainingRepository.findOneBy({ id });
  
      if (!training) {
        throw new HttpException('Training not found', HttpStatus.NOT_FOUND);
      }

      const existingEmployeeIds = training.employeeIds?.ids || [];
      const updatedEmployeeIds = req.body.employeeIds?.ids || [];
      const newEmployeeIds = updatedEmployeeIds.filter((id: string) => !existingEmployeeIds.includes(id))
  
     
      training.name = req.body['name'] || training.name;
      training.template = req.body['template'] || training.template;
      training.employeeIds = req.body['employeeIds'] || training.employeeIds;
      training.status = req.body['status'] || training.status;
      training.dueDays = req.body['dueDays'] || training.dueDays;
      training.companyId = req.body['companyId'] || training.companyId;
      training.createdAt = req.body['createdAt'] || training.createdAt;
      training.modifiedAt = req.body['modifiedAt'] || training.modifiedAt;
  
      
      await this.trainingRepository.save(training);

      await this.notificationService.addNotifications(
        'alert',
        `You have been added to the ${training.name} Training! Please complete this training`,
        training.id,
        training.companyId,
        req.headers['userid'] as string,
        newEmployeeIds
      );
  
      
      return {
        code: '200',
        training,
      };
    } catch (error) {
      
      this.logger.error(`Failed to retrieve update training`, error.stack);
      throw new InternalServerErrorException(); 
    }
  }

  async deletetraining(id: string) {
    try {
        if (!id) {
            throw new HttpException('ID parameter is required', HttpStatus.BAD_REQUEST);
          }
      await this.trainingRepository.delete(id);
      return {
        status: 200,
        description: 'Success',
      };
    } catch (error) {
        this.logger.error(`Failed to retrieve delete training`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async updateTrainingResponse(trainingId: string, body: any) {
    try {
      const training = await this.trainingRepository.findOneBy({ id: trainingId });
  
      if (!training) {
        throw new HttpException('Training not found', HttpStatus.NOT_FOUND);
      }
  
      const existingResponses = training.responses || [];
  
     
      const updatedResponseIndex = existingResponses.findIndex(
        (response) => response.employeeId === body.employeeId,
      );
  
      if (updatedResponseIndex !== -1) {
       
        const existingResponse = existingResponses[updatedResponseIndex];
  
       
        const updatedResponse = {
            ...existingResponse,
            ...(body.status && { status: body.status }),
            ...(body.answers && {
              answers: body.answers.map((ans: any) => ({
                id: ans.id,
                questionId: ans.questionId,
                answer: ans.answer,
              })),
            }),
            ...(body.attachments && { attachments: body.attachments }),
          };
    
          existingResponses[updatedResponseIndex] = updatedResponse;
      } else {
       
        const newResponse = {
          employeeId: body.employeeId,
          status: body.status || null,
        answers: body.answers
          ? body.answers.map((ans: any) => ({
              id: ans.id,
              questionId: ans.questionId,
              answer: ans.answer,
            }))
          : [],
        attachments: body.attachments || [],
      };
  
        existingResponses.push(newResponse);
      }
  
     
      training.responses = existingResponses;
  
     
      await this.trainingRepository.save(training);
  
      return { id: training.id, message: 'Responses updated successfully' };
    } catch (error) {
        this.logger.error(`Failed to retrieve update training response`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }
  
  
  async getUdemyApiHeaders() {
    const clientId = this.configService.get<string>('UDEMY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('UDEMY_CLIENT_SECRET');
        
    if (!clientId || !clientSecret) {
        throw new HttpException('Udemy API credentials are missing',HttpStatus.INTERNAL_SERVER_ERROR);
    }
        
        return {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
        };
    }

    async searchUdemyCourses(query: string, page: number = 1,courseId?: string ) {
        try {
            const headers = await this.getUdemyApiHeaders();
            const baseUrl = this.configService.get<string>('UDEMY_BASE_URL');

            if (courseId) {
                // Fetch specific course details
                const courseResponse = await axios.get(`${baseUrl}/courses/${courseId}/`, {
                  headers,
                  httpAgent: new http.Agent({ keepAlive: true }),
                  httpsAgent: new https.Agent({ keepAlive: true }),
                });
          
                const course = courseResponse.data;
          
                return {
                  code: 'SUCCESS',
                  course: {
                    id: course.id,
                    title: course.title,
                    visible_instructors: course.visible_instructors.map((instructor) => ({
                      name: instructor.name,
                      display_name: instructor.title,
                      image_100x100: instructor.image_100x100,
                    })),
                    image_480x270: course.image_480x270,
                    locale: {
                      title: course.locale.title,
                    },
                    headline: course.headline,
                    url: course.url,
                  },
                };
              }
          
            
            const response = await axios.get(`${baseUrl}/courses/`, {
                headers,
                params: {
                    search: query,
                    page,
                    fields: [
                        'id',
                        'title',
                        'headline',
                        'visible_instructors',
                        'image_480x270',
                        'locale',
                        'url'
                    ].join(','),
                },
                httpAgent: new http.Agent({ keepAlive: true }),
                httpsAgent: new https.Agent({ keepAlive: true })
            });
      
          return {
            code: 'SUCCESS',
            currentPage: page, 
            pageCount: Math.ceil(response.data.count / 20), 
            courses: response.data.results.map((course) => ({
              _class: course._class || 'course',
              id: course.id,
              title: course.title,
              visible_instructors: course.visible_instructors.map((instructor) => ({
                name: instructor.name,
                display_name: instructor.title,
                image_100x100: instructor.image_100x100,
              })),
              image_480x270: course.image_480x270,
              locale: {
                title: course.locale.title,
              },
              headline: course.headline,
              url:course.url
            })),
          };
        } catch (error) {
          console.error('Udemy API Error:', error.response?.data || error.message);
          if (error.response) {
            console.error('Full error response:', {
              status: error.response.status,
              headers: error.response.headers,
              data: error.response.data
            });
          }
          throw new HttpException(
            `Failed to search Udemy courses: ${error.message}`,
            HttpStatus.BAD_REQUEST,
          );
          
        }
      }

}