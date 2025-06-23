import { DataSource } from 'typeorm';
import { BadRequestException, HttpException } from '@nestjs/common';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

export async function canApprove(dataSource: DataSource, userid: string, type: string, employeeId: string) {
    let approve = false;
    const employeeDetail = await dataSource.query(
      `SELECT *
      FROM hrm_employee_details e
      JOIN access_levels u ON e."accessLevelId" = u."id" AND e."employeeId"='${userid}' AND e."status"!='Non Active'`
    ).then(res => res[0]);
    if (employeeDetail.access.approval[type].all) {
      approve = true;
    }
    else if (employeeDetail.access.approval[type].team) {
      const employeeDetails: HrmEmployeeDetails[] = await dataSource.query(
        `SELECT * FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`,
        [employeeDetail.companyId],
      );
      const employeeIdList = [];
      for (let i=0;i<employeeDetails.length;i++) {
        const JobInformation = employeeDetails[i].jobInformation.find((jobInfo) => jobInfo.active === true);
        if (JobInformation && JobInformation.reportTo.reporterId === userid) {
          employeeIdList.push(JobInformation.reportTo.employeeId)
        }
      }
      if (employeeIdList.includes(employeeId)) {
        approve = true;
      }
    }
    return approve;
  }