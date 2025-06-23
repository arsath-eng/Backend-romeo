import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { hrletterGenerate } from "@flows/allEntities/hrletterGenerate.entity";
import { hrletterTemplate } from "@flows/allEntities/hrletterTemplate.entity";
const axios = require('axios')
import { ConfigService } from '@nestjs/config';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { template } from "handlebars";
@Injectable()
export class HRLetterGenerateService {
    private readonly API;
    constructor(
        @InjectRepository(hrletterGenerate)
        private readonly documentGenerateRepository: Repository<hrletterGenerate>,
        @InjectRepository(hrletterTemplate)
        private readonly documentTemplateRepository: Repository<hrletterTemplate>,
        private readonly configService: ConfigService,
        private readonly APIService: APIService,
         @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    ) {
        this.API = axios.create({
            baseURL: this.configService.get<string>('PYTHON_BACKEND_DOMAIN'),
          })
    }

    async createDocumentGenerate(body: any) {
        try {
            const documentGenerate = new hrletterGenerate();
           

            documentGenerate.employeeId = body.employeeId;
            documentGenerate.requesteId = body.requesteId;
            documentGenerate.supervisorId = body.supervisorId;
            documentGenerate.companyId = body.companyId;
            documentGenerate.templateId = body.templateId;
           
           
            if(body.templateId){
                const template = await this.documentTemplateRepository.findOneBy({ id:  body.templateId });
                documentGenerate.content = template.content;
                documentGenerate.tags = template.tags;
            }else{
                documentGenerate.content = null;
                documentGenerate.tags = null;
            }

            const generatedDocument = await this.documentGenerateRepository.save(documentGenerate);

            return {
                code: "201",
                message: "Document generated successfully",
                template: generatedDocument,
            };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to create document template", HttpStatus.BAD_REQUEST);
        }
    }

   
    async getGeneratedDocument(companyId:string, id?: string) {
        try {
            const query = this.documentGenerateRepository.createQueryBuilder("hrletter_generate")
                .where("hrletter_generate.companyId = :companyId", { companyId })
                .orderBy("hrletter_generate.createdAt", "DESC");

            if (id) {
                query.andWhere("hrletter_generate.id = :id", { id });
            }

            /* if (companyId) {
                query.andWhere("document_generate.companyId = :companyId", { companyId });
            } */
          
           
            const generatedDocuments = await query.getMany();

            /* const documentTemplateDetails = await this.documentTemplateRepository.query(
                `
                SELECT 
                    "content",
                    "companyId"
                FROM "hrletter_template"
                WHERE "id" = ANY($1)
                `,
                [generatedDocuments.map((documentGenerate) => documentGenerate.templateId)]
              ); */
              //const employeeIds = generatedDocuments.map((documentGenerate) => documentGenerate.employeeId);
              const employeeDetails  = await this.employeeDetailsRepository.query(
                  `
                 SELECT
                    "fullName" ->> 'first' AS "firstName",
                    "fullName" ->> 'last' AS "lastName",
                    (SELECT job->> 'jobTitle' 
                    FROM jsonb_array_elements("jobInformation") AS job 
                    WHERE job->>'active' = 'true' 
                    ORDER BY (job->>'effectiveDate')::timestamptz DESC 
                    LIMIT 1) AS "jobTitle",
                    "permanentAddress" ->> 'street' AS "street",
                    "permanentAddress" ->> 'city' AS "city",
                    "permanentAddress" ->> 'state' AS "state",
                    "permanentAddress" ->> 'zip' AS "zip",
                    "permanentAddress" ->> 'country' AS "country",
                    "permanentAddress",
                    "temporaryAddress",
                    "employeeId",
                    (SELECT job->> 'department' 
                    FROM jsonb_array_elements("jobInformation") AS job 
                    WHERE job->>'active' = 'true' 
                    ORDER BY (job->>'effectiveDate')::timestamptz DESC 
                    LIMIT 1) AS "department",
                    "hireDate",
                    "email" ->> 'work' AS "work",
                    "companyId"
                FROM "hrm_employee_details"
                WHERE "employeeId" = ANY($1::uuid[])
                  `,
                  [generatedDocuments.map((documentGenerate) => documentGenerate.employeeId)]
              );

              const supervisorDetails  = await this.employeeDetailsRepository.query(
                `
               SELECT
                  "fullName" ->> 'first' AS "firstName",
                  "fullName" ->> 'last' AS "lastName",
                  (SELECT job->> 'jobTitle' 
                  FROM jsonb_array_elements("jobInformation") AS job 
                  WHERE job->>'active' = 'true' 
                  ORDER BY (job->>'effectiveDate')::timestamptz DESC 
                  LIMIT 1) AS "jobTitle",
                  "permanentAddress" ->> 'street' AS "street",
                  "permanentAddress" ->> 'city' AS "city",
                  "permanentAddress" ->> 'state' AS "state",
                  "permanentAddress" ->> 'zip' AS "zip",
                  "permanentAddress" ->> 'country' AS "country",
                  "permanentAddress",
                  "temporaryAddress",
                  "employeeId",
                  (SELECT job->> 'department' 
                  FROM jsonb_array_elements("jobInformation") AS job 
                  WHERE job->>'active' = 'true' 
                  ORDER BY (job->>'effectiveDate')::timestamptz DESC 
                  LIMIT 1) AS "department",
                  "hireDate",
                  "email" ->> 'work' AS "work",
                  "companyId"
              FROM "hrm_employee_details"
              WHERE "employeeId" = ANY($1::uuid[])
                `,
                [generatedDocuments.map((documentGenerate) => documentGenerate.supervisorId)]
            );
              
            const companyIds = [...new Set(generatedDocuments.map((doc) => doc.companyId))];
        
            const companyDetails = await Promise.all(companyIds.map(async (companyId) => {
                return this.APIService.getCompanyById(companyId);
            }));

            const formattedDocuments = generatedDocuments.map((doc) => {
                //const template = documentTemplateDetails.find((t) => t.companyId === doc.companyId);
                const employee = employeeDetails.find((e) => e.employeeId === doc.employeeId);
                const supervisor = supervisorDetails.find((s) => s.employeeId === doc.supervisorId);
                const company = companyDetails.find((c) => c.id === doc.companyId);

                return {
                    id: doc.id,
                    employeeId: doc.employeeId,
                    type: "HR_LETTER",
                    companyId: doc.companyId,
                    templateId: doc.templateId || '',
                    requesterId: doc.requesteId,
                    content: doc.content || "",
                    // content: template?.content || "",
                    //tags:doc.tags,
                    tags: {
                        employeeFullName: `${employee?.firstName || ""} ${employee?.lastName || ""}`,
                        employeeJobTitle: employee?.jobTitle || "",
                        employeeAddress: `${employee?.street || ""}, ${employee?.city || ""}, ${employee?.state || ""}, ${employee?.zip || ""}, ${employee?.country || ""}`,
                        employeeId: employee?.employeeId || "",
                        employeeDepartment: employee?.department || "",

                        supervisorFullName: `${supervisor?.firstName || ""} ${supervisor?.lastName || ""}`,
                        supervisorJobTitle: supervisor?.jobTitle || "",
                        supervisorEmail: `${supervisor?.street || ""}, ${supervisor?.city || ""}, ${supervisor?.state || ""}, ${supervisor?.zip || ""}, ${supervisor?.country || ""}`,
                        supervisorDepartment: supervisor?.department || "",
                        
                        employeeHireDate: employee?.hireDate || "",
                        employeeEmail: employee?.work || "",
                        companyName: company?.companyName || "",
                        companyEmail: company?.companyEmail || "",
                        companyNumber: company?.phoneNumber || "",
                        companyAddress: `${company?.address?.no || ""}, ${company?.address?.street || ""}, ${company?.address?.city || ""}, ${company?.address?.state || ""}, ${company?.address?.country || ""}, ${company?.address?.zip_code || ""}`,
                        currentDate: new Date().toISOString().split("T")[0], 
                    },
                    createdAt: doc.createdAt.toISOString(),
                    updatedAt: doc.updatedAt.toISOString(),
                };
            });
            return { code: "200", formattedDocuments };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to fetch document ", HttpStatus.BAD_REQUEST);
        }
    }
    
   
    async updategeneratedDocument(id: string, body: any) {
        try {
            const document = await this.documentGenerateRepository.findOneBy({ id });


            //const template = await this.documentTemplateRepository.findOneBy({ id: document.templateId });



            if (!document) {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND);
            }
            document.employeeId = body['employeeId'] || document.employeeId;
            document.requesteId = body['requesteId'] || document.requesteId;
            document.supervisorId = body['supervisorId'] || document.supervisorId;
            document.companyId = body['companyId'] || document.companyId;
            document.templateId = body['templateId'] || document.templateId;
            document.tags = body['tags'] || document.tags;
            document.content = body['content'] || document.content;

            /* let newTemplateId: string | null = null;

            if (template) {
                template.content = body['content'] ?? template.content;
                const newTemplate = await this.documentTemplateRepository.save(template);
                newTemplateId = newTemplate.id;
                document.templateId = newTemplate.id; 
            } */
    


           


            await this.documentGenerateRepository.save(document);

           

            return { code: "200", message: "Document updated successfully", document };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to update document", HttpStatus.BAD_REQUEST);
        }
    }


    async deletegeneratedDocument(id: string) {
        try {
            const document = await this.documentGenerateRepository.findOneBy({ id });


            if (!document) {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND);
            }

            await this.documentTemplateRepository.delete(id);
            return { code: "200", message: "Document template deleted successfully", id };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to delete document", HttpStatus.BAD_REQUEST);
        }
    }



    async  generateDocument(req){
        try {
           console.log(req.body);
    
           const response = await this.API.post('/generate-document/letter', req.body, {timeout: 600000});
            //console.log(response.data);
            return response.data
        } catch (error) {
          console.log(error);
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }

      async  updategenerateDocument(req){
        try {
           console.log(req.body);
    
           const response = await this.API.post('/prompt/prompt-enhancer', req.body, {timeout: 600000});
            // console.log(response.data);
            return response.data
        } catch (error) {
          console.log(error);
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
}