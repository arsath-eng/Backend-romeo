import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ShirtSizeService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postShirtSize(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newShirtSizeData = {
        name
      };
      return await this.commonRepository.save({
        type: 'shirtSize',
        data: newShirtSizeData,
        companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getShirtSize( companyId: string) {
    try {
      const shirtSizez = await this.dataSource.query('SELECT * FROM hrm_configs WHERE type = $1 AND "companyId" = $2', ["shirtSize",companyId])
      const shirtSizeList = [];
      shirtSizez.forEach((shirtSize) => {
        shirtSizeList.push({
          id: shirtSize.id,
          ...shirtSize.data,
          createdAt: shirtSize.createdAt,
          modifiedAt: shirtSize.modifiedAt,
          companyId: shirtSize.companyId,
        });
      });
      return shirtSizeList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      
    }
  }

  async putShirtSizeById(
    id: string,
    req: Request,
      
  ) {
    try {
      const shirtSize = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        shirtSize.data.name = req.body['name'];
      }
      shirtSize.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(shirtSize);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteShirtSizeById(
    id: string,
      
  ) {
    try {
      const shirtSize = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(shirtSize);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
