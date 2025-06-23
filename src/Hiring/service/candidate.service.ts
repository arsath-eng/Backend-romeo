import { Candidate } from '@flows/allEntities/candidate.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';
import { Job } from '@flows/allEntities/job.entity';
import { S3Service } from '../../s3/service/service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TalentPool } from '@flows/allEntities/talentPool.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { Interview } from '@flows/allDtos/candidate.dto';
import { OnEvent } from '@nestjs/event-emitter';
const axios = require('axios')
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { interviewEmailTemplate } from 'emailTemplate.util';
@Injectable()
export class CandidateService {
  private readonly API;
    constructor(
      private notificationService: NotificationService,
        private readonly APIService: APIService,
        @InjectDataSource() private dataSource: DataSource,
        @InjectRepository(Candidate)
        private readonly candidateRepository:Repository<Candidate>,
        
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        
        @InjectRepository(TalentPool)
        private readonly talentPoolRepository: Repository<TalentPool>,


        private s3Service: S3Service,
        private eventEmitter: EventEmitter2,

        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        
        private readonly configService: ConfigService,

        @InjectRepository(Files)
         private filesRepository: Repository<Files>,
        
    ){
      this.API = axios.create({
        baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
      })
    }


    async createCandidate(body: any) {
      try {
        /* if (!body.jobId) {
          throw new HttpException('Job ID is required', HttpStatus.BAD_REQUEST);
        } */
  
        
        /* if (!job) {
          throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
        } */
  
        const candidate = new Candidate();
        candidate.firstName = body.firstName;
        candidate.lastName = body.lastName;
        candidate.jobId = body.jobId || null;;
        candidate.status = body.status;
        candidate.email = body.email;
        candidate.gender = body.gender;
        candidate.phone = body.phone;
        candidate.address = body.address;
        candidate.applicationQuestions = body.applicationQuestions;
        candidate.companyId = body.companyId;
        candidate.rate = body.rate;
        candidate.creator = body.creator;
        candidate.sharedWith = body.sharedWith || [];
        candidate.hiringLead = body.hiringLead || '';
        candidate.notes = body.notes || [];
        candidate.emails = body.emails || [];
        candidate.interviews = body.interviews || [];
        candidate.activities = body.activities || [];
        candidate.jobName = body.jobName || '',
        candidate.employeementStatus = body.employeementStatus || [];
        candidate.department = body.department || ''
        candidate.summary = body.summary || '';
        candidate.score = body.score || ''
        
       


        
          

        
        let savedCandidate;

        if(body.jobId){
          const job = await this.jobRepository.findOne({ where: { id: body.jobId } });
          if (!job) {
            throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
          }
          // candidate.jobId = body.jobId ;
          if (!job.candidates) {
            job.candidates = [];
          }
          const savedCandidate = await this.candidateRepository.save(candidate);
          this.eventEmitter.emit('send.CVSummary', { candidate: savedCandidate });
          const companyId = savedCandidate.companyId;
          job.candidates.push({
            id: savedCandidate.id || '',
            name: savedCandidate.firstName,
            score: '4.5'
          });
          await this.jobRepository.create(job);
         if (body.emails.length>0){
          const result = await this.candidateRepository.query(
            `
            SELECT 
              jsonb_array_elements("emails") ->> 'subject' AS "subject",
              jsonb_array_elements("emails") ->> 'body' AS "body",
              jsonb_array_elements("emails") -> 'attachments' AS "attachments",
              "companyId"
            FROM "candidate"
            WHERE "id" = $1
            `,
            [savedCandidate.id]
          );

        const subject = result[0]?.subject;
       // const companyId = result[0]?.companyId;
        const Emailbody = result[0]?.body;
        const attachments = result[0]?.attachments || [];

        const attachmentFiles = [];
        for (const attachmentId of attachments) {
        const file = await this.dataSource.getRepository(Files).findOne({
          where: { id: attachmentId }
        });
        
        if (file) {
          
          const signedUrl = await this.s3Service.getDocumentLink(file.link);
          
          attachmentFiles.push({
            path: signedUrl,
            filename: file.name || 'attachment'
          });
        }
      }

        if (attachmentFiles.length > 0) {
       
          const emitBody = {
            sapCountType: 'candidate',
            companyId,
            subjects: subject,
            email: savedCandidate.email,
            body: Emailbody,
            attachments: attachmentFiles
          };
          this.eventEmitter.emit('send.email.with.S3attachments', emitBody);
        } else {
          
          const emitBody = {
            sapCountType: 'OfferLetter',
            companyId,
            subjects: subject,
            email: savedCandidate.email,
            body: Emailbody
          };
          this.eventEmitter.emit('send.email', emitBody);
        }
          }

          if(body.interviews.length>0){
            const interviewsResult = await this.candidateRepository.query(
              `SELECT 
              jsonb_array_elements("interviews") ->> 'candidateId' AS "candidateId",
              jsonb_array_elements("interviews") ->> 'title' AS "title",
              jsonb_array_elements("interviews") -> 'date' AS "date",
              jsonb_array_elements("interviews") ->> 'time' AS "time",
              jsonb_array_elements("interviews") ->> 'type' AS "type",
              jsonb_array_elements("interviews") ->> 'meetingLink' AS "meetingLink",
              jsonb_array_elements("interviews") ->> 'sendEmail' AS "sendEmail",
              jsonb_array_elements("interviews") ->> 'sharedWith' AS "sharedWith",
              "companyId"
            FROM "candidate"
            WHERE "id" = $1
            `,
            [savedCandidate.id]
          );
          const candidateId = interviewsResult[0]?.candidateId;
          const title = interviewsResult[0]?.title;
          const date = interviewsResult[0]?.date;
          const type = interviewsResult[0]?.type;
          const time = interviewsResult[0]?.time;
          const meetingLink = interviewsResult[0]?.meetingLink;
          
          const sendEmail = interviewsResult[0]?.sendEmail;
  
          // console.log("before sendEmail === true","title: ",title,"date: ",date,"time: ",time,"meetingLink: ",meetingLink,"sendEmail: ",sendEmail, body.email  )
          
          const company = await this.APIService.getCompanyById(companyId);
          if (sendEmail && sendEmail.toLowerCase() === 'true'){
            // console.log("title: ",title,"date: ",date,"time: ",time,"meetingLink: ",meetingLink,"sendEmail: ",sendEmail, body.email  )
            const EmailBody = await interviewEmailTemplate(company.companyName,body.firstName,title,date,time,meetingLink);
  
            const emitBody = {
              sapCountType: 'interview',
              companyId,
              subjects: 'Interview Invitation',
              email: body.email,
              body: EmailBody,
            };
  
    
            this.eventEmitter.emit('send.email', emitBody);
          }

        
        }
         
          
        
          return {
            code: '201',
            candidate: savedCandidate,
          };
        }else{
          const savedCandidate = await this.candidateRepository.save(candidate);
          this.eventEmitter.emit('send.CVSummary', { candidate: savedCandidate });
          if (body.emails.length>0){
            const result = await this.candidateRepository.query(
              `SELECT 
              jsonb_array_elements("emails") ->> 'subject' AS "subject",
              jsonb_array_elements("emails") ->> 'body' AS "body",
              jsonb_array_elements("emails") -> 'attachments' AS "attachments",
              "companyId"
            FROM "candidate"
            WHERE "id" = $1`,
            [savedCandidate.id]
          );

         

          const subject = result[0]?.subject;
          const companyId = result[0]?.companyId;
          const Emailbody = result[0]?.body;
          const attachments = result[0]?.attachments || [];
  
          const attachmentFiles = [];
          for (const attachmentId of attachments) {
          const file = await this.dataSource.getRepository(Files).findOne({
            where: { id: attachmentId }
          });
          
          if (file) {
            
            const signedUrl = await this.s3Service.getDocumentLink(file.link);
            
            attachmentFiles.push({
              path: signedUrl,
              filename: file.name || 'attachment'
            });
          }
        }
  
          if (attachmentFiles.length > 0) {
            
            const emitBody = {
              sapCountType: 'candidate',
              companyId,
              subjects: subject,
              email: savedCandidate.email,
              body: Emailbody,
              attachments: attachmentFiles
            };
            this.eventEmitter.emit('send.email.with.S3attachments', emitBody);
          } else {
            //  emails without attachments
            const emitBody = {
              sapCountType: 'OfferLetter',
              companyId,
              subjects: subject,
              email: savedCandidate.email,
              body: Emailbody
            };
            this.eventEmitter.emit('send.email', emitBody);
          }
          
          }

          if(body.interviews.length>0){
            const interviewsResult = await this.candidateRepository.query(
              `SELECT 
              jsonb_array_elements("interviews") ->> 'candidateId' AS "candidateId",
              jsonb_array_elements("interviews") ->> 'title' AS "title",
              jsonb_array_elements("interviews") -> 'date' AS "date",
              jsonb_array_elements("interviews") ->> 'time' AS "time",
              jsonb_array_elements("interviews") ->> 'type' AS "type",
              jsonb_array_elements("interviews") ->> 'meetingLink' AS "meetingLink",
              jsonb_array_elements("interviews") ->> 'sendEmail' AS "sendEmail",
              jsonb_array_elements("interviews") ->> 'sharedWith' AS "sharedWith",
              "companyId"
            FROM "candidate"
            WHERE "id" = $1
            `,
            [savedCandidate.id]
          );
          const candidateId = interviewsResult[0]?.candidateId;
          const title = interviewsResult[0]?.title;
          const date = interviewsResult[0]?.date;
          const type = interviewsResult[0]?.type;
          const time = interviewsResult[0]?.time;
          const meetingLink = interviewsResult[0]?.meetingLink;
          const companyId = interviewsResult[0]?.companyId;
          
          const sendEmail = interviewsResult[0]?.sendEmail;
  
  
          
          const company = await this.APIService.getCompanyById(companyId);
          if (sendEmail && sendEmail.toLowerCase() === 'true'){
            const EmailBody = await interviewEmailTemplate(company.companyName,body.firstName,title,date,time,meetingLink);
  
            const emitBody = {
              sapCountType: 'interview',
              companyId,
              subjects: 'Interview Invitation',
              email: body.email,
              body: EmailBody,
            };
  
    
            this.eventEmitter.emit('send.email', emitBody);
          }
          
        }
        return {
          code: '201',
          candidate: savedCandidate,
        };
        }
  
      } catch (error) {
        console.error(error);
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException('Failed to create candidate', HttpStatus.BAD_REQUEST);
      }
      

      
    }

