import { DataSource } from 'typeorm';
import { BadRequestException, HttpException } from '@nestjs/common';

export async function getAttendanceSettings(dataSource: DataSource, companyId: string) {
  try {
    const settings = await dataSource.query(
      'SELECT * FROM hrm_configs WHERE type = $1 AND "companyId" = $2',
      ['attendance', companyId]
    );

    const config = {
      default: false,
      settings: []
    };

    if (settings.length === 0) {
      config.default = true;
      config.settings = [
        {
          isAutoClockOutByShift: true,
          clockInEarly: true,
          clockInLate: true,
          clockOutEarly: true,
          clockOutLate: true,
          weekStartDay: "Monday",
          autoAttendance: false,
          autoRequestSummary: false,
          workingDays: [
            {
              id: 1,
              day: "Monday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: true
            },
            {
              id: 2,
              day: "Tuesday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: true
            },
            {
              id: 3,
              day: "Wednesday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: true
            },
            {
              id: 4,
              day: "Thursday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: true
            },
            {
              id: 5,
              day: "Friday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: true
            },
            {
              id: 6,
              day: "Saturday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: false
            },
            {
              id: 0,
              day: "Sunday",
              start: "08:00 AM",
              end: "05:30 PM",
              flexible: false,
              isWorkingDay: false
            }
          ],
          companyId: companyId
        }
      ];
      return config;
    } else {
      config.settings = [
        {
          id: settings[0].id,
          isAutoClockOutByShift: settings[0].data.isAutoClockOutByShift !== undefined ? settings[0].data.isAutoClockOutByShift : true,
          weekStartDay: settings[0].data.weekStartDay !== undefined ? settings[0].data.weekStartDay : "Monday",
          autoAttendance: settings[0].data.autoAttendance !== undefined ? settings[0].data.autoAttendance : false,
          autoRequestSummary: settings[0].data.autoRequestSummary !== undefined ? settings[0].data.autoRequestSummary : false,
          workingDays: settings[0].data.workingDays,
          clockInEarly: settings[0].data.clockInEarly !== undefined ? settings[0].data.clockInEarly : false,
          clockInLate: settings[0].data.clockInLate !== undefined ? settings[0].data.clockInLate : true,
          clockOutEarly: settings[0].data.clockOutEarly !== undefined ? settings[0].data.clockOutEarly : true,
          clockOutLate: settings[0].data.clockOutLate !== undefined ? settings[0].data.clockOutLate : true,
          companyId: settings[0].companyId
        }
      ];
      return config;
    }
  } catch (error) {
    console.log(error);
    if (error instanceof HttpException) {
      throw error;
    }
    throw new BadRequestException('Unknown error occurred');
  }
}