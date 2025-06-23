
import { TimeTrackingService } from '../../time-tracking/time-tracking.service';
import { TimezoneService } from '../../timezone/timezone.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Request } from 'express';
import { DataSource, Not, Repository } from 'typeorm';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import {v4 as uuidv4} from 'uuid';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';
@Injectable()
export class JobInformationService {
  constructor(
    private timeTrackingService: TimeTrackingService,
    private TimezoneServiceService: TimezoneService,
    @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmConfigs) private commonRepository: Repository<HrmConfigs>,
    @InjectDataSource() private dataSource: DataSource,

  ) { }

  async postJobInformation(req: any,  companyId: string) {
    try {
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: req.body.employeeId,status: Not('Non Active')},});
      let oldJobInformation;
      let newJobInformation;
      const reportTo = req.body.reportTo;
      reportTo.employeeId = req.body.employeeId;
      oldJobInformation = employeeDetails.jobInformation.find((jobInfo) => jobInfo.active === true);
      const reporterName = req.body.reportTo.reporterName;
      const reporterId = req.body.reportTo.reporterId;
      const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1 ', [companyId]);
      const newDate = new Date();
      const effectiveDate = new Date(req.body.effectiveDate);
      let active = false;

      const ADMINACCESS = accessLevels.find((access) =>  access.accessLevelType === 'FULL_ADMIN');
      const MANAGERACCESS = accessLevels.find((access) => access.accessLevelType === 'MANAGER');
      const EMPLOYEEACCESS = accessLevels.find((access) => access.accessLevelType === 'EMPLOYEE');
      const match = await this.TimezoneServiceService.dateMatches(newDate, format(effectiveDate, 'yyyy-MM-dd'), req.body.employeeId, 'PUT');
      if (match) {
      //upgrade access
      active = true;
      if (reporterId) {
        let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: reporterId,status: Not('Non Active')},});
        if (reporterDetails.accessLevelId !== ADMINACCESS.id) {
          reporterDetails.accessLevelId = MANAGERACCESS.id;
        }
        await this.employeeDetailsRepository.save(reporterDetails);
      }
      if (oldJobInformation) {
        oldJobInformation.active = false;
        employeeDetails.jobInformation = employeeDetails.jobInformation.filter((jobInfo) => jobInfo.id !== oldJobInformation.id);
        employeeDetails.jobInformation.push(oldJobInformation);
        await this.employeeDetailsRepository.save(employeeDetails);
      }
      }
      //save new job info
      const employeeId = req.body.employeeId;
      const jobTitle = req.body.jobTitle;
      const location = req.body.location;
      const department = req.body.department;
      const division = req.body.division;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newReportTo = {
        employeeId,
        reporterId,
        reporterName,
        companyId
      };
      newJobInformation = {
        id: uuidv4(),
        reportTo:newReportTo,
        employeeId,
        effectiveDate,
        jobTitle,
        location,
        department,
        division,
        active,
        createdAt,
        modifiedAt,
        companyId
      };  
      employeeDetails.jobInformation.push(newJobInformation);
      await this.employeeDetailsRepository.save(employeeDetails);
      
      if (oldJobInformation && oldJobInformation.reportTo.reporterId) {
        if (oldJobInformation.reportTo.reporterId === newJobInformation.reportTo.reporterId) {}
        else {
          //downgrade access
          let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: oldJobInformation.reportTo.reporterId, status: Not('Non Active')},});
          if (reporterDetails.accessLevelId === MANAGERACCESS.id) {
            let reporterCount = 0;
            const employeeDetails = await this.employeeDetailsRepository.find({where:{companyId:companyId,status: Not('Non Active')}});
            for (let i = 0; i < employeeDetails.length; i++) {
              const activeJobInformation = employeeDetails[i].jobInformation.find((jobInfo) => jobInfo.active === true);
              if (activeJobInformation && activeJobInformation.reportTo.reporterId === oldJobInformation.reportTo.reporterId) {
                reporterCount ++;
              }
            }
            if (reporterCount === 0) {
              reporterDetails.accessLevelId = EMPLOYEEACCESS.id;
            }
          }
          await this.employeeDetailsRepository.save(reporterDetails);
        }
      }
      return newJobInformation;

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getJobInformation( companyId: string) {
    try {
      let res = [];
      let reporterDetails = await this.employeeDetailsRepository.find({where: { companyId: companyId,status: Not('Non Active')},});
      for (let i = 0; i < reporterDetails.length; i++) {
        res = res.concat(reporterDetails[i].jobInformation);
      }
       return (res);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getJobInformationById(
    id: string,
      
  ) {
    try {
      let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: id,status: Not('Non Active')},});
       return (reporterDetails.jobInformation);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putJobInformationById(
    id: string,
    req: Request,
      
  ) {
    try {
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: req.body.employeeId,status: Not('Non Active')},});
      const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1 ', [employeeDetails.companyId]);
      let oldJobInformation = employeeDetails.jobInformation.find((jobInfo) => jobInfo.id === id);
      const newJobInformation = employeeDetails.jobInformation.find((jobInfo) => jobInfo.id === id);
        const ADMINACCESS = accessLevels.find((access) =>  access.accessLevelType === 'FULL_ADMIN');
        const MANAGERACCESS = accessLevels.find((access) => access.accessLevelType === 'MANAGER');
        const EMPLOYEEACCESS = accessLevels.find((access) => access.accessLevelType === 'EMPLOYEE');
      if (req.body.hasOwnProperty('effectiveDate')) {
        newJobInformation.effectiveDate = new Date(req.body['effectiveDate']);
      }
      if (req.body.hasOwnProperty('jobTitle')) {
        newJobInformation.jobTitle = req.body['jobTitle'];
      }
      if (req.body.hasOwnProperty('location')) {
        newJobInformation.location = req.body['location'];
      }
      if (req.body.hasOwnProperty('department')) {
        newJobInformation.department = req.body['department'];
      }
      if (req.body.hasOwnProperty('division')) {
        newJobInformation.division = req.body['division'];
      }
      if (req.body.hasOwnProperty('reportTo')) {
        newJobInformation.reportTo.reporterId = req.body['reportTo']['reporterId'];
        newJobInformation.reportTo.reporterName = req.body['reportTo']['reporterName'];
      }

      const newDate = new Date();
      const effectiveDate = format(new Date(newJobInformation.effectiveDate), 'yyyy-MM-dd');
      const match = await this.TimezoneServiceService.dateMatches(newDate, effectiveDate, newJobInformation.employeeId, 'PUT'); 
      newJobInformation.active = false;
      if (match) {
        //dowgrade previous reporter
        let previousReporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: newJobInformation.employeeId,status: Not('Non Active')},});
        const previous = previousReporterDetails.jobInformation.find((jobInfo) => jobInfo.active === true);
        
        if (previous && previous.reportTo.reporterId) {
          const effectiveDate = new Date(previous['effectiveDate']);
          if (effectiveDate <= newDate) {
            previousReporterDetails.jobInformation = previousReporterDetails.jobInformation.filter((jobInfo) => jobInfo.id !== previous.id);
            previous.active = false;
            previousReporterDetails.jobInformation.push(previous);
            await this.employeeDetailsRepository.save(previousReporterDetails);

            //downgrade access
            let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: previous.reportTo.reporterId,status: Not('Non Active')},});
            if (reporterDetails.accessLevelId === MANAGERACCESS.id) {
              let reporterCount = 0;
              const employeeDetails = await this.employeeDetailsRepository.find({where:{companyId:previousReporterDetails.companyId,status: Not('Non Active')}});
              for (let i = 0; i < employeeDetails.length; i++) {
                const activeJobInformation = employeeDetails[i].jobInformation.find((jobInfo) => jobInfo.active === true);
                if (activeJobInformation && activeJobInformation.reportTo.reporterId === previous.reportTo.reporterId) {
                  reporterCount ++;
                }
              }
              
              if (reporterCount === 0) {
                reporterDetails.accessLevelId = EMPLOYEEACCESS.id;
              }
            }
            await this.employeeDetailsRepository.save(reporterDetails);
          }
        }

        newJobInformation.active = true;
        if (newJobInformation.reportTo.reporterId) {
            //upgrade access
            let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: newJobInformation.reportTo.reporterId,status: Not('Non Active')},});
            if (reporterDetails.accessLevelId !== ADMINACCESS.id) {
              reporterDetails.accessLevelId = MANAGERACCESS.id;
            }
            await this.employeeDetailsRepository.save(reporterDetails);
        }
      }
      else {
        let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: newJobInformation.employeeId,status: Not('Non Active')},});
        const alldata = reporterDetails.jobInformation;
        alldata.sort(function (a, b) {
          var dateA = (a.effectiveDate).valueOf();
          var dateB = (b.effectiveDate).valueOf();
          return dateA - dateB
        });
        
        if (alldata[1] && alldata[1].reportTo.reporterId) {
          const effectiveDate = new Date(alldata[1]['effectiveDate']);
          if (effectiveDate <= newDate) {
            reporterDetails.jobInformation = reporterDetails.jobInformation.filter((jobInfo) => jobInfo.id !== alldata[1].id);
            alldata[1].active = true;
            reporterDetails.jobInformation.push(alldata[1]);
            await this.employeeDetailsRepository.save(reporterDetails);

            //upgrade access
            reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: alldata[1].reportTo.reporterId,status: Not('Non Active')},});
            if (reporterDetails.accessLevelId !== ADMINACCESS.id) {
              reporterDetails.accessLevelId = MANAGERACCESS.id;
            }
            await this.employeeDetailsRepository.save(reporterDetails);
          }
        }
      }
      newJobInformation.modifiedAt = new Date();
      const data = {
        new:newJobInformation,
        old:oldJobInformation
      }
      
      //save new job info
      await this.timeTrackingService.activityTrackingFunction(req.headers,newJobInformation.employeeId, 'EDIT', 'EMP_RECORDS', 'JOB-INFO', '', '', '', data, newJobInformation.companyId);
      employeeDetails.jobInformation = employeeDetails.jobInformation.filter((jobInfo) => jobInfo.id !== newJobInformation.id);
      employeeDetails.jobInformation.push(newJobInformation);
      return await this.employeeDetailsRepository.save(employeeDetails);
      
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async deleteJobInformationById(
    id: string,
    employeeId: string,  
    req: Request
  ) {
    try {
      let jobInformation;
      let employeeDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: employeeId,status: Not('Non Active')},});
      const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1 ', [employeeDetails.companyId]);
      const date = new Date(Date.now());
      jobInformation = employeeDetails.jobInformation.find((jobInfo) => jobInfo.id === id);
      let common = await this.commonRepository.find({where: { companyId: employeeDetails.companyId},});
      const ADMINACCESS = accessLevels.find((access) =>  access.accessLevelType === 'FULL_ADMIN');
      const MANAGERACCESS = accessLevels.find((access) => access.accessLevelType === 'MANAGER');
      const EMPLOYEEACCESS = accessLevels.find((access) => access.accessLevelType === 'EMPLOYEE');
      await this.timeTrackingService.activityTrackingFunction(req.headers,jobInformation.employeeId, 'DELETE', 'EMP_RECORDS', 'JOB-INFO', '', '', '', jobInformation, jobInformation.companyId);
      if (jobInformation.active === true) {
        let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: jobInformation.employeeId,status: Not('Non Active')},});
        const alldata = reporterDetails.jobInformation;
        alldata.sort(function (a, b) {
          var dateA = (a.effectiveDate).valueOf();
          var dateB = (b.effectiveDate).valueOf();
          return dateA - dateB
        });
        if (alldata[1] && alldata[1].reportTo.reporterId) {
          const effectiveDate = new Date(alldata[1]['effectiveDate']);
          if (effectiveDate <= date) {
            reporterDetails.jobInformation = reporterDetails.jobInformation.filter((jobInfo) => jobInfo.id !== alldata[1].id);
            alldata[1].active = true;
            reporterDetails.jobInformation.push(alldata[1]);
            await this.employeeDetailsRepository.save(reporterDetails);

            //upgrade access
            reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: alldata[1].reportTo.reporterId,status: Not('Non Active')},});
            if (reporterDetails.accessLevelId !== ADMINACCESS.id) {
              reporterDetails.accessLevelId = MANAGERACCESS.id;
            }
            await this.employeeDetailsRepository.save(reporterDetails);
          }
        }
      }
      if (jobInformation.reportTo.reporterId) {
          //downgrade access
          let reporterDetails = await this.employeeDetailsRepository.findOne({where: { employeeId: jobInformation.reportTo.reporterId,status: Not('Non Active')},});
          if (reporterDetails.accessLevelId === MANAGERACCESS.id) {
            let reporterCount = 0;
            const employeeDetails = await this.employeeDetailsRepository.find({where:{companyId:jobInformation.companyId,status: Not('Non Active')}});
            for (let i = 0; i < employeeDetails.length; i++) {
              const activeJobInformation = employeeDetails[i].jobInformation.find((jobInfo) => jobInfo.active === true);
              if (activeJobInformation && activeJobInformation.reportTo.reporterId === jobInformation.reportTo.reporterId) {
                reporterCount ++;
              }
            }         
            if (reporterCount === 0) {
              reporterDetails.accessLevelId = EMPLOYEEACCESS.id;
            }
          }
          await this.employeeDetailsRepository.save(reporterDetails);
      }

      employeeDetails.jobInformation = employeeDetails.jobInformation.filter((jobInfo) => jobInfo.id !== id);
      await this.employeeDetailsRepository.save(employeeDetails);

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
