import {
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
export class CandidatesCommentsService {
  constructor(
    @InjectRepository(hrmHiring)
    private hrmHiringRepository: Repository<hrmHiring>,
    @InjectDataSource() private datasource: DataSource,
  ) {}

  async postcomments(req: Request, companyId: string) {
    try {
      const id = '';
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE id= $1',
        [req.body.candidateId],
      );
      const candidateId = req.body.candidateId;
      const jobOpeningId = req.body.jobOpeningId;
      const commenterId = req.body.comment.commenterId;
      const commenterName = req.body.comment.commenterName;
      const comment = req.body.comment.comment;
      const type = 'comment';
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newComment = {
        id,
        candidateId,
        commenterId,
        commenterName,
        comment,
        jobOpeningId,
        type,
        createdAt,
        modifiedAt,
      };
      if (candidate.length > 0) {
        newComment.id = (
          candidate[0].data.candidatesComments.length + 1
        ).toString();
        candidate[0].data.candidatesComments.push(newComment);
        await this.hrmHiringRepository.save(candidate);
        return newComment;
      } else {
        throw new HttpException('error!', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getCommentsByCandidateId(id: string) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE id = $1 AND type = $2',
        [id, 'hrm_hiring_candidates'],
      );
      let comments = [];
      let AllReplies = [];
      if (candidate.length > 0) {
        comments = candidate[0].data.candidatesComments.filter(
          (item) => item.type === 'comment',
        );
        AllReplies = candidate[0].data.candidatesComments.filter(
          (item) => item.type === 'reply',
        );
      }
      for (let i = 0; i < comments.length; i++) {
        comments[i]['id'] = comments[i].id;
        comments[i]['candidateId'] = comments[i].candidateId;
        const replies = AllReplies.filter(
          (reply) => reply.commentId === comments[i].id,
        );
        comments[i]['reply'] = replies;
      }
      return comments;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putCommentById(id: string, req: Request) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',
        ['hrm_hiring_candidates', req.body.candidateId],
      );
      if (candidate.length > 0) {
        let oldComment = candidate[0].data.candidatesComments.find(
          (item) => item.id === id,
        );
        let restComments = candidate[0].data.candidatesComments.filter(
          (item) => item.id !== id,
        );
        if (oldComment) {
          if (req.body.hasOwnProperty('comment')) {
            oldComment.comment = req.body.comment;
          }
          oldComment.modifiedAt = new Date();
          restComments.push(oldComment);
        } else {
          restComments = candidate[0].data.candidatesComments;
        }
        candidate[0].data.candidatesComments = restComments;
        return await this.hrmHiringRepository.save(candidate);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCommentById(candidateId: string, id: string) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',
        ['hrm_hiring_candidates', candidateId],
      );
      if (candidate.length > 0) {
        const removedComments = candidate[0].data.candidatesComments.filter(
          (item) => item.id !== id,
        );
        const removedReplies = removedComments.filter(
          (item) => item.commentId !== id,
        );
        candidate[0].data.candidatesComments = removedReplies;
        await this.hrmHiringRepository.save(candidate);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postReplies(id: string, req: Request) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE id= $1',
        [req.body.candidateId],
      );
      const id = '';
      const commentId = req.body.commentId;
      const replyerId = req.body.replyerId;
      const replyerName = req.body.replyerName;
      const replyMsg = req.body.replyMsg;
      const type = 'reply';
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newReply = {
        id,
        commentId,
        replyerId,
        replyerName,
        type,
        replyMsg,
        createdAt,
        modifiedAt,
      };
      if (candidate.length > 0) {
        newReply.id = (
          candidate[0].data.candidatesComments.length + 1
        ).toString();
        candidate[0].data.candidatesComments.push(newReply);
        await this.hrmHiringRepository.save(candidate);
        return newReply;
      } else {
        throw new HttpException('error!', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putReplyById(id: string, req: Request) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',
        ['hrm_hiring_candidates', req.body.candidateId],
      );
      if (candidate.length > 0) {
        let oldComment = candidate[0].data.candidatesComments.find(
          (item) => item.id === id,
        );
        let restComments = candidate[0].data.candidatesComments.filter(
          (item) => item.id !== id,
        );
        if (oldComment) {
          if (req.body.hasOwnProperty('replyMsg')) {
            oldComment.replyMsg = req.body.replyMsg;
          }
          oldComment.modifiedAt = new Date();
          restComments.push(oldComment);
        } else {
          restComments = candidate[0].data.candidatesComments;
        }
        candidate[0].data.candidatesComments = restComments;
        return await this.hrmHiringRepository.save(candidate);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteReplyById(candidateId: string, id: string) {
    try {
      const candidate = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',
        ['hrm_hiring_candidates', candidateId],
      );
      if (candidate.length > 0) {
        const reply = candidate[0].data.candidatesComments.filter(
          (item) => item.id !== id,
        );
        candidate[0].data.candidatesComments = reply;
        await this.hrmHiringRepository.save(candidate);
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
