import { Injectable, HttpException, HttpStatus,Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingTemplate } from 'src/allEntities/trainingTemplate.entity';

@Injectable()
export class TrainingTemplateService {
    private readonly logger = new Logger(TrainingTemplateService.name);
  constructor(
    @InjectRepository(TrainingTemplate)
    private readonly trainingTemplateRepository: Repository<TrainingTemplate>,
  ) {}

  async createTemplate(body: any) {
    try {
        const template = new TrainingTemplate();
        

        template.name = body.name;
        template.description = body.description;
        template.isActive = body.isActive;
        template.categoryId = body.categoryId;
        template.type = body.type;
        template.links = body.links;
        template.courseIds = body.courseIds;
        template.requiredUploads = body.requiredUploads;
        template.hasAdditionalQuestions = body.hasAdditionalQuestions;
        template.questions = body.questions;
        template.companyId = body.companyId;
        template.attachments = body.attachments;

        
      return await this.trainingTemplateRepository.save(template);
    } catch (error) {
        this.logger.error(`Failed to create  training templeate`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }


  async getTraningTemplate(companyId: string, id?: string) {
    try {
      const query = this.trainingTemplateRepository.createQueryBuilder('traningTemplate')
        .where('traningTemplate.companyId = :companyId', { companyId })
        .orderBy('traningTemplate.createdAt', 'DESC');

      if (id) {
        query.andWhere('traningTemplate.id = :id', { id });
      }

      const traningTemplate = await query.getMany();

      return {
        code: '200',
        traningTemplate,
      };
    } catch (error) {
        this.logger.error(`Failed to retrieve training templeate`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async updateTrainingTemplate(
    id: string, body: any
    ) {
    try {
      let training = await this.trainingTemplateRepository.findOneBy({ id });
      if (!training) {
        throw new HttpException('training not found', HttpStatus.NOT_FOUND);
      }
     

      training.name = body['name']  || training.name;
      training.description = body['description']  || training.description;
      training.isActive = body['isActive']  || training.isActive;
      training.categoryId = body['categoryId']  || training.categoryId;
      training.type = body['type']  || training.type;
      training.links = body['links']  || training.links;
      training.courseIds = body['courseIds']  || training.courseIds;
      training.requiredUploads = body['requiredUploads'] !== undefined ? body['requiredUploads'] : training.requiredUploads;
      training.hasAdditionalQuestions = body['hasAdditionalQuestions'] !== undefined ? body['hasAdditionalQuestions'] : training.hasAdditionalQuestions;
      training.questions = body['questions']  || training.questions;
      training.companyId = body['companyId']  || training.companyId;
      training.attachments = body['attachments']  || training.attachments;
     
      await this.trainingTemplateRepository.save(training);
      return {
        code: '200',
        training,
      };
    } catch (error) {
        this.logger.error(`Failed to update training templeate`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async deletetrainingTemplate(id: string) {
    try {
        if (!id) {
            throw new HttpException('ID parameter is required', HttpStatus.BAD_REQUEST);
          }
      await this.trainingTemplateRepository.delete(id);
      return {
        status: 200,
        description: 'Success',
      };
    } catch (error) {
        this.logger.error(`Failed to delete training templeate`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }


  
}