import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { hrletterTemplate } from "@flows/allEntities/hrletterTemplate.entity";

@Injectable()
export class HRLetterTemplatesService {
    constructor(
        @InjectRepository(hrletterTemplate)
        private readonly documentTemplateRepository: Repository<hrletterTemplate>,
    ) {}

    async createDocumentTemplate(body: any) {
        try {
            const documentTemplate = new hrletterTemplate();
            documentTemplate.name = body.name;
            documentTemplate.description = body.description;
            documentTemplate.companyId = body.companyId;
            documentTemplate.isActive = body.isActive;
            documentTemplate.isDefault = body.isDefault;
            documentTemplate.categoryId = body.categoryId
            documentTemplate.content = body.content;
            documentTemplate.tags = body.tags;

            const savedTemplate = await this.documentTemplateRepository.save(documentTemplate);

            return {
                code: "201",
                message: "Document template created successfully",
                template: savedTemplate,
            };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to create document template", HttpStatus.BAD_REQUEST);
        }
    }

   
    async getDocumentTemplates(companyId: string, id?: string) {
        try {
            const query = this.documentTemplateRepository.createQueryBuilder("hrletter_template")
                .where("hrletter_template.companyId = :companyId", { companyId })
                .orderBy("hrletter_template.createdAt", "DESC");

            if (id) {
                query.andWhere("hrletter_template.id = :id", { id });
            }

            const templates = await query.getMany();
            return { code: "200", templates };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to fetch document templates", HttpStatus.BAD_REQUEST);
        }
    }

   
    async updateDocumentTemplate(id: string, body: any) {
        try {
            const template = await this.documentTemplateRepository.findOneBy({ id });

            if (!template) {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND);
            }

            Object.assign(template, body);
            await this.documentTemplateRepository.save(template);

            return { code: "200", message: "Document template updated successfully", template };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to update document template", HttpStatus.BAD_REQUEST);
        }
    }


    async deleteDocumentTemplate(id: string) {
        try {
            const template = await this.documentTemplateRepository.findOneBy({ id });

            if (!template) {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND);
            }

            await this.documentTemplateRepository.delete(id);
            return { code: "200", message: "Document template deleted successfully", id };
        } catch (error) {
            console.error(error);
            throw new HttpException("Failed to delete document template", HttpStatus.BAD_REQUEST);
        }
    }
}