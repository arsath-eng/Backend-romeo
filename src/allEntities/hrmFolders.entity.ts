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
export class HrmFolders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  folderName: string;

  @Column()
  folderType: string;

  @Column({ nullable: true })
  sharedWithAll: boolean;

  @Column('simple-array', { default: [] })
  sharedWith ;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  subFolder: boolean;

  @Column('simple-array', { nullable: true })
  path;

  // @Column()
  // path: string;

  @Column({ nullable: true })
  parentFolder: string;

  @Column({ nullable: true })
  creatorId: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
