import { Career } from '@flows/allEntities/career.entity';
import { Files } from '@flows/allEntities/newFiles.entity';
import { OfferLetters } from '@flows/allEntities/offerLetters.entity';
import { S3Service } from '@flows/s3/service/service';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, In ,DataSource} from 'typeorm';
import { Job } from '@flows/allEntities/job.entity';
import { Candidate } from '@flows/allEntities/candidate.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
@Injectable()
export class CareerService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly APIService: APIService,
        private s3Service: S3Service,

        @InjectRepository(Files)
         private filesRepository: Repository<Files>,
        @InjectRepository(Career)
        private readonly careerRepository: Repository<Career>,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        
        @InjectRepository(OfferLetters)
        private readonly offerLettersRepository: Repository<OfferLetters>,

        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,
        

        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
      ) {}



      async createCareer(body:any){
        try{
          const job = await this.jobRepository.findOne({ where: { id: body.jobId } });
            if (!job) {
                throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
            }
            
            const career = new Candidate();
            

            career.firstName = body.firstName;
            career.lastName = body.lastName;
            career.jobId = body.jobId;
            career.status = body.status;
            career.email = body.email;
            career.gender = body.gender;
            career.phone = body.phone;
            
            career.rate = body.rate;
            
            
            
            
            career.address = body.address;
            career.applicationQuestions = body.applicationQuestions;
            career.companyId = body.companyId;
            career.notes = body.notes || [];
            career.emails = body.emails || [];
            career.interviews = body.interviews || [];
            
            career.activities = body.activities || [];

            career.jobName = body.jobName || '',
            career.employeementStatus = body.employeementStatus || [];
            career.department = body.department || ''
            career.summary = body.summary || ''
            career.score = body.score || ''
            
            if(body.jobId){
                const job = await this.jobRepository.findOne({ where: { id: body.jobId } });
                if (!job) {
                  throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
                }
                career.sharedWith = job.sharedWith
                career.creator = job.creator 
                career.hiringLead = job.hiringLead
                const savedCandidate = await this.candidateRepository.save(career);
                
                return {
                  code: '201',
                  career: savedCandidate,
                };
              }else{
                const savedCandidate = await this.candidateRepository.save(career);
            return {
              code: '201',
              career: savedCandidate,
            };
              }

        }catch(error){
            console.log(error)
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
        }
      }

      async getCareer(companyId,id){
        try{
          
            const query = this.jobRepository.createQueryBuilder('job')
            .leftJoinAndSelect('job.candidates', 'candidate')
            .where('job.companyId = :companyId', { companyId })
            .orderBy('job.createdAt', 'DESC');
      
          if (id) {
            query.andWhere('job.id = :id', { id });
          }

          const careers = await query.getMany();

          const getCareers = careers.map(career => ({
            id: career.id,
            name:career.name,
            address : career.address,
            applicationQuestions : career.applicationQuestions,
            companyId : career.companyId,
            jobDescription : career.jobDescription,
            requiredSkills : career.requiredSkills,
            salary:career.salary,
            expirience:career.expirience,
            employeementStatus:career.employeementStatus,
            createdAt:career.createdAt,
            updatedAt:career.updatedAt,
            
            candidates: career.candidates.map(candidate => ({
              id: candidate.id,
              name: candidate.name,
              score: '0' 
          })),
            
          
            deadline : career.deadline,
            department : career.department,
            status:career.status
          }))

          return {
            code: '200',
            careers: getCareers,
          };

        }catch(error){
            console.log('error')
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
        }
      }

      /* async updateCareer(id,body:any){
        try{
            let career = await this.careerRepository.findOneBy({ id });
          if (!career) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
          }


            career.firstName = body['firstName'];
            career.lastName = body['lastName'];
            career.jobId = body['jobId'];
            career.status = body['status'];
            career.email = body['email'];
            career.gender = body['gender'];
            career.phone = body['phone'];
            career.address = body['address'];
            career.applicationQuestions = body['applicationQuestions'];
            career.jobDescription = body['jobDiscription'];
            career.requiredSkills = body['requiredSkils'];


            await this.careerRepository.save(career);

            return {
                code: '200',
                careers: career.id,
              };
        }catch(error){
            console.log('error')
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
        }
      } */

      async deleteCareer(id: string) {
        try {
          await this.careerRepository.delete(id);
          return {
            status: 200,
            description: 'Success',
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete career ', HttpStatus.BAD_REQUEST);
        }
      }


      async updateOfferLetter(id: string, body: any) {
        try {
            let offerLetter = await this.offerLettersRepository.findOneBy({ id });
            if (!offerLetter) {
                throw new HttpException('Offer Letter not found', HttpStatus.NOT_FOUND);
            }
    
            offerLetter.seen = body.seen;
            offerLetter.accept = body.accept??null ;
    
            const updatedOfferLetter = await this.offerLettersRepository.save(offerLetter);

            return {
                code: 201,
                message:[updatedOfferLetter]
            }

        }catch(error){
            console.log(error)
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
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

                  const offerLetters = await query.getMany();    
            
              const getOfferLetters = await Promise.all(offerLetters.map(async (offerLetter) => {
              const candidate = await this.candidateRepository.findOne({ where: { id: offerLetter.candidateId } });
              const supervisor = await this.employeeDetailsRepository.findOne({ where: { employeeId: offerLetter.supervisor } });
              /* const files = await this.filesRepository.find({
                where: { id: In(offerLetter.files) },
              }); */
              /* const formattedFiles = files.map(file => ({
                name: file.name,
                format: file.format,
              })); */

                      let filesWithLinks = [];
                      
                      if (offerLetter.files && offerLetter.files.length > 0) {
                        filesWithLinks = await Promise.all(
                          offerLetter.files.map(async (fileId) => {
                            
                            try {
                              const file = await this.dataSource.getRepository(Files).findOne({
                                where: { id: fileId },
                              });
              
                              if (file) {
                                const signedUrl = await this.s3Service.getDocumentLink(file.link);
                                return { name: file.name,
                                  format: file.format, link: signedUrl };
                              }
                              return { name: file.name,
                                format: file.format, link: null }; 
                            } catch (err) {
                              console.error(`Error fetching file with ID ${fileId}:`, err);
                              return { id: fileId, link: null };
                            }
                          }),
                        );
                      }
              return {
                  id: offerLetter.id,
                  candidate: {
                      firstName: candidate ? candidate.firstName : '',
                      lastName: candidate ? candidate.lastName : ''
                  },
                  supervisor: {
                    fullName: {
                        first: supervisor ? supervisor.fullName.first : '',
                        last: supervisor ? supervisor.fullName.last : ''
                    },
                    profileImageUrl: supervisor ? supervisor.profileImage : '',
                    workPhone: supervisor ? supervisor.phone.work : '',
                    workEmail: supervisor ? supervisor.email.work : ''
                },
                company:{
                    name: company.companyName,
                    heroLogoUrl: company.heroLogoUrl,	
                    mainLogoUrl: company.logoURL
                },
                  content: offerLetter.content,
                  expireDate: offerLetter.expireDate,
                  startDate: offerLetter.startDate,
                  job: offerLetter.job,
                  salary: offerLetter.salary,
                  payPeriod: offerLetter.payPeriod,
                  files:filesWithLinks,
                  status: offerLetter.status, 
                  seen: offerLetter.seen,
                  accept: offerLetter.accept,
                  createdAt:offerLetter.createdAt,
                  modifiedAt:offerLetter.modifiedAt
                  
              };
          }));
            return {
                code: '200',
                offerLetter: getOfferLetters,
              };



        }catch(error){
            throw new HttpException('error', HttpStatus.BAD_REQUEST)
        }
    }





    async postHiringDocuments(
        files: Array<Express.Multer.File>,
        companyId: string,
        uploaderId: string
      ) {
        try {
          const documentIds = [];
          const company = await this.APIService.getCompanyById(companyId);
          
          for (let i = 0; i < files.length; i++) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExtension = files[i].mimetype.split('/')[1];
            const originalName = files[i].originalname.split('.')[0];
            files[i].originalname =
              originalName + '-' + uniqueSuffix + '.' + fileExtension;
            let s3Response = await this.s3Service.uploadCandidateDocument(
              files[i],
              company.companyName
              /* 'test', */
            );
            const createdAt = new Date(Date.now());
            const modifiedAt = new Date(Date.now());
            const format = files[i].originalname.split('.').slice(-1).toString();
            const name = files[i].originalname;
            const link = s3Response['key'];
            const size = files[i].size.toString();
            
            const folderId = 'career'
            const access = {
                all: false,
                employeeIds: [uploaderId]
            }
            const newDocument = this.filesRepository.create({
              createdAt,
              modifiedAt,
              companyId,
              link,
              format,
              access,
              size,
              name,
              folderId,
        
              
            });
            const savedDocument = await this.filesRepository.save(
              newDocument,
            );
            documentIds.push(savedDocument.id);
          }
          return {
            fileIds:documentIds
          } 
        } catch (error) {
          console.log(error);
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
      }
}
interface Candidates {
  id: string;
  name: string;
  score: string;
}