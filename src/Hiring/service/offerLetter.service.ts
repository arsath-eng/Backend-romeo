import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OfferLetters } from '../../allEntities/offerLetters.entity'
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository ,DataSource} from 'typeorm';
import { Exception } from 'handlebars';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { Candidate } from '@flows/allEntities/candidate.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { S3Service } from '../../s3/service/service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from '@flows/allEntities/job.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
import { offerLetterEmailTemplate } from 'emailTemplate.util';
@Injectable()
export class OfferLettersService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly APIService: APIService,
        @InjectRepository(OfferLetters)
        private readonly offerLettersRepository: Repository<OfferLetters>,

        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,

        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,

        private s3Service: S3Service,
        private eventEmitter: EventEmitter2,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
    ){}


    async postOfferLetters(body:any){

        try{
            const offerLetters = new OfferLetters();

            offerLetters.candidateId = body.candidateId;
            offerLetters.content = body.content;
            offerLetters.expireDate = body.expireDate;
            offerLetters.startDate = body.startDate;
            offerLetters.job = body.job;
            offerLetters.salary = body.salary;
            offerLetters.payPeriod = body.payPeriod;
            offerLetters.files = body.files;
            offerLetters.supervisor = body.supervisor;
            offerLetters.status = body.status;
            offerLetters.seen = body.seen;
            offerLetters.accept = body.accept;
            offerLetters.companyId = body.companyId;

            const savedOfferLetter = await this.offerLettersRepository.save(offerLetters);

            const offerLetterId =savedOfferLetter.id


            const result = await this.candidateRepository.query(
              `SELECT 
                "firstName", 
                "jobId", 
                "hiringLead", 
                "jobName",
                "email"
              FROM "candidate"
              WHERE "id" = $1`,
              [body.candidateId]
            );


            const candidateName = result[0]?.firstName;
            const jobId = result[0]?.jobId;
            const employeeId = result[0]?.hiringLead;
            const jobRole = result[0]?.jobName;
            const candidateEmail = result[0]?.email;
            const jobName = body.job.name;
            //console.log("===============candidateName",candidateName,"hiringLead: ",employeeId,"jobRole: ",jobRole,"candidateEmail: ",candidateEmail)

            const result3 = await this.employeeDetailsRepository.query(
              `SELECT 
                  email ->> 'work' AS "userName",
                  "fullName" ->> 'first' AS "firstName",
                  "companyId"
               FROM "hrm_employee_details"
               WHERE "employeeId" = $1`,
              [body.supervisor]
            );
            const hiringLeadmail = result3[0]?.userName;
            const firstName = result3[0]?.firstName;
            const companyId = result3[0]?.companyId;

             //console.log("test supervisor hiringLeadmail",hiringLeadmail,"hiringLeadname: ",firstName,companyId,jobName)

            
            
            const company = await this.APIService.getCompanyById(companyId);

            if(body.status =='Published'){
              const Emailbody = await offerLetterEmailTemplate(company.companyName,candidateName,hiringLeadmail,firstName,jobName,offerLetterId,companyId);
              const emitBody = { sapCountType:'OfferLetter',companyId, subjects: 'Offer Letter', email: candidateEmail, body: Emailbody};
              this.eventEmitter.emit('send.email', emitBody);
            }
            

            
            return {
            code: '201',
            offerLetter: [savedOfferLetter],
            };
            
            

        }catch(error){
            console.log(error)
            throw new HttpException('error creating offer letter',HttpStatus.BAD_REQUEST)
        }
        
    }

    async getOfferLetters(companyId: string, id?: string){
        try{
            const company = await this.APIService.getCompanyById(companyId);
            const query = this.offerLettersRepository.createQueryBuilder('OfferLetters')
                .where('OfferLetters.companyId =:companyId' ,{companyId})
                .orderBy('OfferLetters.createdAt','DESC')
            
                if (id) {
                    query.andWhere('OfferLetters.id = :id', { id });
                  }

                  const OfferLetters = await query.getMany();     

                  const getOfferLetters = await Promise.all(
                    OfferLetters.map(async (offerLetter) => {
                      /* const files = await this.filesRepository.find({
                        where: { id: In(offerLetter.files) },
                      });
                      const formattedFiles = files.map(file => ({
                        name: file.name,
                        format: file.format,
                      })); */
              
                      return {
                        id: offerLetter.id,
                        candidateId: offerLetter.candidateId,
                        content: offerLetter.content,
                        expireDate: offerLetter.expireDate,
                        startDate: offerLetter.startDate,
                        job: offerLetter.job,
                        salary: offerLetter.salary,
                        payPeriod: offerLetter.payPeriod,
                        files: offerLetter.files,
                        supervisor: offerLetter.supervisor,
                        status: offerLetter.status,
                        seen: offerLetter.seen,
                        accept: offerLetter.accept,
                        companyId: offerLetter.companyId,
                        createdAt: offerLetter.createdAt,
                        modifiedAt: offerLetter.modifiedAt,
                      };
                    }),
                  );
              
            return {
                code: '200',
                offerLetter: getOfferLetters,
              };



        }catch(error){
            throw new HttpException('error', HttpStatus.BAD_REQUEST)
        }
    }


    async updateOfferLetters(id: string, body: any) {
        try {
          let offerLetter = await this.offerLettersRepository.findOneBy({ id });
          if (!offerLetter) {
            throw new HttpException('offerLetter not found', HttpStatus.NOT_FOUND);
          }
          
            
            offerLetter.content = body['content'];
            offerLetter.expireDate = body['expireDate'];
            offerLetter.startDate = body['startDate'];
            offerLetter.job = body['job'];
            offerLetter.salary = body['salary'];
            offerLetter.payPeriod = body['payPeriod'];
            offerLetter.files = body['files'];
            offerLetter.supervisor = body['supervisor'];
            offerLetter.status = body['status'];
            offerLetter.seen = body['seen'];
            offerLetter.accept = body['accept'];

            await this.offerLettersRepository.save(offerLetter);

            const result = await this.candidateRepository.query(
              `SELECT 
                "firstName", 
                "jobId", 
                "hiringLead", 
                "jobName",
                "email"
              FROM "candidate"
              WHERE "id" = $1`,
              [offerLetter.candidateId]
            );


            const candidateName = result[0]?.firstName;
            const jobId = result[0]?.jobId;
            const employeeId = result[0]?.hiringLead;
            const jobRole = result[0]?.jobName;
            const candidateEmail = result[0]?.email;

            const result3 = await this.employeeDetailsRepository.query(
              `SELECT 
                  email ->> 'work' AS "userName",
                  "fullName" ->> 'first' AS "firstName",
                  "companyId"
               FROM "hrm_employee_details"
               WHERE "employeeId" = $1`,
              [employeeId]
            );
            const hiringLeadmail = result3[0]?.userName;
            const firstName = result3[0]?.firstName;
            const companyId = result3[0]?.companyId;

            const jobName = body['job'].name;
            //console.log("jobName0",jobName)
            
            const company = await this.APIService.getCompanyById(companyId);

            if(body['status']== 'Published'){
              const Emailbody = await offerLetterEmailTemplate(company.companyName,candidateName,hiringLeadmail,firstName,jobName,offerLetter.id,companyId);
              const emitBody = { sapCountType:'OfferLetter',companyId, subjects: 'Offer Letter', email: candidateEmail, body: Emailbody};
              this.eventEmitter.emit('send.email', emitBody);
            }
           

            return {
                id: offerLetter.id 
            };

        }catch(error){
            console.log(error)
            throw new HttpException('error', HttpStatus.BAD_REQUEST)
        }
    }
    
    
    async deleteofferLetters(id: string) {
        try {
          await this.offerLettersRepository.delete(id);
          return {
            status: 200,
            description: 'Success',
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete offerLetter', HttpStatus.BAD_REQUEST);
        }
      }
}
