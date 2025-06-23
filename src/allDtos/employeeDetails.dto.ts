import { PermanentAddress } from "./subDtos/permanentAddress.dto";
import { Phone } from "./subDtos/phone.dto";
import { Social } from "./subDtos/social.dto";
import { TemporaryAddress } from "./subDtos/temporaryAddress.dto";
import { payrollEmploymentDto } from "./payrollEmployment.dto";
import { Email } from "./subDtos/email.dto";

export class employeeDetails {
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

  fullName: {
    first: string;
    middle: string;
    last: string;
  };

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
  };

  customFields:{
      studentLoanDetails: string;
      pensionDetails: string;
    };
  taxDeclaration:{
    tfn: string;
    tfnUpdateDate: string,
    tfnExemption: string;
    residencyStatus: string;
    countryCode: string;
    isRegisteredWHM: boolean;
    typeOfPayee: string;
    stsl: boolean;
    taxFreeThreshold: boolean;
    applyOtherTaxOffset: boolean;
    applyOtherTaxOffsetValue: string;
    applyWithheldIncreased: boolean;
    applyWithheldIncreasedValue: string;
    eligibleForLeaveLoading:boolean;
    applySgcOnLeaveLoading: boolean;
    hasApprovedWithholdingVariation:boolean;
    incomeType: boolean;
    isClaimMediExemption: boolean;
    isClaimMediReduction: boolean;
    dependentChildrenClaimedNo: string;
    isCombinedIncome: boolean;
  };

  payrollId: string;
  
}

export class UserProfile {

  employeeId: string;

  profileImage: string|null;

  employeeNo: number|null;

  employeeName: string;

  companyId: string;

  companyName: string;

  heroLogo:string;

  theme: string;

  createdAt: Date;

  accounts: {
    companyId: string;
    accessLevelId: string;
    isActive: boolean;
  }[]
}

export class Accounts {

  employeeId: string;

  companyId: string;

  companyName: string;

  userType: string;

  accessLevelId: string;

  hasAccess: boolean
}
