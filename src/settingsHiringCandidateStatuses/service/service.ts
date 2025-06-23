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
export class HiringCandidateStatusesService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
  ) {}

  async postHiringCandidateStatuses(req: Request,  companyId: string
    ) {
    try {
      const name = req.body.name;
      const type = req.body.type;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newCandidateStatusesData ={
          name,
          type,
        };
        return await this.commonRepository.save({
        type: 'hiringCandidateStatuses',
        data: newCandidateStatusesData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getHiringCandidateStatuses( companyId: string
    ) {
    try {
      const candidateStatuses = await this.commonRepository.find({
        where: { companyId: companyId, type: 'hiringCandidateStatuses' },
      });
      const candidateStatusesList = [];
      candidateStatuses.forEach((candidateStatus) => {
        const candidateStatusObj = candidateStatus.data;
        candidateStatusObj['id'] = candidateStatus.id;
        candidateStatusObj['createdAt'] = candidateStatus.createdAt;
        candidateStatusObj['modifiedAt'] = candidateStatus.modifiedAt;
        candidateStatusesList.push(candidateStatusObj);
      });
      return candidateStatusesList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteHiringCandidateStatusesById(
    id: string,
      
  ) {
    try {
      const candidateStatus =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      await this.commonRepository.remove(candidateStatus);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
