import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { json } from 'stream/consumers';
import { Repository } from 'typeorm';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
@Injectable()
export class HiringEmailTemplatesService {
  constructor(
    @InjectRepository(HrmConfigs)
    private readonly commonRepository: Repository<HrmConfigs>,
  ) { }

  async postHiringEmailTemplates(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const subject = req.body.subject;
      const emailTemplate = (req.body.emailTemplate);
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newEmailTemplateData ={
          name,
          subject,
          emailTemplate,
        };
        return await this.commonRepository.save({
        type: 'hiringEmailTemplates',
        data: newEmailTemplateData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getHiringEmailTemplates( companyId: string) {
    try {
      const emailTemplates =
        await this.commonRepository.find({where: { companyId: companyId , type: "hiringEmailTemplates"}} );
      const emailTemplatesList = [];
      emailTemplates.forEach((emailTemplate) => {
        const emailTemplateObj = emailTemplate.data;
        emailTemplateObj['id'] = emailTemplate.id;
        emailTemplateObj['createdAt'] = emailTemplate.createdAt;
        emailTemplateObj['modifiedAt'] = emailTemplate.modifiedAt;
        emailTemplateObj['companyId'] = emailTemplate.companyId;
        emailTemplatesList.push(emailTemplateObj);
        }
      );
      return emailTemplatesList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getHiringEmailTemplatesById(id: string    ) {
    try {
      const emailTemplate =
        await this.commonRepository.findOne({ where: { id: id } });
        const emailTemplateObj = {
          id: emailTemplate.id,
          ...emailTemplate.data,
          createdAt: emailTemplate.createdAt,
          modifiedAt: emailTemplate.modifiedAt,
          companyId: emailTemplate.companyId,
        }
       return emailTemplateObj;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putHiringEmailTemplatesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const emailTemplate = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        emailTemplate.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('subject')) {
        emailTemplate.data.subject = req.body['subject'];
      }
      if (req.body.hasOwnProperty('emailTemplate')) {
        emailTemplate.data.emailTemplate = (req.body['emailTemplate']);
      }
      emailTemplate.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(emailTemplate);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteHiringEmailTemplatesById(
    id: string,
      
  ) {
    try {
      const emailTemplate =
        await this.commonRepository.findOneOrFail({
          where: { id: id },
        });
      await this.commonRepository.remove(emailTemplate);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
