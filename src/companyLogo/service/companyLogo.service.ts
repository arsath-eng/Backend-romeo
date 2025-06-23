import { S3Service } from '../../s3/service/service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import * as fs from 'fs';
const path = require('path');
const dirTree = require('directory-tree');
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { SpecialUserDto } from '@flows/allDtos/specialUser.dto';

@Injectable()
export class CompanyLogoService {
  constructor(
    @InjectRepository(HrmFolders)
    private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(HrmFiles)
    private filesRepository: Repository<HrmFiles>,
    private s3Service: S3Service,
    private readonly APIService: APIService,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async postFolders(req: Request, companyId: string) {
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
        type: 'companyLogoFolders',
        folderName,
        folderType,
        description,
        icon,
        createdAt,
        modifiedAt,
        subFolder,
        parentFolder,
        path,
        companyId,
      });
      return await this.foldersRepository.save(newFolder);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getFolders(companyId: string) {
    try {
      const folders = await this.foldersRepository.find({
        where: { companyId: companyId, type: 'companyLogoFolders' },
      });
      return folders;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putFolderById(id: string, req: Request) {
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

  async deleteFolderById(id: string) {
    try {
      const folder = await this.foldersRepository.findOneOrFail({
        where: { id: id },
      });
      await this.foldersRepository.remove(folder);
      const document = await this.filesRepository.find({
        where: { folderId: id },
      });
      for (let i = 0; i < document.length; i++) {
        await this.filesRepository.remove(document[i]);
      }
      const folders = await this.foldersRepository.find();
      for (let i = 0; i < folders.length; i++) {
        if (folders[i].path.length != 0 && folders[i].path.includes(id)) {
          await this.foldersRepository.remove(folders[i]);
          const documents = await this.filesRepository.find({
            where: { folderId: folders[i].id },
          });
          for (let i = 0; i < documents.length; i++) {
            await this.filesRepository.remove(documents[i]);
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postDocuments(req: Request, companyId: string) {
    try {
      let documents = [];
      for (let i = 0; i < req.body.files.length; i++) {
        const newDocument = await this.filesRepository.findOne({
          where: { id: req.body.files[i] },
        });
        newDocument.folderId = req.body.folderId;
        newDocument.employeeId = req.body.employeeId;
        newDocument.uploaderId = req.body.uploaderId;
        newDocument.share = req.body.share;
        newDocument.companyId = companyId;
        documents.push(newDocument);
      }
      return await this.filesRepository.save(documents);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postDuplicateDocuments(files: Array<Express.Multer.File>, req: Request) {
    try {
      const company = await this.APIService.getCompanyById(req.body.companyId);
      const documentIds = [];
      for (let i = 0; i < files.length; i++) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = files[i].mimetype.split('/')[1];
        const originalName = files[i].originalname.split('.')[0];
        files[i].originalname =
          originalName + '-' + uniqueSuffix + '.' + fileExtension;
        let s3Response = await this.s3Service.uploadDocument(
          files[i],
          company.companyName,
        );
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const format = files[i].originalname.split('.').slice(-1).toString();
        const fileName = files[i].originalname;
        const fileLink = s3Response['key'];
        const newDocument = this.filesRepository.create({
          type: 'companyLogo',
          createdAt,
          modifiedAt,
          fileLink,
          format,
          fileName,
        });
        const savedDocument = await this.filesRepository.save(newDocument);
        documentIds.push(savedDocument.id);
      }
      return documentIds;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getDocuments(companyId: string) {
    try {
      const documents = await this.filesRepository.find({
        where: { companyId: companyId, type: 'companyLogo' },
      });
      for (let i = 0; i < documents.length; i++) {
        const array = documents[i].fileLink.split(
          `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
        );
        documents[i].fileLink = array[1];
      }
      return documents;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteDocumentById(id: string) {
    try {
      const document = await this.filesRepository.findOneOrFail({
        where: { id: id },
      });
      await this.filesRepository.remove(document);
      const desiredPath = path.resolve(__dirname, document.fileLink);

      fs.unlinkSync(desiredPath);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDocumentsById(id: string, req: Request) {
    try {
      const newDocument = await this.filesRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('fileName')) {
        newDocument.fileName =
          req.body['fileName'] +
          '-' +
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9);
      }
      if (req.body.hasOwnProperty('employeeId')) {
        newDocument.employeeId = req.body['employeeId'];
      }
      if (req.body.hasOwnProperty('uploaderId')) {
        newDocument.uploaderId = req.body['uploaderId'];
      }
      if (req.body.hasOwnProperty('share')) {
        newDocument.share = req.body['share'];
      }
      const oldfileLink = newDocument.fileLink;
      newDocument.fileLink =
        '../../../public/assets/documents/' +
        newDocument.fileName +
        '.' +
        newDocument.format;
      const oldPath = path.resolve(__dirname, oldfileLink);
      const newPath = path.resolve(__dirname, newDocument.fileLink);
      fs.rename(oldPath, newPath, () => {});
      newDocument.modifiedAt = new Date(Date.now());
      return await this.filesRepository.save(newDocument);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
