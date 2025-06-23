import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class onboardingTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    categoryId: string;

    @Column()
    name: string;

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
        nullable:true,
    })
    question:Question[];

    @Column()
    companyId: string;

    @Column()
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

interface Question {
    id: number;
    title: string;
    type: 'short_answer' | 'paragraph' | 'multiple_choices' | 'check_boxes' | 'rate' | 'document';
    choices: string[];
    singleAns: string;
    multipleAns: string;
    required: boolean;
    fileType: 'pdf';
    uploadedFiles: string[];
    numberOfFiles: string;
    selectedFolder:string;
  }