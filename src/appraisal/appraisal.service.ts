import { AppraisalRequest360Dto, getAppraisalDto, getAppraisalTemplateDto, postAppraisalDto, postAppraisalTemplateDto, putAppraisalDto, putAppraisalTemplateDto, QuestionDto, ResponseDto, SegmentDto, SubmitAppraisalDto } from '@flows/allDtos/appraisal.dto';
import { Appraisal, AppraisalTemplate } from '@flows/allEntities/appraisal.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import e from 'express';
import { DataSource } from 'typeorm';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class AppraisalService {
    private readonly logger = new Logger(AppraisalService.name);
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private notificationService: NotificationService,
    ) {}

    async getAppraisalTemplates(companyId: string, id: string) {
        try {
            let appraisalTemplates: getAppraisalTemplateDto[];
            if (id) {
                appraisalTemplates = await this.dataSource.query(
                    `SELECT * FROM appraisal_template WHERE "id"='${id}'`,
                  );
            }
            else {
                appraisalTemplates = await this.dataSource.query(
                    `SELECT * FROM appraisal_template WHERE "companyId"='${companyId}'`,
                  );
            }
            return {message: "retrieved appraisal templates", data: appraisalTemplates}
        } catch (error) {
            this.logger.error(`Failed to retrieve appraisal template`, error.stack);
            throw new InternalServerErrorException(); 
        }
    }
    async postAppraisalTemplate(appraisalTemplate: postAppraisalTemplateDto) {
        try {
            const savedTemplate = await this.dataSource.getRepository(AppraisalTemplate).save(appraisalTemplate);
            return {message: "added appraisal template successfully", data: [savedTemplate]};
        } catch (error) {
            this.logger.error(`Failed to add appraisal template`, error.stack);
            throw new InternalServerErrorException();
        }
    }
    async putAppraisalTemplate(appraisalTemplate: putAppraisalTemplateDto) {
        try {
            const savedTemplate = await this.dataSource.getRepository(AppraisalTemplate).save(appraisalTemplate);
            return {message: "updated appraisal template successfully", data: [savedTemplate]};
        } catch (error) {
            this.logger.error(`Failed to update appraisal template`, error.stack);
            throw new InternalServerErrorException();
        }
    }
    async deleteAppraisalTemplate(id: string) {
        try {
            await this.dataSource.getRepository(AppraisalTemplate).createQueryBuilder().delete().where({ id: id }).execute();
            return {message: "deleted appraisal template successfully"};
        } catch (error) {
            this.logger.error(`Failed to delete appraisal template`, error.stack);
            throw new InternalServerErrorException(); 
        }
    }


    async getAppraisals(companyId: string, employeeId: string, id360: string, id: string) {
        try {
            const params: string[] = [companyId];
            let paramCount = 1;
            
            let query = `SELECT * FROM appraisal WHERE "companyId"=$${paramCount}`;
            
            if (employeeId) {
                paramCount++;
                query += ` AND (
                    EXISTS (
                        SELECT 1
                        FROM json_array_elements_text("sharedWith"->'employeeIds') AS ids
                        WHERE ids = $${paramCount}
                    )
                )`;
                params.push(employeeId);
            }
            
            if (id360) {
                paramCount++;
                query += ` AND EXISTS (
                    SELECT 1
                    FROM json_array_elements("sharedWith"->'360Ids') AS ids
                    WHERE ids->>'employeeId' = $${paramCount}
                )`;
                params.push(id360);
            }
            
            if (id) {
                paramCount++;
                query += ` AND "id"=$${paramCount}`;
                params.push(id);
            }
    
            const appraisals: getAppraisalDto[] = await this.dataSource.query(query, params);
            return {message: "retrieved appraisals successfully", data: appraisals}
        } catch (error) {
            this.logger.error(`Failed to retrieve appraisals`, error.stack);
            throw new InternalServerErrorException();
        }
    }
    async postAppraisal(appraisal: postAppraisalDto) {
        try {
            const newAppraisal = appraisal;
            newAppraisal.sharedWith['360Ids'] = [];
            const savedAppraisal = await this.dataSource.getRepository(Appraisal).save(appraisal);
            await this.notificationService.addNotifications(
                'appraisalEmployee', 
                `Please fill your ${appraisal.name} Appraisal form`, 
                savedAppraisal['id'], 
                savedAppraisal.companyId, 
                appraisal.managerId,
                appraisal.sharedWith.employeeIds
            );
            return {message: "added appraisal successfully", data: [savedAppraisal]};
        } catch (error) {
            this.logger.error(`Failed to create appraisal`, error.stack);
            throw new InternalServerErrorException();
        }
    }
    async putAppraisal(data: putAppraisalDto) {
        try {
            const appraisal: getAppraisalDto = await this.dataSource.query(
                `SELECT * FROM appraisal WHERE "id"='${data.id}'`,
              ).then(res => res[0]);
            if (data.hasOwnProperty('sharedWith')) {
                const newEmployeeIds = data.sharedWith.employeeIds.filter(item => !appraisal.sharedWith.employeeIds.includes(item));
                const removedEmployeeIds = appraisal.sharedWith.employeeIds.filter(item => !data.sharedWith.employeeIds.includes(item));
        
                for (let i=0; i< newEmployeeIds.length; i++) {
                    await this.notificationService.addNotifications(
                        'alert', 
                        `You are eligible for a ${appraisal.name} Appraisal!. Please fill this form`, 
                        appraisal.id, 
                        appraisal.companyId, 
                        newEmployeeIds[i]
                    );
                }
                for (let i=0; i< removedEmployeeIds.length; i++) {
                    await this.notificationService.addNotifications(
                        'alert', 
                        `Your ${appraisal.name} Appraisal has been terminated`, 
                        appraisal.id, 
                        appraisal.companyId, 
                        newEmployeeIds[i]
                    );
                }
                appraisal.sharedWith.employeeIds = appraisal.sharedWith.employeeIds.concat(newEmployeeIds);
                appraisal.sharedWith.employeeIds = appraisal.sharedWith.employeeIds.filter(item => !removedEmployeeIds.includes(item));
            }
            if (data.hasOwnProperty('name')) {
                appraisal.name = data.name;
            }
            if (data.hasOwnProperty('category')) {
                appraisal.category = data.category;
            }
            if (data.hasOwnProperty('templateId')) {
                appraisal.templateId = data.templateId;
            }
            if (data.hasOwnProperty('segments')) {
                appraisal.segments = data.segments;
            }
            if (data.hasOwnProperty('isActive')) {
                appraisal.isActive = data.isActive;
            }
            if (data.hasOwnProperty('managerId')) {
                appraisal.managerId = data.managerId;
            }
            if (data.hasOwnProperty('startDate')) {
                appraisal.startDate = data.startDate;
            }
            if (data.hasOwnProperty('endDate')) {
                appraisal.endDate = data.endDate;
            }
            const savedAppraisal = await this.dataSource.getRepository(Appraisal).save(appraisal);
            return {message: "updated appraisal successfully"};
        } catch (error) {
            this.logger.error(`Failed to update appraisal`, error.stack);
            throw new InternalServerErrorException();
        }
    }
    async deleteAppraisal(id: string) {
        try {
            await this.dataSource.getRepository(Appraisal).createQueryBuilder().delete().where({ id: id }).execute();
            return {message: "deleted appraisal successfully"};
        } catch (error) {
            this.logger.error(`Failed to delete appraisal`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async postSubmitAppraisal(submitAppraisal: SubmitAppraisalDto) {
        try {
            const appraisal: getAppraisalDto = await this.dataSource.query(
                `SELECT * FROM appraisal WHERE "id"='${submitAppraisal.appraisalId}'`,
              ).then(res => res[0]);
            let responseExists: ResponseDto;
            if (submitAppraisal.type === 'EMPLOYEE') {
                responseExists = appraisal.responses.find((r) => r.employeeId === submitAppraisal.employeeId);
            }
            else {
                responseExists = appraisal.responses.find((r) => r.employeeId === submitAppraisal.employeeId && r.to === submitAppraisal.to);
            }
            if (responseExists) {
                responseExists.status = submitAppraisal.status;
                responseExists.answers = submitAppraisal.answers;
                responseExists.submittedAt = new Date();
                if (submitAppraisal.hasOwnProperty('finalScore')) {
                    responseExists.finalScore = submitAppraisal.finalScore;
                }
                const updatedResponses = appraisal.responses.filter((r) => r.employeeId !== submitAppraisal.employeeId);
                updatedResponses.push(responseExists);
            }
            else {
                let newResponse = new ResponseDto();
                newResponse.id = uuidv4();
                newResponse.employeeId = submitAppraisal.employeeId;
                newResponse.to = submitAppraisal.to
                newResponse.type = submitAppraisal.type
                newResponse.status = submitAppraisal.status
                newResponse.answers = submitAppraisal.answers
                newResponse.submittedAt = new Date();
                if (submitAppraisal.hasOwnProperty('finalScore')) {
                    newResponse.finalScore = submitAppraisal.finalScore;
                }
                appraisal.responses.push(newResponse);
            }
            if (submitAppraisal.status === 'Completed' && submitAppraisal.type !== 'MANAGER') {
                const emp = submitAppraisal.type === 'EMPLOYEE';
                const responderId = emp ? submitAppraisal.employeeId : submitAppraisal.to;
                const employeeDetail: HrmEmployeeDetails = await this.dataSource.query(
                    `SELECT * FROM hrm_employee_details WHERE "employeeId"='${responderId}'`
                  ).then(res => res[0]);

                let assignedTo: HrmEmployeeDetails;
                if (!emp) {
                    assignedTo = await this.dataSource.query(
                        `SELECT * FROM hrm_employee_details WHERE "employeeId"='${submitAppraisal.to}'`
                      ).then(res => res[0]);
                }
                const msg = emp
                  ? `${employeeDetail.fullName.first} has successfully completed the ${appraisal.name} Appraisal form`
                  : `${employeeDetail.fullName.first}'s response has been successfully recorded for ${assignedTo.fullName.first}'s ${appraisal.name} Appraisal form`;
                await this.notificationService.addNotifications(
                    'alert', 
                    msg, 
                    appraisal.id, 
                    appraisal.companyId, 
                    appraisal.managerId
                );
            }
            await this.dataSource.getRepository(Appraisal).save(appraisal);
            return {message: "submitted appraisal successfully"};
        } catch (error) {
            this.logger.error(`Failed to submit appraisal`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async post360AppraisalRequest(AppraisalRequest360: AppraisalRequest360Dto) {
        try {
            const appraisal: getAppraisalDto = await this.dataSource.query(
                `SELECT * FROM appraisal WHERE "id"='${AppraisalRequest360.appraisalId}'`,
              ).then(res => res[0]);

            for (let i=0; i< AppraisalRequest360.employeeIds.length; i++) {
                const obj = {
                    employeeId: AppraisalRequest360.employeeIds[i],
                    to: AppraisalRequest360.to
                }
                appraisal.sharedWith['360Ids'].push(obj);
            }
            const savedAppraisal = await this.dataSource.getRepository(Appraisal).save(appraisal);
            await this.notificationService.addNotifications(
                'appraisal360', 
                `Request to fill the 360 ${appraisal.name} Appraisal Form`, 
                savedAppraisal['id'], 
                savedAppraisal.companyId, 
                appraisal.managerId,
                AppraisalRequest360.employeeIds
            );
            return {message: "added 360 appraisal request successfully"};
        } catch (error) {
            this.logger.error(`Failed to add 360 appraisal request`, error.stack);
            throw new InternalServerErrorException();
        }
    }
}
