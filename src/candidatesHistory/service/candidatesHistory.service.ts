/* import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository, DataSource } from 'typeorm';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';

@Injectable()
export class CandidatesHistoryService {
  constructor(
    @InjectRepository(hrmHiring)
    private hrmHiring: Repository<hrmHiring>,
    @InjectDataSource() private datasource: DataSource,
  ) {}

  async postHistory(req: Request, companyId: string) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE id=$1 AND type=$2',
        [req.body.candidateId, 'hrm_hiring_candidates'],
      );
      const candidateId = req.body.candidateId;
      const editorId = req.body.editorId;
      const editorName = req.body.editorName;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const activity = req.body.activity.activity;
      const status = req.body.activity.status;
      const comment = req.body.activity.comment;
      const rate = req.body.activity.rate;
      const icon = req.body.activity.icon;
      const newActivity = {
        activity,
        status,
        comment,
        rate,
        icon,
      };

      const newHistory = {
        candidateId,
        editorId,
        editorName,
        activity: newActivity,
        createdAt,
        modifiedAt,
        companyId,
      };
      if (candidate.length > 0) {
        candidate[0].data.candidatesHistory.push(newHistory);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
      await this.hrmHiring.save(candidate);
      return newHistory;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getHistory(companyId: string) {
    try {
      const candidates = await this.datasource.query(
        "SELECT * FROM hrm_hiring WHERE 'companyId'=$1 AND type=$2",
        [companyId, 'hrm_hiring_candidates'],
      );
      let histories = [];
      for (let i = 0; i < candidates.length; i++) {
        histories.push(candidates[0].candidatesHistory);
      }
      return histories;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getHistoryByCandidateId(id: string) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',
        ['hrm_hiring_candidates', id],
      );
      let histories = [];
      if (candidate.length > 0) {
        histories = candidate[0].data.candidatesHistory;
      }

      return histories;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
 */