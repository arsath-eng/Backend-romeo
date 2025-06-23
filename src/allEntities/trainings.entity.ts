import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

  
@Entity()
export class Training {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column('jsonb')
    template: TrainingTemplateInterface;

  
    @Column('jsonb')
    employeeIds: {
        all: boolean;
        ids: string[] 
    };
  
    @Column()
    status: string;
  
    @Column()
    dueDays: string;
  
    @Column('jsonb', { default: [] })
    responses: {
      employeeId: string;
      answers: string[];
      attachments: string[];
      status: string;
    }[];
  
    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    modifiedAt: Date;
  }
  

  export interface TrainingTemplateInterface {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    categoryId: string;
    type: string;
    links: string[];
    courseIds: string[];
    requiredUploads: boolean;
    hasAdditionalQuestions: boolean;
    attachments: string[];
    questions: {
      id: string;
      question: string;
    }[];
    companyId: string;
    createdAt: Date;
    modifiedAt: Date;
  }
  