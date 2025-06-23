export class payrollEmploymentDto {

  startDate: string;

  isTerminated: boolean;

  terminationDate: string;

  terminationReasonCode: string;

  averageEarnings: string;

  payrollCalendar: string;

  employeeGroup: string;

  holidayGroup: string;

  includePayslip: boolean;

  superannuationMemberships: [];

  epfEtfMemberships: [];

  bankAccounts: [];

  active: boolean;

  employeeAward: string;
  
  employeeAwardLevel: string;

  employeeAwardPayrateId: string;

  employeeAwardPayrate: string;

  employeeAwardCalculateRate: string;

  employeeAwardPayrateType: string;

}

export class attendanceSettings {
  workPlace: string;;
  officeLocation: string;
  remoteLocation: string;
  geoLocation: string;
  checkGeoLocation:boolean;
  workingDays: workingDays[];

}

export class workingDays {

  id: number;

  day: string;

  start: string;

  end: string;

  flexible: boolean;

  isWorkingDay: boolean;
}

