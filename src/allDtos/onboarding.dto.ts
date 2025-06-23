export class onboardingcreateTemplate {
    name: string;
    description: string;
    question: QuestionDto[];
    companyId: string;
}

export class QuestionDto {
    id: number;
    title: string;
    type: string;
    choices: string[];
    singleAns: string;
    multipleAns: number[];
    required: boolean;
    fileType: string;
    uploadedFiles: string[];
  }