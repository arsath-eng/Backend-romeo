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
export class OnboardingCategoriesService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmBoardingTaskEmployees)
    private readonly boardingTaskEmployeesRepository: Repository<HrmBoardingTaskEmployees>,
  ) {}

  async postOnboardingCategories(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newOnboardingCategoryData = {
        name: name,
      };
      const newOnboardingCategory = this.commonRepository.create({
        type:'onboardingCategories',
        data: newOnboardingCategoryData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
      return await this.commonRepository.save(newOnboardingCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getOnboardingCategories( companyId: string) {
    try {
      const onboardingCategories = await this.commonRepository.find({where: { companyId: companyId, type:'onboardingCategories' }});
      const onboardingCategoriesList = [];
      for (let i = 0; i < onboardingCategories.length; i++) {
        const onboardingCategory = {
          id: onboardingCategories[i].id,
          ...onboardingCategories[i].data,
          createdAt: onboardingCategories[i].createdAt,
          modifiedAt: onboardingCategories[i].modifiedAt,
        };
        onboardingCategoriesList.push(onboardingCategory);
      }
      return onboardingCategoriesList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putOnboardingCategoriesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const onboardingCategory = await this.commonRepository.findOneOrFail({where: { id: id }});
      if (req.body.hasOwnProperty('name')) {
        onboardingCategory.data.name = req.body['name'];
      }
      onboardingCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(onboardingCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteOnboardingCategoriesById(
    id: string,
      
  ) {
    try {
      const onboardingCategory = await this.commonRepository.findOneOrFail({where: { id: id }});
      await this.commonRepository.remove(onboardingCategory);
      const allOnboardingTasks = await this.commonRepository.find({where: { type:'onboardingTasks' ,companyId:onboardingCategory.companyId}});
      let onboardingTask;
      for (let i = 0; i < allOnboardingTasks.length; i++) {
        if (allOnboardingTasks[i].data.categoryId === onboardingCategory.id) {
          onboardingTask = allOnboardingTasks[i]
          await this.commonRepository.remove(allOnboardingTasks[i]);
          break;
        }
      }
      const OnboardingTaskEmployees = await this.boardingTaskEmployeesRepository.find({where: { taskId:onboardingTask.id }});
      for (let i = 0; i < OnboardingTaskEmployees.length; i++) {
        await this.boardingTaskEmployeesRepository.remove(OnboardingTaskEmployees[i]);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
