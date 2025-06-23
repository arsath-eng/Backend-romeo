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
export class HiringCandidateSourcesService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
  ) {}

  async postHiringCandidateSources(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newCandidateStatusesData = {
          name,
        };
        return await this.commonRepository.save({
        type: 'hiringCandidateSources',
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

  async getHiringCandidateSources( companyId: string) {
    try {
      const candidateSources =
        await this.commonRepository.find({where: { companyId: companyId , type: 'hiringCandidateSources'}});
      const candidateSourcesList = [];
      candidateSources.forEach((candidateSource) => {
        const candidateSourceObj = candidateSource.data;
        candidateSourceObj['id'] = candidateSource.id;
        candidateSourceObj['createdAt'] = candidateSource.createdAt;
        candidateSourceObj['modifiedAt'] = candidateSource.modifiedAt;
        candidateSourcesList.push(candidateSourceObj);
      });
      return candidateSourcesList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteHiringCandidateSourcesById(
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
