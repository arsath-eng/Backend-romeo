
import { S3Service } from '../../s3/service/service';
import {
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Console } from 'console';
import { Response } from 'express';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';
const fs = require('fs');
const path = require('path');
const dirTree = require('directory-tree');
import * as AWS from "aws-sdk";
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(HrmFolders)
    private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(HrmFiles)
    private documentsRepository: Repository<HrmFiles>,
    private s3Service: S3Service,
    private timeTrackingService: TimeTrackingService,
    private readonly APIService: APIService,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
  ) { }

  async postFolders(req: Request,  companyId: string) {
    try {
      const folderName = req.body.folderName;
      const folderType = req.body.folderType;
      const description = req.body.description;
      const icon = req.body.icon;
      const subFolder = req.body.subFolder;
      const parentFolder = req.body.parentFolder;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      let path = [];
      if (parentFolder != null) {
        const folder = await this.foldersRepository.findOne({
          where: { id: parentFolder },
        });
        for (let i = 0; i < folder.path.length; i++) {
          path.push(folder.path[i]);
        }
        path.push(folder.id);
      } else {
        path = [];
      }
      const newFolder = this.foldersRepository.create({
        type: "documentsFolders",
        folderName,
        folderType,
        description,
        icon,
        createdAt,
        modifiedAt,
        subFolder,
        parentFolder,
        path,
        companyId
      });
      return await this.foldersRepository.save(newFolder);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getFolders( companyId: string) {
    try {
      const folders = await this.foldersRepository.find({where: { companyId: companyId, type: "documentsFolders" }});
       return (folders);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putFolderById(
    id: string,
    req: Request,
      
  ) {
    try {
      const newFolder = await this.foldersRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('folderName')) {
        newFolder.folderName = req.body['folderName'];
      }
      if (req.body.hasOwnProperty('folderType')) {
        newFolder.folderType = req.body['folderType'];
      }
      if (req.body.hasOwnProperty('description')) {
        newFolder.description = req.body['description'];
      }
      if (req.body.hasOwnProperty('icon')) {
        newFolder.icon = req.body['icon'];
      }
      if (req.body.hasOwnProperty('subFolder')) {
        newFolder.subFolder = req.body['subFolder'];
      }
      if (req.body.hasOwnProperty('parentFolder')) {
        newFolder.parentFolder = req.body['parentFolder'];
      }
      newFolder.modifiedAt = new Date(Date.now());
      return await this.foldersRepository.save(newFolder);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteFolderById(id: string     ) {
    try {
      const folder = await this.foldersRepository.findOneOrFail({
        where: { id: id },
      });
      await this.foldersRepository.remove(folder);
      const document = await this.documentsRepository.find({
        where: { folderId: id },
      });
      for (let i = 0; i < document.length; i++) {
        await this.documentsRepository.remove(document[i]);
      }
      const folders = await this.foldersRepository.find();
      for (let i = 0; i < folders.length; i++) {
        if (folders[i].path.length != 0 && folders[i].path.includes(id)) {
          await this.foldersRepository.remove(folders[i]);
          const documents = await this.documentsRepository.find({
            where: { folderId: folders[i].id },
          });
          for (let i = 0; i < documents.length; i++) {
            await this.documentsRepository.remove(documents[i]);
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDocuments(req: Request,companyId: string) {
    try {
      const documents = [];
      for (let i = 0; i < req.body.files.length; i++) {
        const newDocument = await this.documentsRepository.findOne({
          where: { id: req.body.files[i] },
        });
        newDocument.folderId = req.body.folderId;
        newDocument.employeeId = req.body.employeeId;
        newDocument.uploaderId = req.body.uploaderId;
        newDocument.share = req.body.share;
        newDocument.companyId = companyId;
        await this.timeTrackingService.activityTrackingFunction(req.headers,newDocument.employeeId, 'ADD', 'FILES', 'DOCUMENT', '', '', '', newDocument, newDocument.companyId);
        documents.push(newDocument);
      }
      return await this.documentsRepository.save(documents);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postDuplicateDocuments(files: Array<Express.Multer.File>, id: string, req: Request) {
    try {
      const company = await this.APIService.getCompanyById(req.body.companyId);
      const documentIds = [];
      for (let i = 0; i < files.length; i++) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = files[i].mimetype.split('/')[1];
        const originalName = files[i].originalname.split('.')[0];
        files[i].originalname=originalName + '-' + uniqueSuffix + '.' + fileExtension;
        let s3Response = await this.s3Service.uploadDocument(files[i], company.companyName);
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const format = files[i].originalname.split('.').slice(-1).toString();
        const fileName = files[i].originalname;
        const fileLink = s3Response["key"];
        const companyId = id;
        const fileSize = files[i].size.toString();
        const newDocument = this.documentsRepository.create({
          type: "documents",
          createdAt,
          modifiedAt,
          fileLink,
          format,
          companyId,
          fileName,
          fileSize
        });
        const savedDocument = await this.documentsRepository.save(newDocument);
        documentIds.push(savedDocument.id);
      }
       return (documentIds);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDocumentsByEmployeeId(
    id: string,
      
  ) {
    try {
      const documents = await this.documentsRepository.find({
        where: { employeeId: id, type: "documents" },
      });
       return (documents);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getDocumentsById(
    id: string,
      
  ) {
    try {
      const documents = await this.documentsRepository.find({
        where: { id: id },
      });
       return (documents);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDocuments(
      companyId: string
  ) {
    try {
      const documents = await this.documentsRepository.find({where: { companyId: companyId, type: "documents" }});
       return (documents);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDocumentById(
      id: string
  ) {
    try {
      const document = await this.documentsRepository.findOne({where: { id:id }});
       return (document);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDocumentsCountByEmployeeId(
    id: string,
    companyId: string  
  ) {
    try {
      const foldersAll = await this.foldersRepository.find({ where: {companyId: companyId ,type: "documentsFolders" }});
      const documentsAll = await this.documentsRepository.find({ where: { companyId: companyId }, });
      const folderdetails = [];
      if (foldersAll.length != 0) {
        for (let i = 0; i < foldersAll.length; i++) {
          const jsonRes = {};
          let allEmployees = [];
          let allFilesCount = 0;

          const directSubFolders = foldersAll.filter((folder) => folder.parentFolder === foldersAll[i].id);
          const directSubFoldersCount = directSubFolders.length;
          const directSubDocuments = documentsAll.filter((document) => document.folderId === foldersAll[i].id);
          const directSubDocumentsOfEmployee = documentsAll.filter((document) => document.folderId === foldersAll[i].id && document.employeeId === id);
          const directSharedSubDocumentsOfEmployee = documentsAll.filter((document) => document.folderId === foldersAll[i].id && document.employeeId === id && document.share === true);
          
          const directSubDocumentsCount = directSubDocuments.length;
          const directSubDocumentsOfEmployeeCount =
            directSubDocumentsOfEmployee.length;
          const directSharedSubDocumentsOfEmployeeCount =
            directSharedSubDocumentsOfEmployee.length;

          for (let i = 0; i < directSubDocuments.length; i++) {
            allEmployees.push(directSubDocuments[i].employeeId);
          }
          for (let j = 0; j < foldersAll.length; j++) {
            if (foldersAll[j].path.includes(foldersAll[i].id)) {
              const documents = documentsAll.filter((document) => document.folderId === foldersAll[i].id);
              for (let k = 0; k < documents.length; k++) {
                allFilesCount++;
                allEmployees.push(documents[k].employeeId);
              }
            }
          }
          allEmployees = [...new Set(allEmployees)];
          jsonRes['folderId'] = foldersAll[i].id;
          jsonRes['itemCount'] =
            directSubFoldersCount + directSubDocumentsOfEmployeeCount;
          jsonRes['sharedItemCount'] =
            directSubFoldersCount + directSharedSubDocumentsOfEmployeeCount;
          jsonRes['filesCount'] = directSubDocumentsCount + allFilesCount;
          jsonRes['employessCount'] = allEmployees.length;
          folderdetails.push(jsonRes);
        }
      }
       return (folderdetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getSharedDocumentsByEmployeeId(
    id: string,
    companyId: string  
  ) {
    try {
      const documents = await this.documentsRepository.find({ where: { employeeId: id, share: true, type: "documentsFolders", companyId: companyId }, });
      const folders = await this.foldersRepository.find({ where: { companyId: companyId }, });
      const folderIdList = [];
      const fileIdList = [];  
      if (documents.length != 0) {
        for (let i = 0; i < documents.length; i++) {
          fileIdList.push(documents[i].id);
          const folder = folders.find((folder) => folder.id === documents[i].folderId);
          if (folder.path != null) {
            for (let i = 0; i < folder.path.length; i++) {
              folderIdList.push(folder.path[i]);
            }
            folderIdList.push(documents[i].folderId);
          } else {
            folderIdList.push(documents[i].folderId);
          }
        }
        const uniqueFolderIdList = [...new Set(folderIdList)];
        const uniqueFileIdList = [...new Set(fileIdList)];
        var jsonRes = {};
        jsonRes['employeeId'] = id;
        jsonRes['showDocuments'] = true;
        jsonRes['folderIdList'] = uniqueFolderIdList;
        jsonRes['fileIdList'] = uniqueFileIdList;
         return (jsonRes);
      } else {
        const uniqueFolderIdList = [...new Set(folderIdList)];
        const uniqueFileIdList = [...new Set(fileIdList)];
        var jsonRes = {};
        jsonRes['employeeId'] = id;
        jsonRes['showDocuments'] = false;
        jsonRes['folderIdList'] = uniqueFolderIdList;
        jsonRes['fileIdList'] = uniqueFileIdList;
         return (jsonRes);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getSharedDocumentsForFolders(companyId: string) {
    try {
      
      const documents = await this.documentsRepository.find({where: { companyId: companyId}});
      //console.log("Documents:", documents);
      const folders = await this.foldersRepository.find({where: { companyId: companyId, type: "documentsFolders" }});
      //console.log("Folders:", folders);
      
      const results = [];
  
      for (const document of documents) {
        const folder = folders.find((f) => f.id === document.folderId);
        
        if (folder) {
          results.push({
            id: document.id,
            file:document.fileName,
            format:document.format,
            link:document.fileLink,
            size:document.fileSize,
            folderName: folder.folderName,
            
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error fetching shared documents for folders', HttpStatus.BAD_REQUEST);
    }
  }
  
  
  

  async getDocumentsByFolderId(
    id: string,
    
  ) {
    try {
      const documents = await this.documentsRepository.find({
        where: { folderId: id },
      });
       return (documents);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteDocumentById(
    req: Request,
    id: string,
      

  ) {
    try {
      const document = await this.documentsRepository.findOneOrFail({
        where: { id: id },
      });
      if (document.employeeId) {
        await this.timeTrackingService.activityTrackingFunction(req.headers,document.employeeId, 'DELETE', 'FILES', 'DOCUMENT', '', '', '', document, document.companyId);
      }
      await this.documentsRepository.remove(document);

      const s3 = new AWS.S3
          ({
              accessKeyId: process.env.AWS_S3_ACCESS_KEY,
              secretAccessKey: process.env.AWS_S3_KEY_SECRET,
          });
      var key = (document.fileLink).replace(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,'');
      var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };
      s3.deleteObject(params).promise();
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDocumentsById(
    id: string,
    req: Request,
      
  ) {
    try {
      let action;
      let data;
      let employeeId;
      const newDocument = await this.documentsRepository.findOneOrFail({
        where: { id: id },
      });
      const oldDocument = newDocument;
      //activity tracking
      if (newDocument.employeeId === null || newDocument.employeeId === '') {
        action = 'ADD'
      }
      else {
        action = 'EDIT'
      }
      if (req.body.hasOwnProperty('fileName')) {
        newDocument.fileName =
          req.body['fileName'] +
          '-' +
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9);

          const oldfileLink = newDocument.fileLink;
          newDocument.fileLink = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/documents/` + newDocument.fileName + '.' + newDocument.format;
          const oldPath = path.resolve(__dirname, oldfileLink);
          const newPath = path.resolve(__dirname, newDocument.fileLink);
          fs.rename(oldPath, newPath, () => { });
      }
      if (req.body.hasOwnProperty('employeeId')) {
        newDocument.employeeId = req.body['employeeId'];
        employeeId = req.body['employeeId'];
      }
      else {
        employeeId = '';
      }
      if (req.body.hasOwnProperty('uploaderId')) {
        newDocument.uploaderId = req.body['uploaderId'];
      }
      if (req.body.hasOwnProperty('share')) {
        newDocument.share = req.body['share'];
      }
      newDocument.modifiedAt = new Date(Date.now());
      if (action === 'EDIT') {
        data = {
          new:newDocument,
          old:oldDocument
        }
      }
      else {
        data = newDocument;
      }
      
      await this.timeTrackingService.activityTrackingFunction(req.headers,employeeId, action, 'FILES', 'DOCUMENT', '', '', '', data, newDocument.companyId);
      return await this.documentsRepository.save(newDocument);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async putDeleteMultipleDocumentsById(
    req: Request,
      
  ) {
    try {
      for (let i = 0; i < req.body.documentIdList.length; i++) {
        const document = await this.documentsRepository.findOneOrFail({
          where: { id: req.body.documentIdList[i] },
        });
        await this.timeTrackingService.activityTrackingFunction(req.headers,document.employeeId, 'DELETE', 'FILES', 'DOCUMENT', '', '', '', document, document.companyId);
        await this.documentsRepository.remove(document);
        const s3 = new AWS.S3
        ({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY,
            secretAccessKey: process.env.AWS_S3_KEY_SECRET,
        });
        var key = (document.fileLink).replace(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,'');
        var params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key
      };
      s3.deleteObject(params).promise();
        }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putMoveMultipleDocumentsById(
    req: Request,
      
  ) {
    try {
      for (let i = 0; i < req.body.documentIdList.length; i++) {
        const document = await this.documentsRepository.findOneOrFail({
          where: { id: req.body.documentIdList[i] },
        });
        const newfolder = await this.foldersRepository.findOne({
          where: { id: req.body.folderId },
        });
        document.folderId = req.body.folderId;
        document.modifiedAt = new Date(Date.now());
        return await this.documentsRepository.save(document);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  
  
}
