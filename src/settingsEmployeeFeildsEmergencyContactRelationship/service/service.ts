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
export class EmergencyContactRelationshipService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
  ) {}

  async postEmergencyContactRelationship(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newEmergencyContactRelationshipData = {
        name
      };
      return await this.commonRepository.save({
        type: 'emergencyContactRelationship',
        data: newEmergencyContactRelationshipData,
        companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmergencyContactRelationship( companyId: string) {
    try {
      const emergencyContactRelationship = await this.commonRepository.find({where: { companyId: companyId, type: 'emergencyContactRelationship'}}
        );
      const emergencyContactRelationshipList = [];
      emergencyContactRelationship.forEach((emergencyContactRelationship) => {
        const emergencyContactRelationshipObj = {
          id: emergencyContactRelationship.id,
          ...emergencyContactRelationship.data,
          createdAt: emergencyContactRelationship.createdAt,
          modifiedAt: emergencyContactRelationship.modifiedAt,
          companyId: emergencyContactRelationship.companyId,
        };
        emergencyContactRelationshipList.push(emergencyContactRelationshipObj);
      });
      return emergencyContactRelationshipList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putEmergencyContactRelationshipById(
    id: string,
    req: Request,
      
  ) {
    try {
      const emergencyContactRelationship =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      if (req.body.hasOwnProperty('name')) {
        emergencyContactRelationship.data.name = req.body['name'];
      }
      emergencyContactRelationship.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(emergencyContactRelationship);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEmergencyContactRelationshipById(
    id: string,
      
  ) {
    try {
      const reason =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      await this.commonRepository.remove(reason);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
