
import { commonDto } from '@flows/allDtos/common.dto';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';

@Injectable()
export class AccessLevelsEmployeesService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmConfigs) private accessLevelsRepository: Repository<accessLevels>,
  ) {}
  async getAccessLevelsByEmployeeId(id: string) {
    try {
      const query = `
        SELECT c.* 
        FROM hrm_employee_details e
        JOIN access_levels c ON e."accessLevelId" = c."id"::UUID
        WHERE e."employeeId" = $1 AND e."status" != 'Non Active'
      `;
      
      const result = await this.dataSource.query(query, [id]);
      //console.log("Access Levels Query Result:", JSON.stringify(result, null, 2));

  
      if (result.length === 0) {
        throw new HttpException('No access levels found for this user', HttpStatus.NOT_FOUND);
      }
  
      const [accessLevel] = result;
  
      const accessLevelObj = {
        id: accessLevel.id,
        accessLevelName: accessLevel.accessLevelName,
        accessLevelType: accessLevel.accessLevelType,
        access: accessLevel.access,  
        createdAt: accessLevel.createdAt,
        modifiedAt: accessLevel.modifiedAt,
        companyId: accessLevel.companyId,
      };
  
      return accessLevelObj;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error fetching access levels!', HttpStatus.BAD_REQUEST);
    }
  }
  
  

  async postAccessLevelsEmployees(req: Request,  companyId: string
    ) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: req.body.employeeId,status: Not('Non Active') }, });
      employeeDetails.accessLevelId = req.body.accessLevelId;
      employeeDetails.lastLogin = req.body.lastLogin;
      employeeDetails.modifiedAt = new Date(Date.now());
      await this.employeeDetailsRepository.save(employeeDetails);
      return employeeDetails;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAccessLevelsEmployees( companyId: string) {
    try {
      const employeeDetails = await this.dataSource.query(`SELECT "employeeId", "accessLevelId", "lastLogin", "companyId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`, [companyId]);   
       return (employeeDetails);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAccessLevelsEmployeesById(id: string    ) {
    try {
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: id,status: Not('Non Active') }, });
      const json = {
        accessLevelId:employeeDetails.accessLevelId,
        lastLogin: employeeDetails.lastLogin,
        companyId: employeeDetails.companyId
      }
      return json;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putAccessLevelsEmployeesById(
    req: Request,
    employeeId: string,  
  ) {
    try {
      let res = {
        statusCode: 200,
        description: 'Unauthorized',
      };
      const approvalList = [
        "informationUpdate",
        "timeoffUpdate",
        "compensationApproval",
        "employementStatusApproval",
        "jobInformationApproval",
        "promotionApproval",
        "assetApproval"
      ];
      const requestList = [
        "compensationRequest",
        "employementStatusRequest",
        "jobInformationRequest",
        "promotionRequest",
        "claimRequest"
      ];
      const employeeDetails = await this.employeeDetailsRepository.findOne({ where: { employeeId: employeeId,status: Not('Non Active')}, });
      const employeeApprovals = employeeDetails.approvals;
      if (req.body.hasOwnProperty('employeeId')) {
        employeeDetails.employeeId = req.body['employeeId'];
      }
      if (!employeeDetails.owner) {
        if (req.body.hasOwnProperty('accessLevelId')) {
          if (employeeDetails.accessLevelId === req.body['accessLevelId']) {}
          else{
              const approvalsAll: commonDto[] = await this.commonRepository.find({where: {companyId:employeeDetails.companyId, type: 'approvalsAll'} });
              for (let i = 0; i < approvalsAll.length; i++) {
                //approvals list
                for (let j = 0; j < approvalsAll[i].data.list.length; j++) {
                  if (approvalsAll[i].data.list[j]["name"] === 'Manager(Report to)') {
                    if (approvalList.includes(approvalsAll[i].data.name)) {
                      employeeApprovals[approvalsAll[i].data.name] = 'UNDER';
                      
                    }
                  }
                  if (approvalsAll[i].data.list[j]["name"] === 'Specific Person') {
                    if (approvalsAll[i].data.list[j]["list"].includes(employeeDetails.employeeId)) {
                      if (approvalList.includes(approvalsAll[i].data.name)) {
                        employeeApprovals[approvalsAll[i].data.name] = 'ALL';
                      }
                    }
                  }
                }
                //request list
                for (let j = 0; j < approvalsAll[i].data.list.length; j++) {
                  if (approvalsAll[i].data.list[j]["name"] === 'Manager(Report to)') {  
                    if (requestList.includes(approvalsAll[i].data.name)) {
                      employeeApprovals[approvalsAll[i].data.name] = 'UNDER'; 
                    }                                 
                } 
                else if (approvalsAll[i].data.list[j]["name"] === 'Access Levels') {
                  if (approvalsAll[i].data.list[j]['list'].includes(employeeDetails.accessLevelId)) {
                    if (requestList.includes(approvalsAll[i].data.name)) {
                      employeeApprovals[approvalsAll[i].data.name] = 'ALL';
                    }
                  }
                }
                }
              }
          }
          
          employeeDetails.accessLevelId = req.body['accessLevelId'];
        }
        employeeDetails.approvals = employeeApprovals;
        employeeDetails.modifiedAt = new Date(Date.now());
        await this.employeeDetailsRepository.save(employeeDetails);
        res.description = 'success';
      }
      return res;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

}
