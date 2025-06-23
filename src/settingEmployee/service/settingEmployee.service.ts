import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';

@Injectable()
export class SettingEmployeeService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private notificationRepository: Repository<HrmNotifications>,
  ) {}

  async postlicenses(req: Request) {
    try {
      const name = req.body.name;
      const companyId = req.body.companyId;
      const description = req.body.description;
      const employeeCount = req.body.employeeCount;
      const requiredDocument = req.body.requiredDocument;
      const requiredDocumentCount = req.body.requiredDocumentCount; 
      const supportFormats = req.body.supportFormats;
      const defaultReminders = req.body.defaultReminders;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const licensesData = {
        name,
        description,
        employeeCount,
        defaultReminders,
        requiredDocument,
        requiredDocumentCount,
        supportFormats
      };

      return await this.commonRepository.save({
        type: 'license',
        data: licensesData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getLicenses( companyId: string) {
    try {
      const licenses = await this.commonRepository.find({where: { companyId: companyId, type: 'license'}});
      const licensesList = [];
      const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: companyId,status: Not('Non Active')}});
      let licensInfos = allEmployeeDetails.flatMap((employee) => employee.licences);
      for (let i = 0; i < licenses.length; i++) {
        const filteredlicensesInfos = licensInfos.filter((licenseInfo) =>  licenses[i].data.name === licenseInfo.licenseType);
        licenses[i]['employeeCount'] = filteredlicensesInfos.length;
        const obj = {
          id: licenses[i].id,
          ...licenses[i].data,
          employeeCount: licenses[i]["employeeCount"],
          createdAt: licenses[i].createdAt, 
          modifiedAt: licenses[i].modifiedAt,
          companyId: licenses[i].companyId,
        };
        licensesList.push(obj);
      }
       return licensesList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putLicensesById(
    req: Request
  ) {
    try {
      const licences = await this.commonRepository.findOneOrFail({
        where: { id: req.body.id },
      });
      //console.log(licences)
      if (req.body.hasOwnProperty('change') && req.body['change'] === true) {
   
          const allEmployeeDetails = await this.employeeDetailsRepository.find({where: { companyId: licences.companyId}});
          //console.log("allEmployeeDetails",allEmployeeDetails)
          for (let i = 0; i < allEmployeeDetails.length; i++) { 
            const licensesInfo = [...allEmployeeDetails[i].licences];

            for (let j = 0; j < licensesInfo.length; j++) {
              if (licensesInfo[j].licenseType === licences.data.name) {
                licensesInfo[j].licenseType = req.body['name'];
                await this.employeeDetailsRepository.save(allEmployeeDetails[i]);
              }
            }
          } 
        
        if (req.body.hasOwnProperty('name')) {
            licences.data.name = req.body['name'];
          }

      }else {
        licences.data = {
            ...licences.data, 
            ...req.body, 
          };
          licences.type = 'license';
          licences.companyId = req.body.companyId || licences.companyId;
        }
    
        licences.modifiedAt = new Date();
        return await this.commonRepository.save(licences);
      
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteLicensesById(
    id: string,
      
  ) {
    try {
      const license = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(license);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
