import { ResponseDto, SegmentDto } from '@flows/allDtos/appraisal.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AppraisalTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  segments: SegmentDto[];

  @Column()
  isActive: boolean;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}

@Entity()
export class Appraisal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  templateId: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  segments: SegmentDto[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  responses: ResponseDto[];

  @Column()
  isActive: boolean;

  @Column()
  managerId: string;

  @Column({ type: 'json', default: () => `'{"employeeIds": [], "360Ids": []}'` })
  sharedWith: {
    employeeIds: string[];
    "360Ids": {
      employeeId: string;
      to: string;
    }[]
  };

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}

