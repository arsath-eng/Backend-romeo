
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class hrletterGenerate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    templateId: string;

    @Column()
    companyId: string;

    @Column()
    employeeId: string;

    @Column({nullable:true})
    requesteId: string;
    
    @Column({nullable:true})
    supervisorId: string;

    @Column({ type: 'json', nullable: true })
    content: { page: string; content: string }[];

    @Column("text", { array: true, nullable: true })
    tags: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


}