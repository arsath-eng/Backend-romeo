/* import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository, DataSource } from 'typeorm';
import { id } from 'date-fns/locale';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(hrmHiring)
    private hrmHiringRepository: Repository<hrmHiring>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async postCandidates(application, companyId: string) {
    try {
      let candidate = new hrmHiring();
      candidate.type = 'hrm_hiring_candidates';
      candidate.data = application;
      candidate.companyId = companyId;
      const res = await this.hrmHiringRepository.create(candidate);
      return await this.hrmHiringRepository.save(res);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCandidates(companyId: string) {
    try {
      const candidates = await this.dataSource.query(
        'SELECT * FROM hrm_hiring WHERE type=$2 AND "companyId"=$1',
        [companyId, 'hrm_hiring_candidates'],
      );
      let returnData = [];
      for (let i = 0; i < candidates.length; i++) {
        returnData.push({
          id: candidates[i].id,
          ...candidates[i].data,
          companyId: candidates[i].companyId,
          createdAt: candidates[i].createdAt,
          modifiedAt: candidates[i].updatedAt,
        });
      }
      return returnData;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCandidatesById(id: string) {
    try {
      const candidate = await this.dataSource.query(
        'SELECT * FROM hrm_hiring WHERE type = $1 AND  id = $2',
        ['hrm_hiring_candidates', id],
      );
      let returnData = {};

      returnData = {
        id: candidate[0].id,
        ...candidate[0].data,
        companyId: candidate[0].companyId,
        createdAt: candidate[0].createdAt,
        modifiedAt: candidate[0].updatedAt,
      };
      return returnData;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCandidatesOfJobOpeningById(id: string) {
    try {
      const candidates = await this.dataSource.query(
        "SELECT * FROM hrm_hiring WHERE type = $1 AND  data->>'jobOpeningId' = $2",
        ['hrm_hiring_candidates', id],
      );
      let returnData = [];
      for (let i = 0; i < candidates.length; i++) {
        returnData.push({
          id: candidates[i].id,
          ...candidates[i].data,
          companyId: candidates[i].companyId,
          createdAt: candidates[i].createdAt,
          modifiedAt: candidates[i].updatedAt,
        });
      }
      return returnData;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCandidatesJobOpeningById(id: string, body: Body) {}

  async putCandidatesJobOpeningByIdBulk(body: Body) {}

  async putCandidatesById(id: string, body: any) {
    try {
      const candidate = await this.dataSource.query(
        'SELECT * FROM hrm_hiring WHERE id=$1',
        [id],
      );
      if (candidate.length > 0) {
        let curentCandidate = candidate[0];
        for (let [key, value] of Object.entries(body)) {
          if (curentCandidate.data.hasOwnProperty(key)) {
            curentCandidate.data[key] = value;
          }
        }
        return await this.hrmHiringRepository.save(curentCandidate);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCandidatesByIdBulk(body: Body) {}

  async deleteCandidateById(id: string) {
    try {
      return await this.dataSource.query(
        `DELETE FROM hrm_hiring WHERE id = '${id}'`,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCandidateByIdBulk(body: Body) {
    try {
      const res = await this.dataSource.query(
        'DELETE FROM hrm_hiring WHERE  id=ANY($1) ',
        [body['candidatesList']],
      );

      return res;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
 */