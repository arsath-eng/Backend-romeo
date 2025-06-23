import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class ClaimsCategoryService {
  constructor(
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postClaim(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const claimData = {
        name
      };
      return await this.commonRepository.save({
        type: 'claimsCategories',
        data: claimData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getClaim( companyId: string) {
    try {
      const claims = await this.commonRepository.find({where: { companyId: companyId, type: 'claimsCategories'}});
       const claimList = [];
      for (let i = 0; i < claims.length; i++) {
        claimList.push({
          id: claims[i].id,
          ...claims[i].data,
          createdAt: claims[i].createdAt,
          modifiedAt: claims[i].modifiedAt,
          companyId: claims[i].companyId,
        });
      }
      return claimList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putClaimById(
    id: string,
    req: Request,
      
  ) {
    try {
      const claims = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        claims.data.name = req.body['name'];
      }
      claims.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(claims);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteClaimById(
    id: string,
      
  ) {
    try {
      const claim = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(claim);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
