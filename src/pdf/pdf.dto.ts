export class TemplateEmployee {

    name: string;

    nationalId: string;

    memberNo: string; //missing

    totalEarnings: string;

    employerContribution: string;

    employeeContribution: string;

    total: string;
  }
  
export class EPFTemplate {
    
    epfRegistrationNo: string; //missing

    monthYear: string;

    contributions: string;

    surcharges: string; //missing

    totalRemittance: string; //missing

    chequeNo: string; //missing

    bankNameBranch: string; //missing

    employees: TemplateEmployee[];

    employerSignature: string; //missing

    employerTelephone: string;

    employerEmail: string;

    employerFax: string; //missing
  }