import { HrmEmployeeDetails } from "@flows/allEntities/employeeDetails.entity";
import { APIService } from "../superAdminPortalAPI/APIservice.service";
import { InjectRepository } from "@nestjs/typeorm";
import { log } from "console";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import enGB from 'date-fns/locale/en-GB';
import { Repository } from "typeorm";
const moment = require('moment-timezone');

export class TimezoneService {
    constructor(
        private readonly APIService: APIService,
        @InjectRepository(HrmEmployeeDetails) private EmployeeRepository: Repository<HrmEmployeeDetails>,
    ) {}
    async dateMatches(newDate:Date, companyDate:string, employeeId:string, type:string) {
        let match = false;
        const employee = await this.EmployeeRepository.findOne({where:{ employeeId:employeeId }});        
            const employeeTimezone = newDate.toLocaleString("en-US", { timeZone: employee.timezone });
            const formatCompanyTimezone = format(new Date(companyDate), 'yyyy-MM-dd') + ' 00:00:00';
            const formatEmployeeTimezone = format(new Date(employeeTimezone), 'yyyy-MM-dd HH:mm:ss zzzz').slice(0,19);
            if (type === 'PUT') {
                if (new Date(formatCompanyTimezone) <= new Date(formatEmployeeTimezone)) {
                    match = true;
                }
            }
            if (type === 'SCHEDULE') {
                if (formatCompanyTimezone === formatEmployeeTimezone) {
                    match = true;
                }
            } 
        return match;
    }
    async companyDateMatches(newDate:string, companyDate:string, companyId:string, executionType:string) {
        let match = false;
        if (companyDate !== '' && companyDate) {
            const company = await this.APIService.getCompanyById(companyId);
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const setCompanyTimezone = moment(companyDate).parseZone().tz(company.timezone, true).toISOString(true);
            const serverTimezone = formatInTimeZone(setCompanyTimezone, timezone, 'yyyy-MM-dd HH:mm:ss zzz', { locale: enGB }).slice(0,19);
            if (executionType === 'PUT') {
                if (new Date(newDate) >= new Date(serverTimezone)) {
                    match = true;
                }
            }
            if (executionType === 'SCHEDULE') { 
                if (newDate === serverTimezone) {
                    match = true;
                }
            }
        }
        return match;
    }
 }
