import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ApprovalsEmployeesService {
  constructor(
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
  ) {}

  async postApprovalsEmployees(req: Request,  companyId: string) {
    try {
      const employeeId = req.body.employeeId;
      const informationUpdate = req.body.informationUpdate;
      const timeoffUpdate = req.body.timeoffUpdate;
      const compensationApproval = req.body.compensationApproval;
      const compensationRequest = req.body.compensationRequest;
      const employementStatusApproval = req.body.employementStatusApproval;
      const employementStatusRequest = req.body.employementStatusRequest;
      const jobInformationApproval = req.body.jobInformationApproval;
      const jobInformationRequest = req.body.jobInformationRequest;
      const promotionApproval = req.body.promotionApproval;
      const promotionRequest = req.body.promotionRequest;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newApprovalEmployee = {
        compensationRequest,
        employementStatusApproval,
        employementStatusRequest,
        jobInformationApproval,
        jobInformationRequest,
        promotionApproval,
        promotionRequest,
        employeeId,
        informationUpdate,
        timeoffUpdate,
        compensationApproval,
        createdAt,
        modifiedAt,
      };
      const employee = await this.employeeDetailsRepository.findOneOrFail({
        where: { employeeId: req.body.employeeId,status: Not('Non Active')},
      });
      employee.approvals = newApprovalEmployee;
      return await this.employeeDetailsRepository.save(employee);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getApprovalsEmployees( companyId: string) {
    try {
      const approvalsEmployees = await this.employeeDetailsRepository.find({where: { companyId: companyId ,status: Not('Non Active') }});
      const approvalsEmployeesList = [];
      for (let i = 0; i < approvalsEmployees.length; i++) {
        if (approvalsEmployees[i].approvals) {
          approvalsEmployeesList.push(approvalsEmployees[i].approvals);
        }
      }
      return approvalsEmployeesList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getApprovalsEmployeesById(id: string    ) {
    try {
      const approvalsEmployee = await this.employeeDetailsRepository.findOneOrFail(
        { where: { employeeId: id ,status: Not('Non Active')} },
      );
      const employeeApproval = approvalsEmployee.approvals;
       return employeeApproval;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putApprovalsEmployeesById(
    id: string,
    req: Request,
      
  ) {
    try {
      const approvalsEmployee =
        await this.employeeDetailsRepository.findOneOrFail({
          where: { employeeId: id, status: Not('Non Active')},
        });
      if (req.body.hasOwnProperty('employeeId')) {
        approvalsEmployee.approvals.employeeId = req.body['employeeId'];
      }
      if (req.body.hasOwnProperty('informationUpdate')) {
        approvalsEmployee.approvals.informationUpdate = req.body['informationUpdate'];
      }
      if (req.body.hasOwnProperty('timeoffUpdate')) {
        approvalsEmployee.approvals.timeoffUpdate = req.body['timeoffUpdate'];
      }
      if (req.body.hasOwnProperty('compensationApproval')) {
        approvalsEmployee.approvals.compensationApproval =
          req.body['compensationApproval'];
      }
      if (req.body.hasOwnProperty('compensationRequest')) {
        approvalsEmployee.approvals.compensationRequest =
          req.body['compensationRequest'];
      }
      if (req.body.hasOwnProperty('employementStatusApproval')) {
        approvalsEmployee.approvals.employementStatusApproval =
          req.body['employementStatusApproval'];
      }
      if (req.body.hasOwnProperty('employementStatusRequest')) {
        approvalsEmployee.approvals.employementStatusRequest =
          req.body['employementStatusRequest'];
      }
      if (req.body.hasOwnProperty('jobInformationApproval')) {
        approvalsEmployee.approvals.jobInformationApproval =
          req.body['jobInformationApproval'];
      }
      if (req.body.hasOwnProperty('jobInformationRequest')) {
        approvalsEmployee.approvals.jobInformationRequest =
          req.body['jobInformationRequest'];
      }
      if (req.body.hasOwnProperty('promotionApproval')) {
        approvalsEmployee.approvals.promotionApproval = req.body['promotionApproval'];
      }
      if (req.body.hasOwnProperty('promotionRequest')) {
        approvalsEmployee.approvals.promotionRequest = req.body['promotionRequest'];
      }
      approvalsEmployee.modifiedAt = new Date(Date.now());
      return await this.employeeDetailsRepository.save(approvalsEmployee);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAccessLevelsEmployeesById(
    id: string,
      
  ) {
    try {
      const approvalsEmployee =
        await this.employeeDetailsRepository.findOneOrFail({
          where: { employeeId: id ,status: Not('Non Active') },
        });
      approvalsEmployee.approvals = {};
      await this.employeeDetailsRepository.save(approvalsEmployee);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