    @OnEvent('send.CVSummary')
    async CVSummary(emitterBody: { candidate: Candidate }) {
      try {
        const { candidate } = emitterBody;
    
        if (
          candidate.applicationQuestions &&
          candidate.applicationQuestions.some(
            (question) => question.question === 'Resume'
          )
        ) {
          const resumeQuestion = candidate.applicationQuestions.find(
            (question) => question.question === 'Resume'
          );
          const id = resumeQuestion?.value;
    
          if (id) { 
            const Link = await this.filesRepository.findOne({
              where: { id: id },
              select: ['link'],
            });
    
            if (!Link) {
              console.log(
                'No CV link found',
                candidate.companyId,
                candidate.jobId,
                candidate.id
              );
              return;
            }
    
            const fileLink = Link.link;
            const cvLink = await this.s3Service.getDocumentLink(fileLink);
    
            const summary = {
              token: '',
              companyId: candidate.companyId,
              cvLink,
              jobId: candidate.jobId,
              candidateId: candidate.id,
            };
    
            const response = await this.API.post('/hiring/candidate-summary', summary);
    
            await this.candidateRepository.update(candidate.id, {
              summary: response.data.summary || '',
              score: response.data.cv_score || '',
            });
          } else {
            console.log('No Resume ID found for candidate:', candidate.id);
          }
        } else {
          await this.candidateRepository.update(candidate.id, {
            summary: '',
            score: '',
          });
        }
      } catch (error) {
        console.error('Error handling CVSummary event:', error);
      }
    }
      async getCandidates(companyId: string, id?: string) {
        try {
          const query = this.candidateRepository.createQueryBuilder('candidate')
            .where('candidate.companyId = :companyId', { companyId })
            .orderBy('candidate.createdAt', 'DESC');
    
          if (id) {
            query.andWhere('candidate.id = :id', { id });
          }
    
          const candidates = await query.getMany();
    
          return {
            code: '200',
            candidates,
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to get candidates', HttpStatus.BAD_REQUEST);
        }
      }

      async updateCandidate(id: string, body: Body,userId: string) {
        try {
            let candidate = await this.candidateRepository.findOneBy({ id });
            if (!candidate) {
                throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND);
            }
    
            const activities = [...candidate.activities || []];


            const previousInterviews = candidate.interviews || [];
           

            const previousEmails = candidate.emails || [];
          
            let lastRate = candidate.rate;
            let lastStatus = candidate.status;
            for (let i = activities.length - 1; i >= 0; i--) {
                if (activities[i].rate !== undefined) {
                    lastRate = activities[i].rate;
                    break;
                }
            }
            for (let i = activities.length - 1; i >= 0; i--) {
                if (activities[i].status !== undefined) {
                    lastStatus = activities[i].status;
                    break;
                }
            }

            
            if (body['rate'] && body['rate'] !== lastRate) {
                activities.push({
                    activity: 'Rate changed',
                    type: 'RATE', //HIRED
                    status: '',
                    rate: body['rate'],
                    editorId: userId || candidate.creator,
                    
                    
                });
            }

            
            if (body['status'] && body['status'] !== lastStatus) {
                activities.push({
                    activity: 'Status set to ' + body['status'],
                    type: 'STATUS',
                    status: body['status'],
                    rate: body['rate'] || lastRate,
                    editorId: userId || candidate.creator,
                    
                });
            }

    
            
            if (body['notes'] && body['notes'].length > candidate.notes.length) {
                activities.push({
                    activity: 'Note added',
                    type: 'NOTE',
                    status: '',
                    rate: body['rate'],  
                    editorId: userId || candidate.creator,
                   
                });
            }
    
            
            if (body['emails'] && body['emails'].length > candidate.emails.length) {
                activities.push({
                    activity: 'Email added',
                    type: 'EMAIL',
                    status: '',
                    rate: body['rate'],  
                    editorId: userId || candidate.creator,
                    
                });
            }

            candidate.firstName = body['firstName'] || candidate.firstName;
            candidate.lastName = body['lastName'] || candidate.lastName;
            candidate.jobId = body['jobId'] || candidate.jobId ;
            candidate.status = body['status'] || candidate.status  ;

            candidate.email = body['email'] || candidate.email ;
            candidate.gender = body['gender'] || candidate.gender ;
            candidate.phone = body['phone'] || candidate.phone ;
            candidate.address = body['address'] || candidate.address ;
            candidate.applicationQuestions = body['applicationQuestions'] || candidate.applicationQuestions ;
            candidate.rate = body['rate'] || candidate.rate ;
            candidate.creator = body['creator'] || candidate.creator ;
            candidate.sharedWith = body['sharedWith'] || candidate.sharedWith ;
            candidate.hiringLead = body['hiringLead'] || candidate.hiringLead  ;
            candidate.notes = body['notes'] || candidate.notes  ;
            console.log('testing')
            candidate.activities = activities;
            candidate.jobName = body['jobName'] || candidate.email ,
            candidate.employeementStatus = body["employeementStatus"] || candidate.employeementStatus ;
            candidate.department = body["department"] || candidate.department 
            candidate.summary =  body["summary"] || candidate.summary ;
            candidate.score =  body["score"] || candidate.score ;

            if (body.hasOwnProperty('interviews')) {
              const newInterviews: Interview[] = body['interviews'].filter(item => !candidate.interviews.includes(item)); 
              const removedInterviews: Interview[] = candidate.interviews.filter(item => !body['interviews'].includes(item));
              for (let i=0; i<newInterviews.length; i++) {
                await this.notificationService.addNotifications(
                  'alert',
                  `You are assigned to conduct an Interview (${newInterviews[i].title}) for ${candidate.firstName} ${candidate.lastName} for the position of ${candidate.jobName} in the ${candidate.department} department on ${newInterviews[i].date} at ${newInterviews[i].time}`,
                  candidate.id,
                  candidate.companyId,
                  userId,
                  newInterviews[i].sharedWith
                );
              }
              for (let i=0; i<removedInterviews.length; i++) {
                await this.notificationService.addNotifications(
                  'alert',
                  `Interview (${removedInterviews[i].title}) for ${candidate.firstName} ${candidate.lastName} has been removed`,
                  candidate.id,
                  candidate.companyId,
                  userId,
                  removedInterviews[i].sharedWith
                );
              }
              candidate.interviews = body['interviews']
            }

            candidate.emails = body['emails'] || candidate.emails
           
            if (body['emails'] && Array.isArray(body['emails']) && body['emails'].length > 0 ) {
              candidate.emails = body['emails'];
              const addedEmails = body['emails'].filter(newEmail =>
                  !previousEmails.some(existingEmail => existingEmail.id === newEmail.id),
              );
              // candidate.emails = [...previousEmails, ...addedEmails];
  
              if (addedEmails.length > 0) {
                  for (const addedEmail of addedEmails) {
                    /* const result = await this.candidateRepository.query(
                      `
                      SELECT 
                        jsonb_array_elements("emails") ->> 'subject' AS "subject",
                        jsonb_array_elements("emails") ->> 'body' AS "body",
                        jsonb_array_elements("emails") -> 'attachments' AS "attachments",
                        "companyId"
                      FROM "candidate"
                      WHERE "id" = $1
                      `,
                      [candidate.id]
                    ); */
  
                    console.log("candidate.id",candidate.id)
                      const subject = addedEmail.subject;
                      const Emailbody = addedEmail.body;
                      const attachments = addedEmail.attachments || [];
                      const attachmentFiles = [];
  
                      for (const attachmentId of attachments) {
                          const file = await this.dataSource.getRepository(Files).findOne({
                              where: { id: attachmentId },
                          });
  
                          if (file) {
                              const signedUrl = await this.s3Service.getDocumentLink(file.link);
                              attachmentFiles.push({
                                  path: signedUrl,
                                  filename: file.name || 'attachment',
                              });
                          }
                      }
                      //console.log(candidate.companyId,candidate.email,subject,Emailbody)
  
                      const emitBody = {
                          sapCountType: 'candidate',
                          companyId: candidate.companyId,
                          subjects: subject,
                          email: candidate.email,
                          body: Emailbody,
                          attachments: attachmentFiles.length > 0 ? attachmentFiles : undefined,
                      };
  
                      if (attachmentFiles.length > 0) {
                          this.eventEmitter.emit('send.email.with.S3attachments', emitBody);
                      } else {
                          this.eventEmitter.emit('send.email', emitBody);
                      }
                  }
              }
          }
  
          
          if (body['interviews']  && Array.isArray(body['interviews']) && body['interviews'].length > 0 ) {
            candidate.interviews = body['interviews'];
            const addedInterviews = body['interviews'].filter(newInterview =>
                !previousInterviews.some(existingInterview => existingInterview.id === newInterview.id),
            );
            // candidate.interviews = [...previousInterviews, ...addedInterviews];

            const modifiedInterviews = candidate.interviews.filter(
              newInterview => previousInterviews.some(
                  existingInterview => existingInterview.id === newInterview.id 
              )
          );

            if(modifiedInterviews.length>0){
              candidate.interviews = [...modifiedInterviews, ...addedInterviews];

            }else{
              candidate.interviews = [...previousInterviews, ...addedInterviews];

            }
  
              if (addedInterviews.length > 0) {
                  for (const newInterview of addedInterviews) {
                      /* const interviewsResult = await this.candidateRepository.query(
                          `SELECT 
                              jsonb_array_elements("interviews") ->> 'candidateId' AS "candidateId",
                              jsonb_array_elements("interviews") ->> 'title' AS "title",
                              jsonb_array_elements("interviews") -> 'date' AS "date",
                              jsonb_array_elements("interviews") ->> 'time' AS "time",
                              jsonb_array_elements("interviews") ->> 'type' AS "type",
                              jsonb_array_elements("interviews") ->> 'meetingLink' AS "meetingLink",
                              jsonb_array_elements("interviews") ->> 'sendEmail' AS "sendEmail",
                              "companyId"
                          FROM "candidate"
                          WHERE "id" = $1`,
                          [candidate.id],
                      ) */;
  
                      const title =newInterview.title;
                      const date = newInterview.date;
                      const time = newInterview.time;
                      const meetingLink = newInterview.meetingLink;
                      const sendEmail = newInterview.sendEmail;
                      const companyId = newInterview.companyId;
                      
          
                      
              
                      // console.log(candidate.email)
              
                      
                      const company = await this.APIService.getCompanyById(candidate.companyId);

                      if (sendEmail) {
                        const sendEmailString = String(sendEmail).toLowerCase();
                        if (sendEmailString === 'true' ){
                            const Emailbody = await interviewEmailTemplate(
                                company.companyName,
                                candidate.firstName,
                                title,
                                date,
                                time,
                                meetingLink,
                            );
    
                            const emitBody = {
                                sapCountType: 'interview',
                                companyId: candidate.companyId,
                                subjects: 'Interview Invitation',
                                email: candidate.email,
                                body: Emailbody,
                            };
                            // console.log(candidate.email,Emailbody)
                            this.eventEmitter.emit('send.email', emitBody);


                        }
                    }
                  }
              }
          }

           
    
            
            

            await this.candidateRepository.save(candidate);
            
    
            return { id: candidate.id };
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to update candidate', HttpStatus.BAD_REQUEST);
        }
    }


