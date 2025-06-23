import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyLinksService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postCompanyLinksCategories(body: Body, companyId: string) {
    try {
      const name = body['name'];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newCompanyLinksCategory = {
        name,
        createdAt,
        modifiedAt,
        companyId,
      };
      const common = {
        type: 'companyLinksCategories',
        createdAt: new Date(),
        modifiedAt: new Date(),
        companyId,
        data: newCompanyLinksCategory,
      };
      return await this.commonRepository.save(common);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCompanyLinksCategories(companyId: string) {
    try {
      const res = [];
      const CompanyLinksCategory = await this.commonRepository.find({
        where: { companyId: companyId, type: 'companyLinksCategories' },
      });
      for (let i = 0; i < CompanyLinksCategory.length; i++) {
        const obj = {
          ...CompanyLinksCategory[i].data,
          createdAt: CompanyLinksCategory[i].createdAt,
          modifiedAt: CompanyLinksCategory[i].modifiedAt,
          id: CompanyLinksCategory[i].id,
          type: CompanyLinksCategory[i].type,
          companyId: CompanyLinksCategory[i].companyId,
        };
        res.push(obj);
      }
      return res;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCompanyLinksCategoriesById(id: string) {
    try {
      let res;
      const CompanyLinksCategory = await this.commonRepository.findOne({
        where: { id: id },
      });
      const obj = {
        ...CompanyLinksCategory.data,
        createdAt: CompanyLinksCategory.createdAt,
        modifiedAt: CompanyLinksCategory.modifiedAt,
        id: CompanyLinksCategory.id,
        type: CompanyLinksCategory.type,
        companyId: CompanyLinksCategory.companyId,
      };
      res.push(obj);
      return res;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCompanyLinksCategoriesById(id: string, body: Body) {
    try {
      const newCompanyLinksCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (body.hasOwnProperty('name')) {
        newCompanyLinksCategory.data.name = body['name'];
      }
      newCompanyLinksCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(newCompanyLinksCategory);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCompanyLinksCategoriesById(id: string) {
    try {
      const compensation = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(compensation);
      const common = await this.commonRepository.find({
        where: { type: 'companyLinks' },
      });
      const compensations = common.filter(
        (common) => common.data.categoryId === id,
      );
      if (compensations.length != 0) {
        for (let i = 0; i < compensations.length; i++) {
          await this.commonRepository.remove(compensations[i]);
        }
      }
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postCompanyLinks(body: Body, companyId: string) {
    try {
      const title = body['title'];
      const link = body['link'];
      const categoryId = body['categoryId'];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newCompanyLinksCategory = {
        title,
        link,
        categoryId,
        createdAt,
        modifiedAt,
        companyId,
      };
      const common = {
        type: 'companyLinks',
        createdAt: new Date(),
        modifiedAt: new Date(),
        companyId,
        data: newCompanyLinksCategory,
      };
      return await this.commonRepository.save(common);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCompanyLinks(companyId: string) {
    try {
      const res = [];
      const CompanyLinksCategory = await this.commonRepository.find({
        where: { companyId: companyId, type: 'companyLinks' },
      });
      for (let i = 0; i < CompanyLinksCategory.length; i++) {
        const obj = {
          ...CompanyLinksCategory[i].data,
          createdAt: CompanyLinksCategory[i].createdAt,
          modifiedAt: CompanyLinksCategory[i].modifiedAt,
          id: CompanyLinksCategory[i].id,
          type: CompanyLinksCategory[i].type,
          companyId: CompanyLinksCategory[i].companyId,
        };
        res.push(obj);
      }
      return res;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCompanyLinksById(id: string) {
    try {
      const CompanyLinksCategory = await this.commonRepository.findOne({
        where: { id: id },
      });
      const obj = {
        ...CompanyLinksCategory.data,
        createdAt: CompanyLinksCategory.createdAt,
        modifiedAt: CompanyLinksCategory.modifiedAt,
        id: CompanyLinksCategory.id,
        type: CompanyLinksCategory.type,
        companyId: CompanyLinksCategory.companyId,
      };
      return obj;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCompanyLinksById(id: string, body: Body) {
    try {
      const newCompanyLinksCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (body.hasOwnProperty('title')) {
        newCompanyLinksCategory.data.title = body['title'];
      }
      if (body.hasOwnProperty('link')) {
        newCompanyLinksCategory.data.link = body['link'];
      }
      if (body.hasOwnProperty('categoryId')) {
        newCompanyLinksCategory.data.categoryId = body['categoryId'];
      }
      newCompanyLinksCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(newCompanyLinksCategory);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCompanyLinksById(id: string) {
    try {
      const compensation = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(compensation);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
