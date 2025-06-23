import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Career {
    @PrimaryGeneratedColumn('uuid')
    id:string;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column()
    jobId: string;
  
    @Column()
    status: string;
  
    /* @Column()
    expirience: string; */

    /* @Column()
    salary: string; */

    /* @Column('text', { array: true })
    employeementStatus: string[];
 */
    @Column()
    email: string;
  
    @Column()
    gender: string;
  
    @Column()
    phone: string;
    
   /*  @Column('jsonb', { default: () => "'{}'" })
    jobDescription: {
        type: string;
        data: any;
    }[]; */
    
   /*  @Column('text', { array: true,nullable: true })
    requiredSkills: string[];  */
  
    @Column('jsonb',{ nullable: true })
    address: {
      no: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  
    
    @Column('jsonb', {default: () => "'{}'" })
    applicationQuestions: {
        id: string;
        required: boolean;
        type: string;
        question: string;
        value: string;
    }[];
  
    @Column()
    companyId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
