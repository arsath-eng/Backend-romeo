import { performanceComment } from "./subDtos/performanceComment.dto";

export class performanceTask {
  id: string;

  employeeId: string;

  task:string;

  description:string;

  empScore:string;

  supScore:string;

 
  status:string;


  creatorId:string;

  comment:performanceComment;

 
  createdAt: Date;


  modifiedAt: Date;


  companyId:string;

  score:string;
}
