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
export class Files {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  folderId: string;

  @Column({nullable: true})
  format: string;

  @Column({nullable: true})
  link: string;

  @Column({nullable: true})
  size: string;

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
