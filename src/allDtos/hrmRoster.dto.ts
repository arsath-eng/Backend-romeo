import { FullName } from "aws-sdk/clients/account";
import { Email } from "aws-sdk/clients/codecommit";
import { payrollEmploymentDto } from "./payrollEmployment.dto";
import { PermanentAddress } from "./subDtos/permanentAddress.dto";
import { Phone } from "./subDtos/phone.dto";
import { Social } from "./subDtos/social.dto";
import { TemporaryAddress } from "./subDtos/temporaryAddress.dto";
import { ApiProperty } from "@nestjs/swagger";

  export class HrmRosterEmployeesDto {

    id: string;

    employeeId: string;

    sites: SitesDto[];
    @ApiProperty({ type: [] })
    positions:[];

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;
  }

  export class SitesDto {

    id: string;

    siteId:string; 

    name: string; 

    default: boolean;
  }
  export class HrmRosterSitesDto {

    id: string;

    name: string;

    siteId: string;

    phone: string;

    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postCode: string
    }

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;
  }

  export class HrmRosterPositionsDto {

    id: string;

    name: string;

    positionId: string;

    description: string;  

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;
  }

  export class HrmRosterShiftsDto {

    id: string;

    date: string;

    site:{
      siteId: string,
      siteName: string
    }

    position:{
      positionId: string,
      positionName: string
    }

    startTime: string; 

    endTime: string;  

    employeeId: string;

    color: string;

    notes: string;

    allDay: boolean;

    active: boolean;

    isOvertime: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    breaks: {
      startTime: string;
      endTime: string;
    }[];
  }

  export class HrmRosterTemplatesDto {
    id: string;

    name: string;

    description: string;

    shifts: string[];

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;
  }
  export class getRosterEmployeesDto {
    employeeId: string;
  
    timezone: string;
  
    username: string;
  
    password: string;
  
    getStarted: boolean;
  
    emailVerified: boolean;
  
    employeeNo: number;
  
    access: boolean;
  
    status: string;
  
    birthday: string;
  
    gender: string;
  
    maritalStatus: string;
  
    passportNumber: string;
  
    taxfileNumber: string;
  
    nin: string;
  
    vaccinated: boolean;
  
    doses: number;
  
    reason: string;
  
    owner: boolean;
  
    hireDate: string;
  
    terminationDate: string;
  
    ethnicity: string;
  
    eeoCategory: string;
  
    shirtSize: string;
  
    allergies: string;
  
    dietaryRestric: string;
  
    secondaryLang: string;
  
    createdAt: Date;
  
    modifiedAt: Date;
  
    preferedName: string;
  
    online: boolean;
  
    profileImage;
  
    email: Email;
  
    fullName: FullName;
  
    permanentAddress: PermanentAddress;
  
    phone: Phone;
  
    social: Social;
  
    temporaryAddress: TemporaryAddress;
  
    companyId: string;
  
    accrualLevels;
  
    lastLogin: Date;
  
    payrollEmployment: payrollEmploymentDto;
  
    whatsappVerify: boolean;
  
    weeklyHourLimit: string;
  
    monthlyHourLimit: string;
  
    nationality: string;
  
    visaDetails: {
      visaStatus: string;
      visaNumber: string;
      expireDate: string;
      visaDescription: string;
      visaConditions: string;
    }
  
    customFields:{
        studentLoanDetails: string;
        pensionDetails: string;
      }
    
    id: string;

    sites:[];

    positions:[];

    active: boolean;

    updatedAt: string;
  }

  export class checkEmployeeInactivityDto {

    message: string;

    canInactivate: boolean;

    shiftsToRemove?: HrmRosterShiftsDto[];

    shiftSitesToRemove?: shiftSitesToRemoveDto[];

    @ApiProperty({ type: [] })
    shiftPositionsToRemove?: [];

    shiftTemplatesToRemove?: shiftTemplatesToRemoveDto[];
  }
  export class shiftTemplatesToRemoveDto {

    id: string;

    name: string; 
  }
  export class shiftSitesToRemoveDto {

    id: string;

    siteId:string; 

    name: string; 

    default: boolean;
  }
  export class addSiteDto {

    id: string;

    name: string;

    siteId: string;

    phone: string;

    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postCode: string
    }

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    employeeIds: string[];

    breaks: {
      startTime: string,
      endTime: string
    }[];
  }
  export class getRosterSitesDto {

    id: string;

    name: string;

    siteId: string;

    phone: string;

    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postCode: string
    }

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    employeeIds: string[];

    breaks: {
      startTime: string,
      endTime: string
    }[];
  }
  export class updateRosterSitesDto {

    id: string;

    name: string;

    siteId: string;

    phone: string;

    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postCode: string
    }

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    employeeId: string[];

    breaks: {
      startTime: string,
      endTime: string
    }[];
  }
  export class checkSiteInactivityDto {

    message: string;

    canInactivate: boolean;

    shifts?: HrmRosterShiftsDto[];

    employees?: HrmRosterEmployeesDto[];

    templates?: HrmRosterTemplatesDto[];

  }
  export class addPositionDto {

    id: string;

    name: string;

    positionId: string;

    description: string;  

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    employeeIds: string[];
  }
  export class getRosterPositionsDto {

    id: string;

    name: string;

    positionId: string;

    description: string;  

    active: boolean;

    companyId: string;

    createdAt: string;

    updatedAt: string;

    employeeIds: string[];
  }
  export class checkPositionInactivityDto {

    message: string;

    canInactivate: boolean;

    shifts?:HrmRosterShiftsDto[];

    employees?: HrmRosterEmployeesDto[];

    templates?: HrmRosterTemplatesDto[];
  }
  export class getRosterTemplatesDto {

    message: string;

    rosterTemplate?: HrmRosterTemplatesDto;

    rosterTemplates?: HrmRosterTemplatesDto[];
  }
  
  