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
export class HrmInformationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  changedData;

  @Column('json')
  formData;

  @Column()
  type: string;

  @Column('uuid')
  employeeId;

  @Column({default: ''})
  requesterId: string;

  @Column({default: 'pending'})
  status: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;
}
