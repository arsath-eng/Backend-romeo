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
import { all } from 'axios';
import { Response } from 'express';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmNotifications)
    private NotificationRepository: Repository<HrmNotifications>,
  ) {}

  async postLocations(req: Request,  companyId: string) {
    try {
      const name = req.body.name;
      const remoteAddress = req.body.remoteAddress;
      const streetOne = req.body.streetOne;
      const streetTwo = req.body.streetTwo;
      const city = req.body.city;
      const state = req.body.state;
      const zip = req.body.zip;
      const country = req.body.country;
      const timezone = req.body.timezone;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newLocationData = {
        name,
        remoteAddress,
        streetOne,
        streetTwo,
        city,
        state,
        zip,
        country,
        timezone,
      };
      return await this.commonRepository.save({
        type: 'location',
        data: newLocationData,
        companyId: companyId,
        createdAt,
        modifiedAt,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getLocations( companyId: string) {
    try {
      const locations = await this.commonRepository.find({where: { companyId: companyId ,type: 'location'}});
      if (locations.length != 0) {
        const allEmployees = await this.employeeDetailsRepository.find({
            where: { companyId: companyId ,status: Not('Non Active')},
        });
    
        const allJobInformation = allEmployees.flatMap(employee => employee.jobInformation);
    
        locations.forEach(location => {
            let count = allJobInformation.filter(jobInfo => 
                jobInfo.location == location.data.name && jobInfo.active
            ).length;
            location['count'] = count;
        });
    }
      const locationList = [];
      for(let i = 0; i < locations.length; i++){
        const locationObj = {
          id:locations[i].id,
          ...locations[i].data,
          createdAt:locations[i].createdAt,
          modifiedAt:locations[i].modifiedAt,
          companyId:locations[i].companyId,
          count:locations[i]['count']
        }
        locationList.push(locationObj)
      }
       return locationList;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putLocationsById(
    id: string,
    req: Request,
      
  ) {
    try {
      const location = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });

      if (req.body.hasOwnProperty('change')) {
        if (req.body['change'] == true) {
          const allEmployeesDetails = await this.employeeDetailsRepository.find({ where: { companyId: location.companyId,status: Not('Non Active') } });
          allEmployeesDetails.forEach(employee => {
            for (let i = 0; i < employee.jobInformation.length; i++) {
              if (employee.jobInformation[i].location == location.data.name) {
                employee.jobInformation[i].location = req.body['name'];
              }
            }
            this.employeeDetailsRepository.save(employee);
          });
        }
      }
      if (req.body.hasOwnProperty('name')) {
        location.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('remoteAddress')) {
        location.data.remoteAddress = req.body['remoteAddress'];
      }
      if (req.body.hasOwnProperty('streetOne')) {
        location.data.streetOne = req.body['streetOne'];
      }
      if (req.body.hasOwnProperty('streetTwo')) {
        location.data.streetTwo = req.body['streetTwo'];
      }
      if (req.body.hasOwnProperty('city')) {
        location.data.city = req.body['city'];
      }
      if (req.body.hasOwnProperty('state')) {
        location.data.state = req.body['state'];
      }
      if (req.body.hasOwnProperty('zip')) {
        location.data.zip = req.body['zip'];
      }
      if (req.body.hasOwnProperty('country')) {
        location.data.country = req.body['country'];
      }
      if (req.body.hasOwnProperty('timezone')) {
        location.data.timezone = req.body['timezone'];
      }
      location.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(location);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteLocationsById(
    id: string,
      
  ) {
    try {
      const location = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(location);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
