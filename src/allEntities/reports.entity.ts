
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
} from 'typeorm';

@Entity()
export class HrmReports {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  reportName: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  creatorId: string;

  @Column('simple-array', { nullable: true })
  sharedWith;

  @Column('json', { nullable: true })
  schedule;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
})
  filterBy;

  @Column({
    type: 'json',
    nullable: true,
})
  sortBy;

  @Column('simple-array', { nullable: true })
  folderIdList;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
})
  reportRequired;

  @Column({ nullable: true })
  recentlyViewed: string;

  @Column()
  groupBy: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
