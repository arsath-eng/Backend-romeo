export class CompanyDto {

  id: string;

  theme: string;

  firstName: string;

  lastName: string;

  companyEmail: string;

  companyName: string;

  noEmp: string;

  country: string;

  password: string;

  phoneNumber: string;

  heroLogoUrl: string;

  logoUrl: string;

  paidStatus: string;

  status: string;

  features: string;

  currency: string;

  createdAt: Date;

  modifiedAt: Date;

  phoneNoVerified: boolean;

  timezone: string;

  dataRetention: {
    leaveManagement:number;
    boarding:number;
    hiring:number;
    files:number;
    attendance:number;
    projects:number;
    rostering:number;
    trainings:number;
    payroll:number;
    claims:number;
    surveys:number;
    assets:number;
    approval:number;
    Documents:number;
    notification:number;
    maxStorage:number;
 }
}
