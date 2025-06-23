import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmergencyContactsService {
  constructor(
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
  ) {}

  async postEmergencyContacts(req: Request,  companyId: string) {
    try {
      const contacts = req.body['contacts'];
      contacts['id'] = uuidv4();
      const employeeId = req.body['employeeId'];
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: employeeId,status: Not('Non Active')}});
      
      if(contacts["primary"]){
        employeeDetails.emergencyContacts = employeeDetails.emergencyContacts.map((item)=> {
          if(item.primary){
            item.primary = false
          }
          return item
        });
      }
      employeeDetails.emergencyContacts = [...employeeDetails.emergencyContacts, contacts]
      await this.employeeDetailsRepository.save(employeeDetails);
      return contacts;
    } catch (error) {
      console.log(error)
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    
    }
  }

  async getEmergencyContacts( companyId: string) {
    const employees = [];
    try {
      const employeeDetails = await this.employeeDetailsRepository.find({ where: { companyId: companyId, status: Not('Non Active') } });
      for (let i = 0; i < employeeDetails.length; i++) {
        const employee = {
          employeeId: employeeDetails[i].employeeId,
          contacts: employeeDetails[i].emergencyContacts,
        };
        employees.push(employee);
      }
       return (employees);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getEmergencyContactsById(
    id: string,
  ) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: id, status: Not('Non Active') } });
      const employee = {};
      employee['contacts'] = employeeDetails.emergencyContacts;
      employee['employeeId'] = id;
       return (employee);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putEmergencyContactsById(
    body: Body,
    id: string,
    employeeId: string 
      
  ) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: employeeId, status: Not('Non Active')}});
      const contact = body;
      employeeDetails.emergencyContacts = employeeDetails.emergencyContacts.filter((contact) => contact.id !== id);
      if(body["primary"] === true){
        employeeDetails.emergencyContacts = employeeDetails.emergencyContacts.map((item)=> {
          if(item.primary === true){
            item.primary = false
          }
          return item
        });
      }
      employeeDetails.emergencyContacts.push(contact);
      return await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEmergencyContactById(
    id: string,
    employeeId: string  
  ) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: employeeId, status: Not('Non Active')}});
      employeeDetails.emergencyContacts = employeeDetails.emergencyContacts.filter((contact) => contact.id !== id);
      await this.employeeDetailsRepository.save(employeeDetails);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
