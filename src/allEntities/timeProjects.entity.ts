import { projectEmployeesDto, projectTasksCommentsDto, projectTasksDto } from '@flows/allDtos/time-tracking.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class HrmTimeProjects {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @Column()
  description: string;

  @Column()
  projectLogo: string;

  @Column()
  projectCode: string;

  @Column()
  projectCustomer: string;

  @Column()
  billingType: string;

  @Column()
  projectCost: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  projectEmployees: projectEmployeesDto[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  tasks: projectTasksDto[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  comments: projectTasksCommentsDto[];

  @Column()
  projectColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
