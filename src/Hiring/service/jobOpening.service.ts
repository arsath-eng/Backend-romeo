import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../../allEntities/job.entity';
import { Repository } from 'typeorm';
import { String } from 'aws-sdk/clients/acm';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { timeout } from 'cron';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
//import { S3Service } from '@flows/s3/service/service';
//import {EventEmitter2} from '@nestjs/event-emitter';
const axios = require('axios')

@Injectable()
export class JobOpeningsService {
  private readonly API;
    constructor(
        private eventEmitter: EventEmitter2,
        private notificationService: NotificationService,
        //private readonly S3Service: S3Service,
        @InjectRepository(Job)
        private readonly jobRepositary:Repository<Job>,
        private readonly configService: ConfigService,
        //private eventEmitter: EventEmitter2
        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        
    ){
      this.API = axios.create({
        baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
      })
    }


    async createJob(body:any){

        try{
            const job = new Job();
            const sendEmail = body.sendEmail || false;
            job.name = body.name;
            job.status = body.status;
            job.employeementStatus = body.employeementStatus
            job.expirience = body.expirience;
            job.hiringLead = body.hiringLead;
            job.deadline = body.deadline;
            job.salary = body.salary
            job.department =body.department;
            job.requiredSkills = body.requiredSkills;
            job.address = body.address;
            job.jobDescription = body.jobDescription ;
            job.applicationQuestions = body.applicationQuestions ;
            job.creator = body.creator;
            job.sharedWith = body.sharedWith || [];
            job.companyId = body.companyId;
            job.candidates = body.candidates

            const saveJob = await this.jobRepositary.save(job)


             if (job.sharedWith.length  > 0 || job.hiringLead) {
            const notificationRecipients = new Set<string>(job.sharedWith);

          if (job.hiringLead) {
              notificationRecipients.add(job.hiringLead);
          }

          
          /* console.log(
            "All Notification Recipients (hiringLead + sharedWith):",
            Array.from(notificationRecipients)
          ); */

         
          const recipientIds = Array.from(notificationRecipients);
          // console.log(recipientIds,"recipientIds");
          const getCandidateEmails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                  "employeeId",
                  email ->> 'work' AS "userName",
                  "fullName" ->> 'first' AS "firstName",
                  "companyId"
              FROM "hrm_employee_details"
              WHERE "employeeId" = ANY($1)
              `,
              [recipientIds]
          );

          if (job.status.toLowerCase() !== 'draft') {
           
            for (const recipient of getCandidateEmails) {
              const email = recipient.userName;
              const fullName = recipient.firstName;
              const emitBody = {
                  sapCountType: 'candidate',
                  companyId: job.companyId,
                  subjects: 'Job Opening',
                  email: email,
                  body: `Hi ${fullName}, you have been invited to ${job.name}. Please check the job openings.`,
              };

              this.eventEmitter.emit('send.email', emitBody);
              
          }
        }

        
          

         
          if(job.status.toLowerCase() !== 'draft'){
          for (const recipientId of recipientIds) {
              await this.notificationService.addNotifications(
                  'jobInvitation',
                  `You have been invited to ${job.name}. Please check the job openings.`,
                  saveJob.id,
                  saveJob.companyId,
                  job.creator,
                  [recipientId]
              );
          }
        }
      }
     
       return {
            code: '201',
            jobs:[saveJob]
        }
        }catch(error){
            console.error(error)
            throw new HttpException('Failed to create job', HttpStatus.BAD_REQUEST)
        }
        
    }

    async getAllJobs (
        companyId?:string,
        status?:string,
        employeeId?:string,
        id?:String
    ){
        try{
            const query = this.jobRepositary.createQueryBuilder('job')
            .leftJoinAndSelect('job.candidates', 'candidate')
            .where('job.companyId = :companyId', { companyId })
            .orderBy('job.createdAt', 'DESC');

            if (id) {
                query.andWhere('job.id = :id', { id });
              }

            if (companyId) {
                query.andWhere('job.companyId = :companyId',{companyId})
            }
            if (status) {
                query.andWhere('job.status = :status',{status})
            }
            if (employeeId) {
                query.andWhere('job.employeeId = :employeeId',{employeeId})
            }
            

            const jobs = await query.getMany();

            const getjobs = jobs.map(job=>({
                id: job.id,
                name: job.name,
                status: job.status,
                employeementStatus: job.employeementStatus,
                expirience: job.expirience,
                hiringLead:job.hiringLead,
                deadline:job.deadline,
                department:job.department,
                salary: job.salary,
                requiredSkills: job.requiredSkills,
                address: job.address,
                jobDescription: job.jobDescription,
                applicationQuestions: job.applicationQuestions.map(appicationQuestion => ({
                    id:appicationQuestion.id,
                    required:appicationQuestion.required,
                    type:appicationQuestion.type,
                    question:appicationQuestion.question,
                    value:appicationQuestion.value,
                    multipleChoices:appicationQuestion.multipleChoices,
                    active:appicationQuestion.active

                })),
                creator: job.creator,
                sharedWith: job.sharedWith,
                candidates: job.candidates.map(candidate => ({
                  id: candidate.id,
                  name: candidate.name,
                  score: '0' 
              })),
                companyId: job.companyId,
                createdAt: job.createdAt.toISOString(),
                updatedAt: job.updatedAt.toISOString(),
            }))

            return {
                code: '200',
                jobs: getjobs,
              };

        }catch(error){
            console.log(error)
            throw new HttpException('failed to get jobs', HttpStatus.BAD_REQUEST)
        }
    }


    async updateJob(id: string, body: any) {
        try {
          let job = await this.jobRepositary.findOneBy({ id });
        
          if (!job) {
            throw new HttpException('job not found', HttpStatus.NOT_FOUND);
          }
        
          const newSharedWith = body['sharedWith'] || [];
          const currentSharedWith  = job.sharedWith || [];
        
          const currentHiringLead  = job.hiringLead;
          const newHiringLead = body['hiringLead'];
        
        const sendEmail = body['sendEmail'] || false;
        const isDraftToPublish = job.status.toLowerCase() === 'draft' && 
                                body['status'] && 
                                body['status'].toLowerCase() !== 'draft';
        
        const newUniqueSharedWith = newSharedWith.filter(id => !currentSharedWith.includes(id));
        
        const isHiringLeadUpdated = newHiringLead && currentHiringLead !== newHiringLead;
    
       
          job.name = body['name'] || job.name;
          job.status = body['status'] || job.status ;
          job.companyId = body['companyId'] || job.companyId ;
          job.employeementStatus = body['employeementStatus'] || job.employeementStatus ;
          job.expirience = body['expirience']  || job.expirience;
          job.hiringLead = body['hiringLead'] || job.hiringLead ;
          job.deadline = body['deadline'] || job.deadline;
          job.department = body['department'] || job.department;
          job.salary = body['salary'] || job.salary;
          job.requiredSkills = body['requiredSkills'] || job.requiredSkills;
          job.address = body['address'] || job.address;
          job.applicationQuestions = body['applicationQuestions'] || job.applicationQuestions;
          job.creator = body['creator'] || job.creator;
          job.sharedWith = body['sharedWith'] || job.sharedWith;
          job.candidates = body['candidates'] || job.candidates;
          job.jobDescription = body['jobDescription'] || job.jobDescription;
          const saveJob =  await this.jobRepositary.save(job);
        
       
        if (newUniqueSharedWith.length > 0 || isHiringLeadUpdated || isDraftToPublish) {
          const notificationRecipients = new Set<string>(
            isDraftToPublish ? job.sharedWith : newUniqueSharedWith
          );
          
          if (isHiringLeadUpdated || (isDraftToPublish && job.hiringLead)) {
            notificationRecipients.add(job.hiringLead);
          }
          
          if (notificationRecipients.size > 0) {
            const recipientIds = Array.from(notificationRecipients);
            
            const getCandidateEmails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                  "employeeId",
                  email ->> 'work' AS "userName",
                  "fullName" ->> 'first' AS "firstName",
                  "companyId"
              FROM "hrm_employee_details"
              WHERE "employeeId" = ANY($1)
              `,
              [recipientIds]
            );
            if (getCandidateEmails?.length && job.status.toLowerCase() !== 'draft') {
              for (const recipient of getCandidateEmails) {
                const email = recipient.userName;
                console.log(email, 'email');
                const fullName = recipient.firstName;
                const emitBody = {
                  sapCountType: 'jobInvitation',
                  companyId: job.companyId,
                  subjects: 'Job Opening',
                  email: email,
                  body: `Hi ${fullName}, you have been invited to ${job.name}. Please check the job openings.`,
                };
                this.eventEmitter.emit('send.email', emitBody);
              }
            }
            if(job.status.toLowerCase() !== 'draft'){
            for (const recipientId of recipientIds) {
              await this.notificationService.addNotifications(
                'jobInvitation',
                `You have been invited to ${job.name}. Please check the job openings.`,
                saveJob.id,
                saveJob.companyId,
                job.creator,
                [recipientId]
              );
            } 
          }
          }
        }

          return { id: job.id };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to update Job ', HttpStatus.BAD_REQUEST);
        }
      }

      async deleteJob(id: string) {
        try {
          await this.jobRepositary.delete(id);
          return {
            status: 200,
            description: 'Success',
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete Job ', HttpStatus.BAD_REQUEST);
        }
      }

      async  generateJob(req){
        try {
           console.log(req.body);
    
           const response = await this.API.post('hiring/job-description-html', req.body, {timeout: 600000});
           console.log(response.data);
           return response.data

        } catch (error) {
          console.log(error);
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }


    
}
