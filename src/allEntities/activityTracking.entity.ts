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
export class HrmActivityTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  data;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  mode: string;

  @Column()
  action: string;

  @Column()
  item: string;

  @Column()
  subItem: string;

  @Column()
  approval: string;

  @Column()
  approvalSubItem: string;

  @Column()
  access: string;

  @Column()
  via: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
