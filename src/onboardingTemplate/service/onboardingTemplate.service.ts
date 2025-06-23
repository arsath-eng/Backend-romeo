import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {onboardingTemplate } from '../../allEntities/OnboardingTemplate.entity'
import {Repository} from 'typeorm';





@Injectable()
export class onboardingTemplateService {
    constructor(
        @InjectRepository(onboardingTemplate)
        private readonly onboardingTemplateRepository: Repository<onboardingTemplate>,
    ){}

    async postOnboardingTemplate(req: Request,file: Express.Multer.File){
        try{
            const template = new onboardingTemplate();
            template.name = req.body['name'];
            const questions = req.body['questions'];
            if (questions && Array.isArray(questions)) {
                template.question = questions.map((question ) => {
                    if (question.type === 'document') {
                        question.uploadedFiles = []; 
                    }
                    return question;
                });
            } else {
                template.question = [];
            }
            template.companyId = req.body['companyId'];
            template.description = req.body['description'];
            template.categoryId = req.body['categoryId'];
            
        
  
            const saveTemplate = await this.onboardingTemplateRepository.save(template)
            return saveTemplate

        }catch(error){
            console.error(error)
            throw new HttpException('Error creating template!', HttpStatus.BAD_REQUEST)
        }
    }

    async getOnboardingTemplates(
        companyId: string,
        id: string,
        all: boolean,
        start: number,
        end: number,
      ): Promise<{ code: string; totalCount: string; templates: Partial<onboardingTemplate>[] }> {
        try {
          let query = `SELECT * FROM onboarding_template WHERE "companyId" = $1`;
          let params = [companyId];
    
          if (id) {
            query += ` AND "id" = $${params.length + 1}`;
            params.push(id);
          }
    
          query += ` ORDER BY "createdAt" DESC`;
    

          let templates: onboardingTemplate[] = await this.onboardingTemplateRepository.query(query, params);
          const totalCount = templates.length;
    
          if (all !== true) {
            templates = templates.slice(start, end);
          }
    
          const responseObj = {
            code: '200',
            totalCount: totalCount.toString(),
            templates: templates.map(template => ({
              id: template.id,
              name: template.name,
              categoryId: template.categoryId,
              description: template.description,
              questions: template.question,
              companyId: template.companyId,
              createdAt: template.createdAt,
              modifiedAt: template.updatedAt,
            })),
          };
    
          return responseObj;
        } catch (error) {
          console.error(error);
          throw new HttpException('Error fetching templates!', HttpStatus.BAD_REQUEST);
        }
      }

      async updateOnboardingTemplate(req: Request, id: string,file: Express.Multer.File) {
        try {
          // Fetch the existing template
          let template = await this.onboardingTemplateRepository.findOne({ where: { id } });
          if (!template) {
            throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
          }
    
          // Update fields with data from the request body
          template.name = req.body['name'] || template.name;
          template.description = req.body['description'] || template.description;
          template.categoryId = req.body['categoryId'] || template.categoryId;
          template.question = req.body['questions'] || template.question;
          //template.companyId = req.body['companyId'] || template.companyId;

          
    
          // Save the updated template
          const updatedTemplate = await this.onboardingTemplateRepository.save(template);
    
          return {
            code: '200',
            message: 'Template updated successfully',
            template: updatedTemplate,
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Error updating template!', HttpStatus.BAD_REQUEST);
        }
      }


      async deleteOnboardingTemplate(id:string){
        try{
            await this.onboardingTemplateRepository.delete(id);
            return {
                status: 200,
                description: 'Success',
              };
        }catch(error){
            console.error(error)
            throw new HttpException('error',HttpStatus.BAD_REQUEST )
        }
      }

      
    

      


      
}
