import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Console } from 'console';
import { Response } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingCompleteService {
  constructor(
    @InjectRepository(HrmTrainingComplete)
    private trainingCompleteRepository: Repository<HrmTrainingComplete>,
  ) { }

  async postTrainingComplete(body: Body,  companyId: string) {
    try {
      const trainingId = body['trainingId'];
      const employeeId = body['employeeId'];
      const cost = body['cost'];
      const currency = body['currency'];
      const credits = body['credits'];
      const hours = body['hours'];
      const instructor = body['instructor'];
      const note = body['note'];
      const completedDate = body['completedDate'];
      const attachFiles = body['attachFiles'];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const trainingComplete = this.trainingCompleteRepository.create({
        trainingId,
        employeeId,
        cost,
        currency,
        credits,
        hours,
        instructor,
        note,
        completedDate,
        attachFiles,
        createdAt,
        modifiedAt,
        companyId
      });
      return await this.trainingCompleteRepository.save(
        trainingComplete
      );
      
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTrainingComplete( companyId: string) {
    try {
      const trainingCompletes = await this.trainingCompleteRepository.find(
        {where: { companyId: companyId }});
       return (trainingCompletes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTrainingCompleteByEmployeeId(
    id: string,
      
  ) {
    try {
      const trainingCompletes = await this.trainingCompleteRepository.find({
        where: { employeeId: id },
      });
       return (trainingCompletes);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putTrainingCompleteById(
    id: string,
    body: Body,
      
  ) {
    try {
      const trainingComplete = await this.trainingCompleteRepository.findOne({
        where: { id: id },
      });
      if (body.hasOwnProperty('trainingId')) {
        trainingComplete.trainingId = body['trainingId'];
      }
      if (body.hasOwnProperty('employeeId')) {
        trainingComplete.employeeId = body['employeeId'];
      }
      if (body.hasOwnProperty('cost')) {
        trainingComplete.cost = body['cost'];
      }
      if (body.hasOwnProperty('currency')) {
        trainingComplete.currency = body['currency'];
      }
      if (body.hasOwnProperty('credits')) {
        trainingComplete.credits = body['credits'];
      }
      if (body.hasOwnProperty('hours')) {
        trainingComplete.hours = body['hours'];
      }
      if (body.hasOwnProperty('instructor')) {
        trainingComplete.instructor = body['instructor'];
      }
      if (body.hasOwnProperty('note')) {
        trainingComplete.note = body['note'];
      }
      if (body.hasOwnProperty('completedDate')) {
        trainingComplete.completedDate = body['completedDate'];
      }
      if (body.hasOwnProperty('attachFiles')) {
        trainingComplete.attachFiles = body['attachFiles'];
      }
      trainingComplete.modifiedAt = new Date(Date.now());
      return await this.trainingCompleteRepository.save(trainingComplete);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTrainingCompleteById(
    id: string,
  ) {
    try {
      const trainingComplete = await this.trainingCompleteRepository.findOneOrFail({
        where: { id: id },
      });
      
      await this.trainingCompleteRepository.remove(trainingComplete);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
