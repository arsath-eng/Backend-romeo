import {v4 as uuidv4} from 'uuid';

export class getAppraisalTemplateDto {

  id: string;

  name: string;

  description: string;

  category: string;

  segments: SegmentDto[];

  isActive: boolean;

  createdAt: Date;

  modifiedAt: Date;

  companyId: string;
}
export class postAppraisalTemplateDto {

  name: string;

  description: string;

  category: string;

  segments: SegmentDto[];

  isActive: boolean;

  companyId: string;
}
export class putAppraisalTemplateDto {

  id: string;

  name?: string;

  description?: string;

  category?: string;

  segments?: SegmentDto[];

  isActive?: boolean;
}

export class getAppraisalDto {

  id: string;

  name: string;

  category: string;

  templateId: string;

  segments: SegmentDto[];

  responses: ResponseDto[];

  isActive: boolean;

  managerId: string;

  sharedWith: {

    employeeIds: string[];

    "360Ids": Ids360Dto[]
  };

  startDate: string;

  endDate: string;

  createdAt: Date;

  modifiedAt: Date;

  companyId: string;
}
export class postAppraisalDto {

  name: string;

  category: string;

  templateId: string;

  segments: SegmentDto[];

  isActive: boolean;

  managerId: string;

  sharedWith: {

    employeeIds: string[];

    "360Ids": Ids360Dto[]
  };

  startDate: string;

  endDate: string;

  companyId: string;
}
export class putAppraisalDto {

  id: string;

  name?: string;

  category?: string;

  templateId?: string;

  segments?: SegmentDto[];

  isActive?: boolean;

  managerId?: string;

  sharedWith?: {

    employeeIds?: string[];
  };

  startDate?: string;

  endDate?: string;
}

export class SegmentDto {

  id: number;

  name: string;

  description: string;

  questions: QuestionDto[];
}
export class QuestionDto {

  id: number;

  question: string;

  type: string;
}

export class ResponseDto {

  id: string;

  employeeId: string;

  type: string;

  to: string;

  status: string;

  submittedAt: Date = new Date();

  answers: AnswerDto[];

  finalScore?: string;
}

export class AnswerDto {

  id: string;

  segmentId: string;

  questionId: string;

  answer: string;
}

export class SubmitAppraisalDto {

  appraisalId: string;

  employeeId: string;

  type: string;

  to: string;

  status: string;

  submittedAt: Date = new Date();

  answers: AnswerDto[];

  finalScore?: string;
}

export class AppraisalRequest360Dto {

  appraisalId: string;

  employeeIds: string[];

  to: string;
}

export class Ids360Dto {

  employeeId: string;
      
  to: string;
}

export class getAppraisalTemplateResponseDto {
  
  message: string;
  
  data: getAppraisalTemplateDto[];

}
export class AppraisalResponseDto {
  
  message: string;

}
export class getAppraisalResponseDto {
  
  message: string;
  
  data: getAppraisalDto[];

}

