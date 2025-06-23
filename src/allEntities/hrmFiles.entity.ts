import { bool } from 'aws-sdk/clients/signer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
  RepositoryNotTreeError,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class HrmFiles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  folderId: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  fileSize: string;

  @Column({ nullable: true })
  uploaderId: string;

  @Column({ nullable: true })
  sharedWithAll: boolean;

  @Column('simple-array', { default: [] })
  sharedWith;

  @Column({ nullable: true })
  fileLink: string;

  @Column({ nullable: true })
  format: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  share: boolean;

  @Column({ nullable: true })
  type: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
