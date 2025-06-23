import { Injectable, HttpException, HttpStatus,Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingCategories } from '@flows/allEntities/trainingCategories.entity';

@Injectable()
export class TrainingCategoryService {
    private readonly logger = new Logger(TrainingCategoryService.name);
  constructor(
    @InjectRepository(TrainingCategories)
    private readonly trainingCategoryRepository: Repository<TrainingCategories>,
  ) {}

  async createTrainingCategory(body: any) {
    try {
        const training = new TrainingCategories();
        training.name = body.name;
        training.description = body.description;
        training.isActive = body.isActive;
        training.companyId = body.companyId;
        

      const savedTraining = await this.trainingCategoryRepository.save(training);
      return savedTraining;
    } catch (error) {
        this.logger.error(`Failed to create training category`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async getTrainingCategories(companyId: string, id?: string) {
    try {
      const query = this.trainingCategoryRepository.createQueryBuilder('training')
        .where('training.companyId = :companyId', { companyId })
        .orderBy('training.createdAt', 'DESC');

      if (id) {
        query.andWhere('training.id = :id', { id });
      }

      const training = await query.getMany();

      return {
        code: '200',
        training,
      };
    } catch (error) {
        this.logger.error(`Failed to  get training category`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }


  async updateTrainingcatorgory(
    id: string, body: any
    ) {
    try {
      let training = await this.trainingCategoryRepository.findOneBy({ id });
      if (!training) {
        throw new HttpException('training not found', HttpStatus.NOT_FOUND);
      }

      training.name = body['name'] || training.name;
      training.description = body['description'] || training.description;
      training.companyId = body['companyId'] || training.companyId;
      training.isActive = body['isActive'] || training.isActive;
      training.createdAt = body['createdAt'] || training.createdAt;
      training.modifiedAt = body['modifiedAt'] || training.modifiedAt;
     
      await this.trainingCategoryRepository.save(training);
      return {
        code: '200',
        training,
      };
    } catch (error) {
        this.logger.error(`Failed to retrieve updated training category`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }

  async deletetrainingCategory(id: string) {
    try {
        if (!id) {
            throw new HttpException('ID parameter is required', HttpStatus.BAD_REQUEST);
          }
      await this.trainingCategoryRepository.delete(id);
      return {
        status: 200,
        description: 'Success',
      };
    } catch (error) {
        this.logger.error(`Failed to delete training category`, error.stack);
        throw new InternalServerErrorException(); 
    }
  }
}