import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class OffboardingCategoriesService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmBoardingTaskEmployees)
    private readonly boardTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
  ) {}

  async postOffboardingCategories(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newOffboardingCategoryData = {
        name,
      };
      return await this.commonRepository.save({
        type: 'offboardingCategories',
        data: newOffboardingCategoryData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOffboardingCategories( companyId: string) {
    try {
      const offboardingCategories = await this.commonRepository.find({where: { companyId: companyId ,type: 'offboardingCategories'}});
      const offboardingCategoriesList = [];
      for (let i = 0; i < offboardingCategories.length; i++) {
        const offboardingCategory = {
          id: offboardingCategories[i].id,
          ...offboardingCategories[i].data,
          createdAt: offboardingCategories[i].createdAt,
          modifiedAt: offboardingCategories[i].modifiedAt,
        }
        offboardingCategoriesList.push(offboardingCategory);
      }
      return offboardingCategoriesList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOffboardingCategoriesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const offboardingCategory = await this.commonRepository.findOneOrFail({where: { id: id }});
      if (req.body.hasOwnProperty('name')) {
        offboardingCategory.data.name = req.body['name'];
      }
      offboardingCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(offboardingCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteOffboardingCategoriesById(
    id: string,
      
  ) {
    try {
      const offboardingCategories = await this.commonRepository.findOneOrFail({where: { id: id }});
      await this.commonRepository.remove(offboardingCategories);
      const allOffboardingTasks = await this.commonRepository.find({where: { type: 'offboardingTask' }});
      let OffboardingTask;
      for (let i = 0; i < allOffboardingTasks.length; i++) {
        if (allOffboardingTasks[i].data.categoryId === offboardingCategories.id) {
          OffboardingTask = allOffboardingTasks[i];
          await this.commonRepository.remove(allOffboardingTasks[i]);
          break;
        }
      }
      const OffboardingTaskEmployees = await this.boardTaskEmployeesRepository.find({where: { taskId:OffboardingTask.id }});
      for (let i = 0; i < OffboardingTaskEmployees.length; i++) {
        await this.boardTaskEmployeesRepository.remove(OffboardingTaskEmployees[i]);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
