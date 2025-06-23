import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { S3Service } from '../../s3/service/service';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { EmailsNewService } from '@flows/ses/service/emails.service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { offerLetter } from '@flows/allDtos/offerLetter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { offerLetterEmailTemplate } from 'emailTemplate.util';

@Injectable()
export class OfferLetterService {
  constructor(
    private readonly APIService: APIService,
    private s3Service: S3Service,
    private mailService: EmailsNewService,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmOfferLetter)
    private offerLetterRepository: Repository<HrmOfferLetter>,
    @InjectRepository(hrmHiring)
    private hrmHiringRepository: Repository<hrmHiring>,
    @InjectDataSource() private datasource: DataSource,
    private eventEmitter: EventEmitter2
  ) {}
  private savedofferLetter: HrmOfferLetter;

  async getOfferLetter(req: Request, id) {
    try {
      const offerLetter = await this.datasource.query(
        'SELECT * FROM hrm_hiring WHERE id=$1 ',
        [id],
      );
      offerLetter[0].data.seen = true;
      await this.hrmHiringRepository.save(offerLetter[0]);
      if (offerLetter.length > 0) {
        let returnObj = {
          id: offerLetter[0].id,
          ...offerLetter[0].data,
          companyId: offerLetter[0].companyId,
          createdAt: offerLetter[0].createdAt,
          modifiedAt: offerLetter[0].modifiedAt,
        };
        return returnObj;
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getOfferLetterCandidate(req: Request, id) {
    try {
      const offerLetter = await this.datasource.query(
        "SELECT * FROM hrm_hiring WHERE data->>'candidateId' =$1 ",
        [id],
      );
      if (offerLetter.length > 0) {
        let retunObj = {
          id: offerLetter[0].id,
          ...offerLetter[0].data,
          companyId: offerLetter[0].companyId,
          createAt: offerLetter[0].createAt,
          modifiedAt: offerLetter[0].modifiedAt,
        };
        return retunObj;
      } else {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postOfferLetter(req: Request) {
    try {
      let res = {};
      const offerLetter = new hrmHiring();
      const candidateId = req.body.candidateId;
      const email = req.body.email;
      const candidateInfo = req.body.candidateInfo;
      const data = req.body.data;
      const files = req.body.files;
      const uploadedFile = req.body.uploadedFile;
      const expiredDate = req.body.expiredDate;
      const job = req.body.job;
      const compensation = req.body.compensation;
      const whoContact = req.body.whoContact;
      const sentBy = req.body.sentBy;
      const seen = req.body.seen;
      const submit = req.body.submit;
      const createdAt = new Date();
      const modifiedAt = new Date();
      const type = 'letter';
      const newofferLetter = {
        type,
        candidateId,
        email,
        candidateInfo,
        data,
        files,
        uploadedFile,
        expiredDate,
        job,
        compensation,
        whoContact,
        sentBy,
        seen,
        submit,
        createdAt,
        modifiedAt,
      };
      offerLetter.data = newofferLetter;
      offerLetter.type = 'hrm_offer_letter';
      offerLetter.companyId = req.body.companyId;
      await this.hrmHiringRepository.save(offerLetter);
      const candidate = await this.datasource.query(
        'SELECT* FROM hrm_hiring WHERE id=$1 AND type=$2',
        [candidateId, 'hrm_hiring_candidates'],
      );
      if (candidateId.length > 0) {
        let currentCandidate = candidate[0];
        currentCandidate.data.offer = true;
        res = await this.hrmHiringRepository.save(currentCandidate);
        const company = await this.APIService.getCompanyById(
          req.body.companyId,
        );
        const emailbody = await offerLetterEmailTemplate(company.companyName, currentCandidate.data.firstName + ' ' + currentCandidate.data.lastName, req.body.whoContact.email, req.body.whoContact.name, currentCandidate.data.jobOpeningTitle, offerLetter.id, req.body.companyId);
        const emitBody = { sapCountType:'offerLetter', companyId: req.body.companyId, subjects: 'Offer Letter', email, body: emailbody };
        this.eventEmitter.emit('send.email', emitBody);
        return res;
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async putOfferLetter(req: Request, id) {
    try {
      const offerLetter = await this.offerLetterRepository.findOne({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('candidateId')) {
        offerLetter.data.candidateId = req.body.candidateId;
      }
      if (req.body.hasOwnProperty('email')) {
        offerLetter.data.email = req.body.email;
      }
      if (req.body.hasOwnProperty('candidateInfo')) {
        offerLetter.data.candidateInfo = req.body.candidateInfo;
      }
      if (req.body.hasOwnProperty('data')) {
        offerLetter.data.data = req.body.data;
      }
      if (req.body.hasOwnProperty('files')) {
        offerLetter.data.files = req.body.files;
      }
      if (req.body.hasOwnProperty('uploadedFile')) {
        offerLetter.data.uploadedFile = req.body.uploadedFile;
      }
      if (req.body.hasOwnProperty('expiredDate')) {
        offerLetter.data.expiredDate = req.body.expiredDate;
      }
      if (req.body.hasOwnProperty('job')) {
        offerLetter.data.job = req.body.job;
      }
      if (req.body.hasOwnProperty('compensation')) {
        offerLetter.data.compensation = req.body.compensation;
      }
      if (req.body.hasOwnProperty('whoContact')) {
        offerLetter.data.whoContact = req.body.whoContact;
      }
      if (req.body.hasOwnProperty('sentBy')) {
        offerLetter.data.sentBy = req.body.sentBy;
      }
      if (req.body.hasOwnProperty('companyId')) {
        offerLetter.data.companyId = req.body.companyId;
      }
      if (req.body.hasOwnProperty('seen')) {
        offerLetter.data.seen = req.body.seen;
      }
      if (req.body.hasOwnProperty('submit')) {
        offerLetter.data.submit = req.body.submit;
      }
      offerLetter.modifiedAt = new Date();

      return await this.offerLetterRepository.save(offerLetter);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async putOfferLetterRevised(req: Request, id) {
    try {
      const offerLetter = await this.offerLetterRepository.findOne({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('candidateId')) {
        offerLetter.data.candidateId = req.body.candidateId;
      }
      if (req.body.hasOwnProperty('email')) {
        offerLetter.data.email = req.body.email;
      }
      if (req.body.hasOwnProperty('candidateInfo')) {
        offerLetter.data.candidateInfo = req.body.candidateInfo;
      }
      if (req.body.hasOwnProperty('data')) {
        offerLetter.data.data = req.body.data;
      }
      if (req.body.hasOwnProperty('files')) {
        offerLetter.data.files = req.body.files;
      }
      if (req.body.hasOwnProperty('uploadedFile')) {
        offerLetter.data.uploadedFile = req.body.uploadedFile;
      }
      if (req.body.hasOwnProperty('expiredDate')) {
        offerLetter.data.expiredDate = req.body.expiredDate;
      }
      if (req.body.hasOwnProperty('job')) {
        offerLetter.data.job = req.body.job;
      }
      if (req.body.hasOwnProperty('compensation')) {
        offerLetter.data.compensation = req.body.compensation;
      }
      if (req.body.hasOwnProperty('whoContact')) {
        offerLetter.data.whoContact = req.body.whoContact;
      }
      if (req.body.hasOwnProperty('sentBy')) {
        offerLetter.data.sentBy = req.body.sentBy;
      }
      if (req.body.hasOwnProperty('companyId')) {
        offerLetter.data.companyId = req.body.companyId;
      }
      if (req.body.hasOwnProperty('seen')) {
        offerLetter.data.seen = req.body.seen;
      }
      if (req.body.hasOwnProperty('submit')) {
        offerLetter.data.submit = req.body.submit;
      }
      offerLetter.modifiedAt = new Date();

      await this.offerLetterRepository.save(offerLetter);
      const company = await this.APIService.getCompanyById(
        req.body.companyId,
      );
      const candidate = await this.datasource.query(
        'SELECT* FROM hrm_hiring WHERE id=$1 AND type=$2',
        [req.body.candidateId, 'hrm_hiring_candidates'],
      );
      const emailbody = await offerLetterEmailTemplate(company.companyName, candidate[0].data.firstName + ' ' + candidate[0].data.lastName, req.body.whoContact.email, req.body.whoContact.name, candidate[0].data.jobOpeningTitle, offerLetter.id, req.body.companyId);
      const emitBody = { sapCountType:'offerLetter', companyId: req.body.companyId, subjects: 'Offer Letter', email: req.body.whoContact.email, body: emailbody };
      this.eventEmitter.emit('send.email', emitBody);

      return await this.APIService.getCompanyById(offerLetter.companyId);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDuplicateOfferLetter(files: Express.Multer.File, req) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: req['userid'] ,status: Not('Non Active')},
      });
      const company = await this.APIService.getCompanyById(employee.companyId);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = files.mimetype.split('/')[1];
      const originalName = files.originalname.split('.')[0];
      files.originalname =
        originalName + '-' + uniqueSuffix + '.' + fileExtension;
      let s3Response = await this.s3Service.uploadDocument(
        files,
        company.companyName,
      );
      const createdAt = new Date();
      const modifiedAt = new Date();
      const format = files.originalname.split('.').slice(-1).toString();
      const name = files.originalname;
      const fileLink = s3Response['key'];
      const type = 'letter';
      const newDocument = {
        type,
        createdAt,
        modifiedAt,
        fileLink,
        format,
        name,
      };
      this.savedofferLetter = await this.offerLetterRepository.save(
        newDocument,
      );
      return this.savedofferLetter.id;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getOfferLetterDocsById(req: Request, id) {
    try {
      const letter = await this.offerLetterRepository.findOne({
        where: { id: id },
      });
      const array = letter.fileLink.split(
        `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
      );
      letter.fileLink = array[1];
      return letter;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async deleteOfferLetter(req: Request, id) {
    try {
      const offerLetter = await this.offerLetterRepository.findOne({
        where: { id: id },
      });
      const candidate = await this.hrmHiringRepository.findOne({
        where: { id: offerLetter.data.candidateId },
      });
      candidate.data.offer = false;
      await this.hrmHiringRepository.save(candidate);
      await this.offerLetterRepository.remove(offerLetter);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
