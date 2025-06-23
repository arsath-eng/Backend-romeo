import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Job } from './job.entity';
@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  get name(): string {
    return `${this.firstName} ${this.lastName}`;
}

  @Column({ nullable: true })
  jobId: string;

  @Column()
  status: string;

  @Column()
  email: string;

  @Column()
  gender: string;

  @Column()
  phone: string;

  @Column('jsonb')
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column('jsonb')
  applicationQuestions: {
    id: string;
    required: boolean;
    type: string;
    question: string;
    value: string;
  }[];

  @Column()
  companyId: string;

  @Column({ nullable: true })
  rate: number;

  @Column({ nullable: true })
  creator: string;

  @Column('simple-array', { nullable: true })
  sharedWith: string[];

  @Column({ nullable: true })
  hiringLead: string;

  @Column('jsonb', { nullable: true })
  notes: {
    id: string;
    note: string;
    employeeId: string;
    replyId: string;
    createdAt: string;
    modifiedAt: string;
  }[];

  @Column('jsonb', { nullable: true })
  emails: {
    id: string;
    subject: string;
    body: string;
    attachments: string[];
  }[];

  @Column('jsonb', { nullable: true })
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

  @Column('jsonb', { nullable: true })
  activities: {
    activity: string;
    status: string;
    type:string;
    rate: number;
    editorId: string;
    employeeId?: string;
  }[];

  @ManyToOne(() => Job, (job) => job.candidates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  jobName: string

  @Column('simple-array', { nullable: true })
  employeementStatus: string[];

  @Column()
  department: string

  @Column()
  summary: string

  @Column()
  score: string
}
