import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
@Entity()
export class TrainingTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column()
    description: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column()
    categoryId: string;
  
    @Column()
    type: string;
  
    @Column('text', { array: true })
    links: string[];
  
    @Column('text', { array: true })
    courseIds: string[];
  
    @Column({ default: false })
    requiredUploads: boolean;
  
    @Column({ default: false })
    hasAdditionalQuestions: boolean;
  
    @Column('text', { array: true })
    attachments: string[];
  
    @Column('jsonb')
    questions: {
        id: string;
        question: string 
    }[];
  
    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    modifiedAt: Date;
  }
  