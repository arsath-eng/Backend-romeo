import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class OnboardingTask {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    categoryId: string;
  
    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: true,
    })
    questions: Question[];
  
    @Column()
    name: string;
  
    @Column()
    description: string;
  
    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: true,
    })
    responses: {
      employeeId: string;
      status:string;
      responses: Question[];
    }[];
  
    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: true,
    })
    assignees: Assignee;
  
    @Column()
    startDate: string;
  
    @Column()
    endDate: string;
  
    @Column()
    status: string;
  
    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    modifiedAt: Date;
  }
  
  
  interface Question {
    id: number;
    title: string;
    type: string;
    required: boolean;
    choices: string[];
    singleAns: string;
    multipleAns: string[];
    fileType?: string;
    uploadedFiles?: Array<{id: string, name: string}>;
    numberOfFiles: string;
    selectedFolder?:string;
    complianceId?:string;
    expiredDate?:string;
    
    
  }
  
  interface Assignee {
    everyone: boolean;
    employeeGroups: string[];
    employeeIds: string[];
  }
  