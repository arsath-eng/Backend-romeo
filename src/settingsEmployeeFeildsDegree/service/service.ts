import { HrmConfigs } from '@flows/allEntities/configs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postDegree(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newDegreeData = {
        name
      };
      return await this.commonRepository.save({
        type: 'degree',
        data: newDegreeData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDegrees( companyId: string) {
    try {
      const degrees = await this.commonRepository.find({where: { companyId: companyId, type: 'degree'}});
       const degreeList = [];
      for (let i = 0; i < degrees.length; i++) {
        degreeList.push({
          id: degrees[i].id,
          ...degrees[i].data,
          createdAt: degrees[i].createdAt,
          modifiedAt: degrees[i].modifiedAt,
          companyId: degrees[i].companyId,
        });
      }
      return degreeList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDegreeById(
    id: string,
    req: Request,
      
  ) {
    try {
      const degree = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        degree.data.name = req.body['name'];
      }
      degree.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(degree);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteDegreeById(id: string     ) {
    try {
      const reason = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(reason);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
