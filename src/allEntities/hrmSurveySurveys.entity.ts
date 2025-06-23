import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class hrmSurveySurveys {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  questions: Questions[];

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
    userId: string;
    responses: Questions[];
  }[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  assignees: Assignees[];

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

interface Questions {
  id: number;
  title: string;
  type: string;
  required: boolean;
  choices: string[];
  singleAns: string;
  multipleAns: string;
}

interface Assignees {
  everyone: boolean;
  employeeGroups: string[];
  employeeIds: string[];
}
