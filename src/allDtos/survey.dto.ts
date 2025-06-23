export class surveyQuestionnairDto {
    code: string;
    totalCount: string;
    surveys: Survey[];
}

export class Survey {
    id: string;
    name: string;
    description: string;
    questions: Question[];
    companyId: string;
    createdAt: string;
    modifiedAt: string;
}

export class Question {
    id: number;
    title: string;
    type: string;
    choices: string[];
    singleAns: string;
    multipleAns: string[];
    required: boolean;
}