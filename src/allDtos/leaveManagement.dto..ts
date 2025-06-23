export class GetTimelineResponseDto {

  publicHolidays: GetTimelinePublicHolidaysDto[];

  leaves: GetTimelineLeavesDto[];

  ordinaryHours:  string; 

  hours: hours[];
}

export class GetTimelinePublicHolidaysDto {

  name: string;

  unitAmount: string;
}

export class GetTimelineLeavesDto {
  
  type: string;

  unitAmount: string;
}

export class hours {
  
  earningsRateId: string;

  unitAmount: string;
}

export class earningsDto {
  
  earningsRateId: string;
  
  calculationType: string;

  annualSalary: string;

  ratePerUnit: string;

  numberOfUnits: string;

  numberOfUnitsPerWeek: string;

  fixedAmount: number;

  amount: number;

  amountYTD: number;

  isLeave: boolean;

  leaveType: string;

  isCashout: boolean;

  isLeaveExemtSGC: boolean;

  holidayName: string;

  previousFinancialYear: string;

  etp_taxable_amount: number;

  etp_tax_amount: number;

  etp_tax_free_amount: number;

  awardPenalty: number;
}

export class payrollConfigs {
  
  id: string;

  type: string;

  data: any;
}

export class postTimelineDto {

  employeeId: string;

  startDate: string;

  endDate: string;

  earnings: earningsDto[];

  payrollConfigs: payrollConfigs[];
}
