import { String } from "aws-sdk/clients/apigateway";

export class EmployeeStatusDto {
  employeeId: string;

  effectiveDate: string;

  status: string;

  comment: string;

  incomeType: string;

  active: boolean;

  createdAt: Date;

  modifiedAt: Date;
}
