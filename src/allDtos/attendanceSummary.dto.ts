import { time } from "aws-sdk/clients/frauddetector";

export class attendanceSummary {
  id: string;

  employeeId: string;

  weekStartDate: string;

  weekEndDate: boolean;

  status: string;

  weeklySummary: string[];

  companyId: string;

  createdAt: Date;

  modifiedAt: Date;
}

