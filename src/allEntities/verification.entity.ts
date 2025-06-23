import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  username: string;

  @Column({nullable: true})
  token: string;

  @Column()
  employeeId: string;

  @Column()
  type: string;

  @Column({default: false})
  canUse:boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column({default:'pending'})
  status: string;
}
