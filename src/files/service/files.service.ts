
import { S3Service } from '../../s3/service/service';
import { TimeTrackingService } from '../../time-tracking/time-tracking.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
import { Folders } from '@flows/allEntities/newFolders.entity';

const fs = require('fs');
const path = require('path');
const dirTree = require('directory-tree');

@Injectable()
export class FilesService {
  constructor(
    private s3Service: S3Service,
    private timeTrackingService: TimeTrackingService,
    private readonly APIService: APIService,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmFiles) private filesRepository: Repository<HrmFiles>,
    @InjectRepository(HrmFolders) private foldersRepository: Repository<HrmFolders>,
    @InjectRepository(Files) private filessRepository: Repository<Files>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // async postFolders(req: Request, companyId: string) {
  //   try {
  //     const folderName = req.body.folderName;
  //     const folderType = req.body.folderType;
  //     const sharedWith = [];
  //     const sharedWithAll = false;
  //     const createdAt = new Date(Date.now());
  //     const modifiedAt = new Date(Date.now());
  //     const newFolder = this.foldersRepository.create({
  //       type: "filesFolders",
  //       folderName,
  //       folderType,
  //       createdAt,
  //       modifiedAt,
  //       sharedWith,
  //       sharedWithAll,
  //       companyId,
  //     });
  //     return await this.foldersRepository.save(newFolder);
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async getFolders(companyId: string) {
  //   try {
  //     const folders = await this.foldersRepository.find({
  //       where: { companyId: companyId, type: "filesFolders" },
  //     });
  //     return folders;
  //   } catch (error) {
  //     throw new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async getFoldersById(id: string) {
    try {
      const folder = await this.foldersRepository.findOne({
        where: { id: id },
      });
      return folder;
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
      if (req.body.hasOwnProperty('sharedWithAll')) {
        newFolder.sharedWithAll = req.body['sharedWithAll'];
        if (req.body['sharedWithAll'] == true) {
          const files = await this.filesRepository.find({
            where: { folderId: id },
          });
          for (let i = 0; i < files.length; i++) {
            files[i].sharedWithAll = true;
            await this.filesRepository.save(files[i]);
          }
        }
        if (req.body['sharedWithAll'] == false) {
          const files = await this.filesRepository.find({
            where: { folderId: id },
          });
          for (let i = 0; i < files.length; i++) {
            files[i].sharedWithAll = false;
            await this.filesRepository.save(files[i]);
          }
        }
      }
      if (req.body.hasOwnProperty('sharedWith')) {
        newFolder.sharedWith = req.body['sharedWith'];
        const files = await this.filesRepository.find({
          where: { folderId: id },
        });
        for (let i = 0; i < files.length; i++) {
          let shared = files[i].sharedWith;
          const add = newFolder.sharedWith.filter((x) => !shared.includes(x));
          const remove = shared.filter(
            (x) => !newFolder.sharedWith.includes(x),
          );
          if (add.length != 0) {
            for (let i = 0; i < add.length; i++) {
              shared.push(add[i]);
            }
          }
          if (remove.length != 0) {
            for (let i = 0; i < remove.length; i++) {
              shared.pop(remove[i]);
            }
          }
          shared = [...new Set(shared)];
          files[i].sharedWith = shared;
          await this.filesRepository.save(files[i]);
        }
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
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  // async postFiles(req: Request, companyId: string) {
  //   try {
  //     let savedDocs = []
  //     for (let i = 0; i < req.body.filesIdList.length; i++) {
  //       const newDocument = await this.filesRepository.findOne({
  //         where: { id: req.body.filesIdList[i] },
  //       });
  //       newDocument.folderId = req.body.folderId;
  //       newDocument.uploaderId = req.body.uploaderId;
  //       newDocument.sharedWith = req.body.sharedWith;
  //       newDocument.sharedWithAll = req.body.sharedWithAll;
  //       newDocument.companyId = companyId;
  //       const folder = await this.foldersRepository.findOne({
  //         where: { id: req.body.folderId },
  //       });
  //       let shared = folder.sharedWith;
  //       for (let i = 0; i < req.body.sharedWith.length; i++) {
  //         shared.push(req.body.sharedWith[i]);
  //       }
  //       shared = [...new Set(shared)];
  //       folder.sharedWith = shared;
  //       await this.foldersRepository.save(folder);
  //       await this.timeTrackingService.activityTrackingFunction(
  //         req.headers,
  //         '',
  //         'ADD',
  //         'FILES',
  //         'FILE',
  //         '',
  //         '',
  //         '',
  //         newDocument,
  //         newDocument.companyId,
  //       );
  //       const savedDoc = await this.filesRepository.save(newDocument);
  //       savedDocs.push(savedDoc);
  //     }
  //     return savedDocs;
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async postDuplicateFiles(files: Array<Express.Multer.File>, id, req) {
    try {
      const employee = await this.employeeDetailsRepository.findOne({
        where: { employeeId: req['userid'], status: Not('Non Active') },
      });
      const company = await this.APIService.getCompanyById(employee.companyId);
      const documentIds = [];
      for (let i = 0; i < files.length; i++) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = files[i].mimetype.split('/')[1];
        const originalName = files[i].originalname.split('.')[0];
        files[i].originalname =
          originalName + '-' + uniqueSuffix + '.' + fileExtension;
        let s3Response = await this.s3Service.uploadFile(
          files[i],
          company.companyName,
        );
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const format = files[i].originalname.split('.').slice(-1).toString();
        const fileName = files[i].originalname;
        const fileSize = files[i].size.toString();
        const fileLink = s3Response['key'];
        const companyId = id;
        const newDocument = this.filesRepository.create({
          type: "files",
          createdAt,
          modifiedAt,
          fileLink,
          format,
          fileName,
          fileSize,
          companyId,
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

  // async getFiles(companyId: string) {
  //   try {
  //     const files = await this.filesRepository.find({
  //       where: { companyId: companyId, type: 'files' },
  //     });
  //     return files;
  //   } catch (error) {
  //     throw new HttpException('error!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async getSharedFilessByEmployeeId(id: string) {
    try {
      const documents = await this.filesRepository.find({where: {type: 'files'}});
      const folderIdList = [];
      const fileIdList = [];
      for (let i = 0; i < documents.length; i++) {
        if (
          documents[i].sharedWith && (
          documents[i].sharedWith.includes(id) ||
          documents[i].sharedWithAll
        )) {
          fileIdList.push(documents[i].id);
          folderIdList.push(documents[i].folderId);
        }
      }
      if (fileIdList.length != 0) {
        const uniqueFolderIdList = [...new Set(folderIdList)];
        const uniqueFileIdList = [...new Set(fileIdList)];
        var jsonRes = {};
        jsonRes['employeeId'] = id;
        jsonRes['showFiles'] = true;
        jsonRes['folderIdList'] = uniqueFolderIdList;
        jsonRes['fileIdList'] = uniqueFileIdList;
        return jsonRes;
      } else {
        var jsonRes = {};
        jsonRes['employeeId'] = id;
        jsonRes['showFiles'] = false;
        jsonRes['folderIdList'] = [];
        jsonRes['fileIdList'] = [];
        return jsonRes;
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  async deleteFileById(id: string, req: Request) {
    try {
      const file = await this.filesRepository.findOneOrFail({
        where: { id: id },
      });
      await this.timeTrackingService.activityTrackingFunction(
        req.headers,
        '',
        'DELETE',
        'FILES',
        'FILE',
        '',
        '',
        '',
        file,
        file.companyId,
      );
      await this.filesRepository.remove(file);
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      });
      var key = file.fileLink.replace(
        `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
        '',
      );
      var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      };
      s3.deleteObject(params).promise();
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putFilesById(id: string, req: Request) {
    try {
      let action;
      let data;
      const newFile = await this.filesRepository.findOneOrFail({
        where: { id: id },
      });
      const oldFile = newFile;
      //activity tracking
      if (newFile.uploaderId === null || newFile.uploaderId === '') {
        action = 'ADD';
      } else {
        action = 'EDIT';
      }
      if (req.body.hasOwnProperty('fileName')) {
        newFile.fileName =
          req.body['fileName'] +
          '-' +
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9);
      }
      if (req.body.hasOwnProperty('uploaderId')) {
        newFile.uploaderId = req.body['uploaderId'];
      }
      if (req.body.hasOwnProperty('sharedWith')) {
        const folder = await this.foldersRepository.findOne({
          where: { id: newFile.folderId },
        });
        let folderShared = folder.sharedWith;
        const oldFileShared = newFile.sharedWith;
        const newFileShared = req.body['sharedWith'];
        const add = newFileShared.filter((x) => !oldFileShared.includes(x));
        const remove = oldFileShared.filter((x) => !newFileShared.includes(x));
        const notRemove = [];
        if (add.length != 0) {
          for (let i = 0; i < add.length; i++) {
            folderShared.push(add[i]);
          }
        }
        if (remove.length != 0) {
          const files = await this.filesRepository.find();
          for (let i = 0; i < remove.length; i++) {
            for (let j = 0; j < files.length; j++) {
              if (files[j].sharedWith.includes(remove[i])) {
                notRemove.push(remove[i]);
                break;
              }
            }
          }
          if (notRemove.length != 0) {
            const actualRemove = remove.filter((x) => !notRemove.includes(x));
            for (let i = 0; i < actualRemove.length; i++) {
              folderShared.pop(actualRemove[i]);
            }
          } else {
            for (let i = 0; i < remove.length; i++) {
              folderShared.pop(remove[i]);
            }
          }
        }

        folderShared = [...new Set(folderShared)];
        folder.sharedWith = folderShared;
        await this.foldersRepository.save(folder);
        newFile.sharedWith = req.body['sharedWith'];
      }
      if (req.body.hasOwnProperty('sharedWithAll')) {
        newFile.sharedWithAll = req.body['sharedWithAll'];
      }
      const oldfileLink = newFile.fileLink;
      const arr = newFile.fileLink.split('.');
      const company = await this.APIService.getCompanyById(newFile.companyId);
      newFile.fileLink =
        `${company.companyName}/files/` +
        newFile.fileName +
        '.' +
        arr[1];
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      });

      var BUCKET_NAME = process.env.AWS_S3_BUCKET;
      var oldKey = oldfileLink.replace(
        `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
        '',
      );
      var newKey = newFile.fileLink.replace(
        `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
        '',
      );
      newFile.fileName = newFile.fileName + '.' + arr[1];

      s3.copyObject({
        Bucket: BUCKET_NAME,
        CopySource: encodeURI(`${process.env.AWS_S3_BUCKET}/` + oldKey),
        Key: newKey,
      })
        .promise().catch((e) => console.error(e));
      newFile.modifiedAt = new Date(Date.now());
      if (action === 'EDIT') {
        data = {
          new: newFile,
          old: oldFile,
        };
      } else {
        data = newFile;
      }

      await this.timeTrackingService.activityTrackingFunction(
        req.headers,
        '',
        action,
        'FILES',
        'FILE',
        '',
        '',
        '',
        data,
        newFile.companyId,
      );
      return await this.filesRepository.save(newFile);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putDeleteMultipleFilesById(req: Request) {
    try {
      for (let i = 0; i < req.body.fileIdList.length; i++) {
        const file = await this.filesRepository.findOneOrFail({
          where: { id: req.body.fileIdList[i] },
        });
        await this.timeTrackingService.activityTrackingFunction(
          req.headers,
          '',
          'DELETE',
          'FILES',
          'FILE',
          '',
          '',
          '',
          file,
          file.companyId,
        );
        await this.filesRepository.remove(file);
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.AWS_S3_KEY_SECRET,
        });
        var key = file.fileLink.replace(
          `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
          '',
        );
        var params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        };
        s3.deleteObject(params).promise();
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postFolders(req) {
    try {
        const folder = new Folders();
        folder.companyId = req.body.companyId;
        folder.parentFolderId = req.body.parentFolderId;
        folder.name = req.body.name;
        folder.access = req.body.access;
        folder.type = req.body.type;
        const savedFolder = await this.dataSource.getRepository(Folders).save(folder);
        return savedFolder;
    } catch (error) {
        console.log('post Folders',error);
    }
}
async getFolders(companyId: string, employeeId: string, id: string, all: boolean, from: number, to: number) {
    try {
        let paramNum = 1;
        const paramArray = [companyId];
        let query = 'SELECT * FROM folders WHERE "companyId"=$1 '
        if (employeeId) {
            query = query + `AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text("access"::jsonb->'employeeIds') AS elem
                WHERE elem = '${employeeId}'
            )
               OR EXISTS (
                SELECT 1 WHERE ("access"->>'all')::boolean = TRUE
            )`
        }
        if (id) {
            paramNum ++;
            query = query + `AND "id"=$${paramNum} `;
            paramArray.push(id);
        }
        if (from && to) {
            query = query + `ORDER BY "createdAt" DESC
            LIMIT ${to} - ${from} + 1
            OFFSET ${from}`; 
        }
        const Folders = await this.dataSource.query(query,paramArray,);
        return {
            total: await this.dataSource.query(`SELECT COUNT(*) FROM folders WHERE "companyId"='${companyId}'`),
            code: 200,
            Folders
        }
    } catch (error) {
        console.log('post Folders',error);
    }
}
async putFolders(folder) {
    try {
        await this.dataSource.getRepository(Folders).save(folder);
    } catch (error) {
        console.log('put Folders',error);
    }
}
async deletefolder(id: string) {
    try {
        await this.dataSource.getRepository(Folders).createQueryBuilder().delete().where({ id: id }).execute();
        const files: Files[] = await this.dataSource.query(`SELECT * FROM files WHERE "folderId"='${id}'`);
        for (let i=0; i<files.length; i++) {
            const s3 = new AWS.S3({
                accessKeyId: process.env.AWS_S3_ACCESS_KEY,
                secretAccessKey: process.env.AWS_S3_KEY_SECRET,
              });
              var key = files[i].link.replace(
                `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
                '',
              );
              var params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
              };
              s3.deleteObject(params).promise();
        }
    } catch (error) {
        console.log('delete Folders',error);
    }
}
async postFiles(req) {
  try {
      const res = [];
     const fileIds: string[] = req.body.fileIds;
     for (let i=0;i<fileIds.length;i++) {
      const file: Files = await this.dataSource.query(`SELECT * FROM files WHERE id='${fileIds[i]}'`).then(res=> res[0]);
      file.companyId = req.body.companyId;
      file.folderId = req.body.folderId;
      file.access =  {
          all: false,
          employeeIds: [req.headers['userid']]
        }
      const savedFile = await this.dataSource.getRepository(Files).save(file);
      res.push(savedFile);
     } 
     return res;
  } catch (error) {
      console.log('post files',error);
  }
}
async postUploadFiles(files: Array<Express.Multer.File>, req: Request) {
  try {
    const fileIds: string[] = [];
    const companyId = req.body.companyId;
    const company = await this.APIService.getCompanyById(companyId);
    for (let i = 0; i < files.length; i++) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = files[i].mimetype.split('/')[1];
      const originalName = files[i].originalname.split('.')[0];
      files[i].originalname=originalName + '-' + uniqueSuffix + '.' + fileExtension;
      let s3Response = await this.s3Service.uploadDocument(files[i], company.companyName);
      const file = new Files();
      file.companyId = companyId;
      file.format = files[i].originalname.split('.').slice(-1).toString();
      file.name = files[i].originalname;
      file.link = s3Response["key"];
      file.size = files[i].size.toString();
      file.access = {
          all: false,
          employeeIds: [req.headers['userid'] as string]
      };
      const savedFile = await this.dataSource.getRepository(Files).save(file);
      fileIds.push(savedFile.id);
    }
     return {fileIds};
  } catch (error) {
    console.log('upload files', error);
  }
}
async getFiles(companyId: string, employeeId: string, folderId: string, type: string, id: string, all: boolean, from: number, to: number) {
  try {
      let paramNum = 1;
      const paramArray = [companyId];
      let query = 'SELECT * FROM files WHERE "companyId"=$1 '
      if (employeeId) {
          query = query + `AND EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text("access"::jsonb->'employeeIds') AS elem
              WHERE elem = '${employeeId}'
          )
             OR EXISTS (
              SELECT 1 WHERE ("access"->>'all')::boolean = TRUE
          )`
      }
      if (folderId) {
          paramNum ++;
          query = query + `AND "folderId"=$${paramNum} `;
          paramArray.push(folderId);
      }
      if (type) {
          paramNum ++;
          query = query + `AND "type"=$${paramNum} `;
          paramArray.push(type);
      }
      if (id) {
          paramNum ++;
          query = query + `AND "id"=$${paramNum} `;
          paramArray.push(id);
      }
      if (from && to) {
          query = query + `ORDER BY "createdAt" DESC
          LIMIT ${to} - ${from} + 1
          OFFSET ${from}`; 
      }
      const files = await this.dataSource.query(query,paramArray,);
      return ({
          total: await this.dataSource.query(`SELECT COUNT(*) FROM files WHERE "companyId"='${companyId}'`),
          code: 200,
          files: files
      })
  } catch (error) {
      console.log('post files',error);
  }
}
async getFilesSearch(companyId: string) {
  try {
    const files = await this.filessRepository.find({where: { companyId: companyId }});
    // console.log(files)
       return (files); 
    /* const files = await this.dataSource.query(`SELECT * FROM files WHERE "companyId"='${companyId}'`);
      return files; */
  } catch (error) {
      console.log('post files',error);
  }
}
async putFiles(file) {
  try {
      await this.dataSource.getRepository(Files).save(file);
  } catch (error) {
      console.log('put files',error);
  }
}
async deleteFile(id: string) {
  try {
      const file: Files = await this.dataSource.query(`SELECT * FROM files WHERE "id"='${id}'`).then((res) => res[0])
      if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

      await this.dataSource.getRepository(Files).createQueryBuilder().delete().where({ id: id }).execute();
      
      const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.AWS_S3_KEY_SECRET,
        });
        var key = file.link.replace(
          `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
          '',
        );
        var params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        };
        s3.deleteObject(params).promise();
  } catch (error) {
      console.log('delete files',error);
  }
}
async getSignedUrl(key) {
  const url = await this.s3Service.getDocumentLink(key);
  return { url: url };
}
async getLogoUrl(key) {
  const url = await this.s3Service.getLogoLink(key);
  return { url: url };
}
}
