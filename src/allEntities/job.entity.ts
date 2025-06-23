import { Column, CreateDateColumn,OneToMany , Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Candidate } from './candidate.entity';

@Entity()
export class Job{

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    name: string;

    @Column()
    status:string
    
    @Column('text', { array: true })
    employeementStatus: string[];

    @Column()
    expirience: string;

    @Column()
    hiringLead:string

    @Column()
    deadline:string

    @Column()
    department:string

    @Column('text', { array: true })
    requiredSkills: string[]; 

    @Column('jsonb', { nullable: true })
    address: {
        line: string;
        city: string;
        country: string;
    };

    @Column('jsonb', { default: () => "'{}'" })
    jobDescription: {
        type: string;
        data: any;
    }[];

    @Column({ nullable: true })
    salary: string;

    /* @Column('jsonb', { default: () => "'{}'" })
    candidates: {
        id: string;
        name: string;
        score: string;
    }[]; */

    


    @OneToMany(() => Candidate, (candidate) => candidate.job)
    candidates: Candidates [];

    @Column('jsonb', {default: () => "'{}'" })
    applicationQuestions: {
        id: string;
        required: boolean;
        type: string;
        question: string;
        value: string;
        active:boolean;
        multipleChoices:string[]
    }[];
    
    @Column()
    creator: string;

    @Column('text', { array: true })
    sharedWith: string[];
    
    @Column()
    companyId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    


}
interface Candidates {
    id: string;
    name: string;
    score: string;
}

