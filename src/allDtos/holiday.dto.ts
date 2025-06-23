
export class 
payrollSettingsHolidayDto {

    id: string;

    name: string;

    groupIds;

    createdAt: Date;
 
    modifiedAt: Date;

    companyId: string;

    date: string;
}
export class payrollSettingsHolidayGetAllDto {
    payrollSettingsHolidays: payrollSettingsHolidayDto[];
}

export class payrollSettingsHolidayGroupsDto {

    id: string;

    name: string;

    createdAt: Date;

    companyId: string;

    modifiedAt: Date;

    getFrom: string;
    
}