import { payrollSettingsHolidayDto, payrollSettingsHolidayGroupsDto } from '@flows/allDtos/holiday.dto';
import { payrollEmploymentDto } from '@flows/allDtos/payrollEmployment.dto';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { addDays, addMonths, format } from 'date-fns';
import { DataSource, Repository, Not } from 'typeorm';

@Injectable()
export class HolidayService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
      ) { }

      async postPayrollHoliday(data: payrollSettingsHolidayDto) {
        try {
          let holiday = new  HrmConfigs();
          const payrollSettingsHoliday = {
            name: data.name,
            date: data.date,
            groupIds: data.groupIds,
          };
          holiday.type = 'payroll_holiday';
          holiday.data = payrollSettingsHoliday;
          holiday.companyId = data.companyId;
          holiday.modifiedAt = new Date();
          holiday.createdAt = new Date();

          return await this.dataSource.getRepository(HrmConfigs).save(holiday);
        } catch (error) {
          console.log(error);
          new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async putPayrollHoliday(id: string, data: payrollSettingsHolidayDto,companyId:string) {
        try {
          const payrollSettingsHoliday = await this.dataSource.getRepository(HrmConfigs).findOne({
            where: { companyId: companyId, id: id },
          });
          for (let item in data) {
            if (!['id', 'companyId', 'createdAt', 'modifiedAt'].includes(item)) {
              payrollSettingsHoliday.data[item] = data[item];
            }
          }
          await this.dataSource.getRepository(HrmConfigs).save(payrollSettingsHoliday);
          return {
            statusCode: 200,
            description: 'success',
          };
        } catch (error) {
          console.log(error);
          new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      } 
      async getAllPayrollHoliday(companyId: string,id:string) {
        try {
          const payrollSettingsHoliday = await this.dataSource.getRepository(HrmConfigs).find({
            where: { type: 'payroll_holiday', companyId: companyId ,id: id},
          });
          let returnData = [];
          for (let i = 0; i < payrollSettingsHoliday.length; i++) {
            returnData.push({
              id: payrollSettingsHoliday[i].id,
              ...payrollSettingsHoliday[i].data,
              companyid: payrollSettingsHoliday[i].companyId,
              createdAt: payrollSettingsHoliday[i].createdAt,
              modifiedAt: payrollSettingsHoliday[i].modifiedAt,
            });
          }
          return {
            payrollSettingsHolidays: returnData,
          };
        } catch (error) {
          console.log(error);
          new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      } 
      async deletePayrollHoliday(companyId: string, id: string) {
        try {
          if (companyId && id) {
            const payrollSettingsHoliday = await this.dataSource.getRepository(HrmConfigs).findOne({
              where: { companyId: companyId, id: id },
            });
            await this.dataSource.getRepository(HrmConfigs).remove(payrollSettingsHoliday);
            return {
              statusCode: 200,
              description: 'success',
            };
          }
        } catch (error) {
          console.log(error);
          new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async postPayrollHolidayGroup(data: payrollSettingsHolidayGroupsDto) {
        try {
          let holidayGroup = new HrmConfigs();
          const payrollSettingsHolidayGroups = {
            name: data.name,
          };
          holidayGroup.type = 'payroll_holiday_group';
          holidayGroup.data = payrollSettingsHolidayGroups;
          holidayGroup.createdAt = new Date();
          holidayGroup.modifiedAt = new Date()
          holidayGroup.companyId = data.companyId;
          const payrollSettingsHolidayGroupsObj =
            await this.dataSource.getRepository(HrmConfigs).save(holidayGroup);
          let payrollSettingsHoliday = await this.dataSource.getRepository(HrmConfigs).find({
            where: { type: 'payroll_holiday', companyId: data.companyId },
          });
    
          for (let item of payrollSettingsHoliday) {
            if (item.data.groupIds.includes(data.getFrom)) {
              item.data.groupIds.push(payrollSettingsHolidayGroupsObj.id);
              await this.dataSource.getRepository(HrmConfigs).save(item);
            }
          }
          return payrollSettingsHolidayGroupsObj;
        } catch (error) {
          console.log(error);
          new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async putPayrollHolidayGroup(id: string, data: payrollSettingsHolidayGroupsDto,companyId:string) {
        try {
          const payrollSettingsHolidayGroup =
            await this.dataSource.getRepository(HrmConfigs).findOneOrFail({
              where: { companyId: companyId, id: id },
            });
          if (data.name) {
            payrollSettingsHolidayGroup.data.name = data.name;
          }
          await this.dataSource.getRepository(HrmConfigs).save(payrollSettingsHolidayGroup);
          return {
            statusCode: 200,
            description: 'success',
          };
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async getPayrollHolidayGroup(companyId: string, id: string) {
        try {
          const payrollSettingsHolidayGroup =
            await this.dataSource.getRepository(HrmConfigs).findOneOrFail({
              where: { companyId: companyId, id: id },
            });
          let returnData = {
            id: payrollSettingsHolidayGroup.id,
            ...payrollSettingsHolidayGroup.data,
            companyid: payrollSettingsHolidayGroup.companyId,
            createdAt: payrollSettingsHolidayGroup.createdAt,
            modifiedAt: payrollSettingsHolidayGroup.modifiedAt,
          };
          return returnData;
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async getAllPayrollHolidayGroup(companyId: string,id:string) {
        try {
          const payrollSettingsHolidayGroup = await this.dataSource.getRepository(HrmConfigs).find({
            where: { type: 'payroll_holiday_group', companyId: companyId,id:id },
          });
          let returnData = [];
          for (let i = 0; i < payrollSettingsHolidayGroup.length; i++) {
            returnData.push({
              id: payrollSettingsHolidayGroup[i].id,
              ...payrollSettingsHolidayGroup[i].data,
              companyid: payrollSettingsHolidayGroup[i].companyId,
              createdAt: payrollSettingsHolidayGroup[i].createdAt,
              modifiedAt: payrollSettingsHolidayGroup[i].modifiedAt,
              type:payrollSettingsHolidayGroup[i].type
              
            });
          }
          return {
            payrollSettingsHolidayGroups: returnData,
          };
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
      async deletePayrollHolidayGroup(companyId: string, id: string) {
        try {
          const payrollSettingsHolidayGroup =
            await this.dataSource.getRepository(HrmConfigs).findOneOrFail({
              where: { companyId: companyId, id: id },
            });
          const payrollSettingsHoliday = await this.dataSource.getRepository(HrmConfigs).find({
            where: { type: 'payroll_holiday', companyId: companyId },
          });
          for (let item of payrollSettingsHoliday) {
            if (item.data.groupIds.includes(payrollSettingsHolidayGroup.id)) {
              if (item.data.groupIds.length === 1) {
                await this.dataSource.getRepository(HrmConfigs).remove(item);
              } else {
                item.data.groupIds = item.data.groupIds.filter(
                  (x) => x !== payrollSettingsHolidayGroup.id,
                );
                await this.dataSource.getRepository(HrmConfigs).save(item);
              }
            }
          }
          await this.dataSource.getRepository(HrmConfigs).remove(payrollSettingsHolidayGroup);
          return {
            statusCode: 200,
            description: 'success',
          };
        } catch (error) {
          console.log(error);
          return new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
}