import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import e, { Response } from 'express';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';

@Injectable()
export class CustomerSupportService {
  constructor(
    @InjectRepository(HrmCustomerSupport)
    private customerSupportRepository: Repository<HrmCustomerSupport>,
    @InjectRepository(HrmEmployeeDetails)
    private EmployeeRepository: Repository<HrmEmployeeDetails>,
    private readonly APIService: APIService,
  ) {}

  async getCustomerSupport(msgId: string) {
    try {
      const customerSupport = await this.customerSupportRepository.find({
        where: { msgId: msgId },
      });
      const employeeDetails = await this.EmployeeRepository.find({
        where: { companyId: customerSupport[0].companyId, status: Not('Non Active') },
      });
      for (let i = 0; i < customerSupport.length; i++) {
        if (customerSupport[i].client) {
          const Employee = employeeDetails.find(
            (employee) => employee.employeeId === customerSupport[i].senderId,
          );
          customerSupport[i]['senderName'] =
            Employee.fullName.first + ' ' + Employee.fullName.last;
          customerSupport[i]['senderProfile'] = Employee.profileImage;
        }
      }
      return customerSupport;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postCustomerSupportGlobal(req: Request) {
    try {
      let companyId = '';
      let client = req.body.client;
      let msgId = req.body.msgId;
      if (msgId === '') {
        companyId = req.body.companyId;
        msgId = uuidv4();
      }
      const msg = req.body.msg;
      const subject = req.body.subject;
      const senderId = req.body.senderId;
      const createdAt = new Date();
      const modifiedAt = new Date();
      const customerSupport = this.customerSupportRepository.create({
        msgId,
        client,
        msg,
        subject,
        senderId,
        createdAt,
        modifiedAt,
        companyId,
      });
      return await this.customerSupportRepository.save(customerSupport);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getCustomerSupportSubjects(companyId: string) {
    try {
      const customerSupport = await this.customerSupportRepository.find({
        where: { client: true, companyId: companyId },
      });
      const employeeDetails = await this.EmployeeRepository.find({
        where: { companyId: companyId, status: Not('Non Active')},
      });
      for (let i = 0; i < customerSupport.length; i++) {
        const Employee = employeeDetails.find(
          (employee) => employee.employeeId === customerSupport[i].senderId,
        );
        customerSupport[i]['senderName'] =
          Employee.fullName.first + ' ' + Employee.fullName.last;
        customerSupport[i]['senderProfile'] = Employee.profileImage;
      }
      return customerSupport;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
