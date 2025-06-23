import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Not, DataSource, Repository } from 'typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { S3Service } from '../s3/service/service';
import { APIService } from '../superAdminPortalAPI/APIservice.service';
import { ClaimsDto } from '../allDtos/claims.dto';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { AccClaims } from '@flows/allEntities/claims.entity';

@Injectable()
export class ClaimsService {
    constructor(
        @InjectRepository(AccClaims) private claimsRepository: Repository<AccClaims>,
        @InjectRepository(HrmFiles) private documentsRepository: Repository<HrmFiles>,
        @InjectRepository(HrmFolders) private foldersRepository: Repository<HrmFolders>,
        @InjectRepository(HrmNotifications)
        private notificationsRepository: Repository<HrmNotifications>,
        private s3Service: S3Service,
        private readonly APIService: APIService,
        private readonly notificationService: NotificationService,
        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        @InjectDataSource() private dataSource: DataSource,
    ) {}
    async getClaimsByDataRange(from:string, to:string, companyId:string     ) {
      try {
        let array = [];
          const claims = await this.claimsRepository.find({where:{companyId: companyId}});
           array = claims.slice(parseInt(from),parseInt(to))
          let returnObj = {
            length: claims.length,
            claims: array
          }
         return returnObj;
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
  }
    async getClaimsByEmployeeId(  employeeId:string) {
        try {
            const claims = await this.claimsRepository.find({where:{employeeId:employeeId}});
           return (claims);
        } catch (error) {
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async getClaimsById(  id:string) {
        try {
            const claims = await this.claimsRepository.findOne({where:{id:id}});
           return (claims);
        } catch (error) {
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async postClaims(req: Request,   companyId:string, claimsDto: ClaimsDto) {
        try {
          const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
            'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
            [req.headers['userid'] as string],
          ).then(res => res[0]);
            claimsDto.createdAt = new Date();
            claimsDto.modifiedAt = new Date();
            claimsDto.companyId = companyId;
            claimsDto.type = 'claims';
            claimsDto.requesterId = req.headers['userid'] as string;
          const savedClaims = await this.claimsRepository.save(claimsDto);
          await this.notificationService.addNotifications('claimRequest', `${employeeDetails.fullName.first + ' ' + employeeDetails.fullName.last} is requesting a claim`, savedClaims['id'], companyId, req.headers['userid'] as string);
          return savedClaims;
        } catch (error) {
          console.log(error);
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async putClaims(req: Request,   id:string) {
      try {
        const claims = await this.claimsRepository.findOne({where:{id:id}});
        if (req.body.hasOwnProperty('status')) {
          claims.status = req.body.status;
        }
        if (req.body.hasOwnProperty('amount')) {
          claims.amount = req.body.amount;
        }
        if (req.body.hasOwnProperty('claimCategory')) {
          claims.claimCategory = req.body.claimCategory;
        }
        if (req.body.hasOwnProperty('claimComment')) {
          claims.claimComment = req.body.claimComment;
        }
        if (req.body.hasOwnProperty('claimDate')) {
          claims.claimDate = req.body.claimDate;
        }
        if (req.body.hasOwnProperty('fileId')) {
          claims.fileId = req.body.fileId;
        }
        if (req.body.hasOwnProperty('fileLink')) {
          claims.fileLink = req.body.fileLink;
        }
        if (req.body.hasOwnProperty('action')) {
          claims.action = req.body.action;
        }
        if (req.body.hasOwnProperty('paidBy')) {
          claims.paidBy = req.body.paidBy;
        }
        claims.modifiedAt = new Date();
        if (req.body.status === 'approved') {
          await this.notificationService.addNotifications(
            'alert', 
            `Your ${claims.claimCategory} claim was approved`, 
            claims.id, 
            claims.companyId, 
            claims.employeeId
        );
        }
        return await this.claimsRepository.save(claims);
        
        
        
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async uploadClaimFile(files:Array<Express.Multer.File>,  req: Request, companyId:string) {
        try {
            const company = await this.APIService.getCompanyById(companyId);
            const folder = await this.foldersRepository.findOne({where:{folderName:'Employee Uploads'}});
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              const fileExtension = files[0].mimetype.split('/')[1];
              const originalName = files[0].originalname.split('.')[0];
              files[0].originalname = originalName + '-' + uniqueSuffix + '.' + fileExtension;
              let s3Response = await this.s3Service.uploadDocument(files[0], company.companyName);
              const createdAt = new Date(Date.now());
              const modifiedAt = new Date(Date.now());            
              const format = files[0].originalname.split('.').slice(-1).toString();
              const fileName = files[0].originalname;
              const fileLink = s3Response["key"];
              const uploaderId = req.headers['userid'] as string;
              const folderId = folder.id;
              const newDocument = this.documentsRepository.create({
                uploaderId,
                folderId,
                createdAt,
                modifiedAt,
                fileLink,
                format,
                companyId,
                fileName,
              });
              const savedDocument = await this.documentsRepository.save(newDocument);
             return ({documentId:savedDocument.id, fileLink:savedDocument.fileLink});
          } catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
          }
    }
    async deleteClaimsRequest(req: Request,   id:string) {
      try {
        const claims = await this.claimsRepository.findOne({where:{id:id}});
        await this.claimsRepository.remove(claims);
        const notifications = await this.notificationsRepository.findOne({where:{id:id}});
        await this.notificationsRepository.remove(notifications);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
}
