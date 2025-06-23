/* import { EmailsNewService } from '../../ses/service/emails.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { Request } from 'express';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CandidatesEmailsService {
  constructor(
    @InjectRepository(hrmHiring)
    private hrmHiringRepository: Repository<hrmHiring>,
    private mailService: EmailsNewService,
    @InjectDataSource() private datasource: DataSource,
    private eventEmitter: EventEmitter2
  ) {}

  async postCandidatesEmails(req: Request, companyId: string) {
    try {
      let email = {};
      const candidates = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE  id= ANY($1) AND type=$2',
        [req.body.receiver, 'hrm_hiring_candidates'],
      );
      if (candidates.length > 0) {
        const sender = req.body.sender;

        const subject = req.body.subject;
        const status = req.body.status;
        const content = req.body.content;
        const attachments = req.body.attachments;

        for (let i = 0; i < candidates.length; i++) {
          const receiver = candidates[i].id;
          email = {
            id: (candidates[i].data.candidatesEmails.length + 1).toString(),
            sender,
            receiver,
            subject,
            status,
            content,
            attachments,
            companyId,
            createdAt: new Date(),
          };
          candidates[i].data.candidatesEmails.push(email);
        }
        await this.hrmHiringRepository.save(candidates);
        for (let i = 0; i < candidates.length; i++) {
          const emitBody = { sapCountType:'hiring', companyId, subjects: subject, email: candidates[i].data.email, body: req.body.content.justHtml};
          this.eventEmitter.emit('send.email', emitBody);
        }
      }
      return email;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCandidatesEmails(companyId: string) {
    try {
      const candidates = await this.hrmHiringRepository.query(
        `SELECT * FROM hrm_hiring WHERE type = 'hrm_hiring_candidates' AND companyId = '${companyId}'`,
      );

      let retunData = [];
      for (let i = 0; i < candidates.length; i++) {
        let temp = candidates[i].data.candidatesEmails;
        retunData.push(...temp);
      }
      return retunData;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCandidatesEmailsByCandidateId(id: string) {
    try {
      const candidates = await this.hrmHiringRepository.query(
        `SELECT * FROM hrm_hiring WHERE type = 'hrm_hiring_candidates' AND id = '${id}'`,
      );

      let retunData = [];
      for (let i = 0; i < candidates.length; i++) {
        let temp = candidates[i].data.candidatesEmails;

        retunData.push(...temp);
      }
      return retunData;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
 */