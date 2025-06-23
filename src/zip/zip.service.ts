import { Injectable } from '@nestjs/common';
const AWS = require('aws-sdk');
const fs = require('fs');
const archiver = require('archiver');
import {DataSource} from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { filesDto } from '@flows/files/dto/files.dto';

@Injectable()
export class ZipService {
    constructor(@InjectDataSource() private dataSource: DataSource,) {}
    async generateZip(fileIdArray: String[], companyId: string) {
        const keys = []
        const files: filesDto[] = await this.dataSource.query(`SELECT * FROM hrm_files WHERE "companyId" = $1`,[companyId]);
        for (let i=0;i<files.length;i++) {
            if (fileIdArray.includes(files[i].id)) {
                keys.push(files[i].fileLink);
            }
        }
        // Configure the AWS SDK
        AWS.config.update({ region: process.env.AWS_S3_REGION });

        // Create an S3 service object
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY,
            secretAccessKey: process.env.AWS_S3_KEY_SECRET,
          });

        // Create a writable stream for the zip file
        const output = fs.createWriteStream('files.zip');

        // Create an archiver object
        const archive = archiver('zip', {
            zlib: { level: 9 } // Set compression level
        });

        // Pipe the output to the zip file
        archive.pipe(output);

        // List of S3 bucket keys (file paths) to download
        // Download each file from S3 and add it to the zip archive
        await Promise.all(keys.map(key => {
            return new Promise<void>((resolve, reject) => {
                s3.getObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        archive.append(data.Body, { name: key });
                        resolve();
                    }
                });
            });
        })).then(() => {
            // Finalize the zip archive       
            archive.finalize();
        }).catch(err => {
            console.error(err);
        });
        
    }
}
