export class Candidate {
  id: string;

  firstName: string;

  lastName: string;

  jobId: string;

  status: string;

  email: string;

  gender: string;

  phone: string;

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  applicationQuestions: {
    id: string;
    required: boolean;
    type: string;
    question: string;
    value: string;
  }[];

  companyId: string;

  rate: number;

  creator: string;

  sharedWith: string[];

  hiringLead: string;

  notes: {
    id: string;
    note: string;
    employeeId: string;
    replyId: string;
    createdAt: string;
    modifiedAt: string;
  }[];

  emails: {
    id: string;
    subject: string;
    body: string;
    attachments: string[];
  }[];

  interviews: {
    id: string;
    candidateId: string;
    title: string;
    date: string;
    time: string;
    type: string;
    meetingLink: string;
    description: string;
    sendEmail: boolean;
    sharedWith: string[];
  }[];

  activities: {
    activity: string;
    status: string;
    type:string;
    rate: number;
    editorId: string;
    employeeId?: string;
  }[];

  job: any;

  createdAt: Date;

  updatedAt: Date;

  jobName: string

  employeementStatus: string[];

  department: string

  summary: string

  score: string
}

export class Interview {
  id: string;
  
  candidateId: string;

  title: string;

  date: string;

  time: string;

  type: string;

  meetingLink: string;

  description: string;

  sendEmail: boolean;

  sharedWith: string[];
}