      async deleteCandidate(id: string) {
        
        try {
          const candidate = await this.candidateRepository.findOneBy({ id });
         if (!candidate) {
             throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND);
         }
            
           await this.removeCandidateFromAllPools(id);
           await this.candidateRepository.delete(id);
          return {
            status: 200,
            description: 'Success',
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete Candidate Job ', HttpStatus.BAD_REQUEST);
        }
      }
      async removeCandidateFromAllPools(candidateId: string) {
        try {
            
            const talentPools = await this.talentPoolRepository.find();
            
            
            for (const pool of talentPools) {
                if (pool.candidates && Array.isArray(pool.candidates)) {
                    pool.candidates = pool.candidates.filter(id => id !== candidateId);
                    await this.talentPoolRepository.save(pool);
                }
            }
        } catch (error) {
            console.error('Error removing candidate from talent pools:', error);
            throw new HttpException('Failed to remove candidate from talent pools', HttpStatus.BAD_REQUEST);
        }
    }

    async generateSummary(req): Promise<any> {
      try {
        //console.log("calling");
    
        const candidate = await this.candidateRepository.findOneBy({ id: req.body.candidateId });
        //console.log(candidate);
    
        if (!candidate) {
          throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND);
        }

        await this.CVSummary({ candidate });

        return await this.candidateRepository.findOneBy({ id: candidate.id });

    
        
      } catch (error) {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
    
}

export interface Note {
  id: string;
  note: string;
  employeeId: string;
  replyId?: string;
  createdAt: string;
  modifiedAt?: string;
}

// export interface Interview {
//   id: string;
//   date: string;
//   time: string;
//   type: string;
//   title: string;
//   sendEmail: boolean;
//   sharedWith: string[];
//   notes: Note[];
//   candidateId: string;
//   description: string;
//   meetingLink?: string;
// }


interface CVSummaryResponse {
  summary: string;
  score: string;
}
/*   async generateSummary(req): Promise<any> {
  try {
    console.log("calling");

    const candidate = await this.candidateRepository.findOneBy({ id: req.body.candidateId });
    console.log(candidate);

    if (!candidate) {
      throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND);
    }

    if (
      candidate.applicationQuestions &&
      candidate.applicationQuestions.some((question) => question.type === 'Resume')
    ) {
      const resumeQuestion = candidate.applicationQuestions.find((question) => question.type === 'Resume');
      const Link = resumeQuestion?.value;

      if (!Link) {
        console.log('No CV link found', candidate.companyId, candidate.jobId, candidate.id);
        await this.candidateRepository.update(candidate.id, {
          summary: '',
          score: '',
        });
        return await this.candidateRepository.findOneBy({ id: candidate.id });
      }

      const cvLink = await this.s3Service.getDocumentLink(Link);

      const summaryRequest = {
        token: '',
        companyId: candidate.companyId,
        cvLink,
        jobId: candidate.jobId,
        candidateId: candidate.id,
      };

      // const response =  this.eventEmitter.emit('send.CVSummary', { candidate: candidate });
      const response = await this.API.post('/hiring/candidate-summary', summaryRequest);

      await this.candidateRepository.update(candidate.id, {
        summary: response.data.summary || '',
        score: response.data.cv_score || '',
      });
      console.log(response.data.summary,response.data.cv_score)

      return await this.candidateRepository.findOneBy({ id: candidate.id });
    } else {
      await this.candidateRepository.update(candidate.id, {
        summary: '',
        score: '',
      });
      return await this.candidateRepository.findOneBy({ id: candidate.id });
    }
  } catch (error) {
    console.error(error);
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
 */
