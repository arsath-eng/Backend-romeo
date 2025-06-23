import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Repository,DataSource } from "typeorm";
import {hrletterGenerate } from "@flows/allEntities/hrletterGenerate.entity";
import { hrletterTemplate } from "@flows/allEntities/hrletterTemplate.entity";
const axios = require('axios')
import { ConfigService } from '@nestjs/config';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { hrletterRequest } from "@flows/allEntities/hrletterRequest.entity";
import { accessLevels } from 'src/allEntities/accessLevels.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
@Injectable()
export class HRLetterRequesteService {
    private readonly API;
    constructor(
        private notificationService: NotificationService,
        @InjectRepository(hrletterRequest)
        private readonly documentRequestRepository: Repository<hrletterRequest>,
        @InjectRepository(hrletterTemplate)
        private readonly documentTemplateRepository: Repository<hrletterTemplate>,
        @InjectRepository(hrletterGenerate)
        private readonly documentGenerateRepository: Repository<hrletterGenerate>,
        private readonly configService: ConfigService,
        private readonly APIService: APIService,
         @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        @InjectDataSource() private dataSource: DataSource,
    ) {
        this.API = axios.create({
            baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
          })
    }

    async createDocumentRequest(body: any) {
        try {
            const documentRequest = new hrletterRequest();
            documentRequest.employeeId = body.employeeId;
            documentRequest.categoryId = body.categoryId;
            
            documentRequest.companyId = body.companyId;
            documentRequest.reason = body.reason;
            documentRequest.status = "pending" ;
    
            const generatedDocument = await this.documentRequestRepository.save(documentRequest);

            const accessLevels: accessLevels[] = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId"=$1 ', [body.companyId]);
            const AdminAccess = accessLevels.find((access) => access.accessLevelType === 'FULL_ADMIN');
          
         
            const employees = await this.dataSource.query(
                `SELECT * FROM hrm_employee_details WHERE "companyId" = $1 AND "status"!='Non Active'`,
                [body.companyId],
              );

              const requester = await this.employeeDetailsRepository.findOne({
                where: { employeeId: body.employeeId },
                select: ['fullName'] 
            });   
            const requesterName = `${requester.fullName.first} ${requester.fullName.middle ?? ''} ${requester.fullName.last}`;

          const notificationRecipients = employees
            .filter(e => e.status !== 'Non Active' && e.accessLevelId === AdminAccess.id)
            .map(employee => employee.employeeId);

            for (let i=0; i<notificationRecipients.length; i++) {
                await this.notificationService.addNotifications(
                  'documentRequest',
                  `${requesterName} has requested a new document`,
                  generatedDocument.id,
                  body.companyId,
                  body.employeeId,
                  notificationRecipients
                );
              }

            return {
                code: "201",
                template: generatedDocument,
            };


            
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to create document request", HttpStatus.BAD_REQUEST);
        }
    }

    async getDocumentRequest(companyId:string , id?: string) {
        try {
            if (!companyId) {
                throw new HttpException("Company ID is required", HttpStatus.BAD_REQUEST);
            }

            const query = this.documentRequestRepository.createQueryBuilder("hrletter_request")
                .where("hrletter_request.companyId = :companyId", { companyId })
                .orderBy("hrletter_request.createdAt", "DESC");

            if (id) {
                query.andWhere("hrletter_request.id = :id", { id });
            }

          
           
            const requestedDocuments = await query.getMany();

            const getdoucmentDetaisl = await this.documentGenerateRepository.query(
                `
                SELECT 
                    "id",
                    "companyId",
                    "requesteId"
                FROM "hrletter_generate"
                WHERE "requesteId" = ANY($1)
                `,
                [requestedDocuments.map((requestedDocument) => requestedDocument.id)]
              );
              
            
              const documentMapping = new Map(
                getdoucmentDetaisl.map((doc) => [doc.requesteId, doc.id])
            );
              //console.log(documentId,"documentId");
              //const companyId = getdoucmentDetaisl[0]?.companyId;
              //console.log(companyId,"companyId")
            
            const getDocumentTemplates = requestedDocuments.map((documentGenerate) => ({
                id: documentGenerate.id,
                employeeId: documentGenerate.employeeId,
                status :documentGenerate.status,
                companyId: companyId,
                categoryId: documentGenerate.categoryId,
                
                reason: documentGenerate.reason,
                documentId: documentMapping.get(documentGenerate.id) || '',
                createdAt: documentGenerate.createdAt.toISOString(),
                updatedAt: documentGenerate.updatedAt.toISOString(),
            }));

            return { code: "200", getDocumentTemplates };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to fetch document ", HttpStatus.BAD_REQUEST);
        }
    }

    async updateDocumentRequest(id: string, body: any) {
            try {
                let docuemntRequest = await this.documentRequestRepository.findOneBy({ id });
        
                if (!docuemntRequest) {
                    throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
                }
      
                
                docuemntRequest.categoryId = body['categoryId'] || docuemntRequest.categoryId;
                docuemntRequest.companyId = body['companyId'] || docuemntRequest.companyId;
                docuemntRequest.employeeId = body['employeeId'] || docuemntRequest.employeeId;
                docuemntRequest.reason = body['reason'] || docuemntRequest.reason;
                docuemntRequest.status = body['status'] || docuemntRequest.status;

                await this.documentRequestRepository.save(docuemntRequest);

                if (body.status){
                    await this.notificationService.addNotifications(
                        'documentRequest',
                        `your document request has been ${docuemntRequest.status}`,
                        docuemntRequest.id,
                        body.companyId,
                        body.employeeId,
                        body.employeeId,
                      );
                }

               
        
                return {
                    code: '200',
                    message: 'Document Request updated successfully',
                    docuemntRequest
                };
            } catch (error) {
                console.error(error);
                throw new HttpException('Failed to update document category', HttpStatus.BAD_REQUEST);
            }
        }
    
        async deleteDocumentRequest(id: string) {
            try {
                const category = await this.documentRequestRepository.findOneBy({ id });
        
                if (!category) {
                    throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
                }
        
                await this.documentRequestRepository.delete(id);
        
                return {
                    code: '200',
                    message: 'Document Request deleted successfully',
                    id
                };
            } catch (error) {
                console.error(error);
                throw new HttpException('Failed to delete document Request', HttpStatus.BAD_REQUEST);
            }
        }
}