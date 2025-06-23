import { HrmConfigs } from "@flows/allEntities/configs.entity";
import { HrmTimeEntries } from "@flows/allEntities/timeEntries.entity";
import { HrmTimeProjects } from "@flows/allEntities/timeProjects.entity";

export class projectEmployeesDto {
  employeeId: string;

  ratePerHour: string;

  totalHours: string;

  billedHours: string;

  unBilledHours: string;
}

export class projectTasksCommentsDto {
  id: string;

  employeeId: string;

  comment: string;
}

export class projectTasksDto {
  id: string;

  taskName: string;

  taskDescription: string;

  billable: boolean;

  billedHours: string;

  ratePerHour: string;

  comments: projectTasksCommentsDto[];
}

export class getEntriesResponseDto {
  code: number;

  method: string;

  message: string;

  entries: HrmTimeEntries[];
}

export class getProjectsResponseDto {
  code: number;

  method: string;

  message: string;

  projects: HrmTimeProjects[];
}
export class projectsResponseDto {
  code: number;

  message: string;

  projects: HrmTimeProjects;
}

export class entriesResponseDto {
  statusCode: number;

  message: string;

  entries: HrmTimeEntries;
}

export class deleteProjectsResponseDto {
  code: number;

  message: string;
}

export class deleteEntriesResponseDto {
  code: number;

  message: string;
}

export class templateDto {
	id: string;

	type: string;

	name: string;

	template: 
		{
			fieldNameDb: string;
			fieldNameExport: string;
		}[]
}

export class postTimesheetTemplatesDto {
  code: number;

  message: string;

  template: HrmConfigs
}

export class getTimesheetTemplatesDto {
  code: number;

  message: string;

  templates: templateDto[]
}

export class deleteTimesheetTemplatesDto {
  code: number;

  message: string;
}

export class putProjectCommonDto {
  code: number;

  message: string;

  changedData: HrmTimeProjects;
}


