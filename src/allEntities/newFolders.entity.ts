import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Folders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  name: string;

  @Column({default: 'folder'})
  type: string;

  @Column('uuid')
  parentFolderId: string;

  @Column('json')
  access: {
    all: boolean;
    employeeIds: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
