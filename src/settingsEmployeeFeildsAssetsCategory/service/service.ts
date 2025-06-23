import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AssetsCategoryService {
  constructor(
    @InjectDataSource() private dataSource:DataSource,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postAssetsCategory(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newAssetsCategoryData = {
        name,
        createdAt,
        modifiedAt,
        companyId
      };
      return await this.commonRepository.save({
        type: 'assetCategory',
        data: newAssetsCategoryData,
        companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAssetsCategory( companyId: string) {
    try {
      const assetsCategory = await this.dataSource.query(
        `SELECT * FROM "hrm_configs" WHERE "companyId" = $1 AND "type" = 'assetCategory'`,
        [companyId],
      );
      const assetsCategoryList= []
      for (let i = 0; i < assetsCategory.length; i++) {
        const assetsCategoryObj = {
          id: assetsCategory[i].id,
          ...assetsCategory[i].data,
          createdAt: assetsCategory[i].createdAt,
          modifiedAt: assetsCategory[i].modifiedAt,
          companyId: assetsCategory[i].companyId,
        };
        assetsCategoryList.push(assetsCategoryObj);
      }
      return assetsCategoryList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putAssetsCategoryById(
    id: string,
    req: Request,
      
  ) {
    try {
      const assetsCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        assetsCategory.data.name = req.body['name'];
      }
      assetsCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(assetsCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAssetsCategoryById(
    id: string,
      
  ) {
    try {
      const assetsCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(assetsCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
