import { time } from "aws-sdk/clients/frauddetector";

export class attendance {
  id: string;

  employeeId: string;

  date: string;

  isOnline: boolean;

  isApproved: boolean;

  locationType: string;

  location: string;

  timeEntries: timeEntry[];

  companyId: string;

  createdAt: Date;

  modifiedAt: Date;
}

 class timeEntry {
  id: number
  clockIn: string;
  clockOut: string;
  taskId: string;
  ongoing: boolean;
  isOvertime: boolean;
  isBreak: boolean;
}
export class attendanceSettingsConfigDto {
  id: string;

  data: attendanceSettingsDto;

  companyId: string;

  createdAt: Date;

  modifiedAt: Date;
}
export class attendanceSettingsDto {

  clockInEarly: boolean;

  clockInLate: boolean;

  clockOutEarly: boolean;

  clockOutLate: boolean;

  weekStartDay: string;

  autoAttendance:boolean;

  autoRequestSummary:boolean;

  workingDays:workingDays[]
}
class workingDays {

  id: number;

  day: string;

  start: string;

  end: string;

  flexible: boolean;

  isWorkingDay:boolean;
}

export class CheckLocationDto {
  employeeId: string;
  lat: number;
  lng: number;
  type: string; 
}

export class postAttendanceRequestDto {
  id: string;

  employeeId: string;

  date: string;

  startTime: string;

  endTime: string;

  isOvertime: boolean;

  companyId: string;

  createdAt: Date;
}

export class putAttendanceRequestDto {
  id: string;

  status: string;

  attendanceId: string;
}