import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { Repository } from 'typeorm';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  async uploadDocument(file, companyName) {
    const originalname = `${companyName}/documents/` + file.originalname;
    const res = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
    return res;
  }

  async uploadCandidateDocument(file, companyName) {
    const originalname = `${companyName}/hiringDocuments/` + file.originalname;
    const res = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
    return res;
  }

  async uploadFile(file, companyName) {
    const originalname = `${companyName}/files/` + file.originalname;
    const res = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
    return res;
  }

  async uploadUserProfiles(file, companyName) {
    const originalname = `${companyName}/userprofiles/` + file.originalname;
    const res = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
    return res;
  }

  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'us-east-1',
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {}
  }
  async getDocumentLink(key) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    };
    try {
      return await this.s3.getSignedUrlPromise('getObject', params);
    }
    catch (e) {
      console.log(e);
      throw new HttpException('cannot get url!', HttpStatus.BAD_REQUEST);
    }
  }
  async getLogoLink(key) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    };
    try {
      await this.s3.headObject(params).promise();
      return await this.s3.getSignedUrlPromise('getObject', params);
    }
    catch (e) {
      params.Key = process.env.DEFAULT_COMPANY_LOGO;
      return await this.s3.getSignedUrlPromise('getObject', params);
    }
  }
  async deleteCompanyFolder(companyName: string) {
    // Specify the bucket name and folder (prefix) you want to delete
    const bucketName = process.env.AWS_S3_BUCKET;
    const folderToDelete = companyName + '/'; // Include the trailing slash

    // List objects in the folder
    this.s3.listObjects(
      { Bucket: bucketName, Prefix: folderToDelete },
      (err, data) => {
        if (err) {
          console.error('Error listing objects:', err);
          return;
        }

        // Create an array of object keys to delete
        const objectsToDelete = data.Contents.map((object) => ({
          Key: object.Key,
        }));
        console.log(objectsToDelete);

        // Delete the objects
        this.s3.deleteObjects(
          {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: { Objects: objectsToDelete },
          },
          (deleteErr, deleteData) => {
            if (deleteErr) {
              console.error('Error deleting objects:', deleteErr);
            } else {
              console.log('Successfully deleted objects:', deleteData);
            }
          },
        );
      },
    );
  }
}
