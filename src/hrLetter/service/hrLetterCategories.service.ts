import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hrletterTemplateCategory } from "@flows/allEntities/hrletterTemplateCategory.entity"; 
import { Repository } from "typeorm";
@Injectable()
export class HRLetterCategoriesService {
    constructor(
         @InjectRepository(hrletterTemplateCategory)
        private readonly documentTemplateCategory:Repository<hrletterTemplateCategory>,
                
    ){}
    async documentCategories(body: any) {
        try {    
            const documentCategories = new hrletterTemplateCategory();
            documentCategories.description = body.description;
            documentCategories.name = body.name;
            documentCategories.companyId = body.companyId;
            documentCategories.isDefault = body.isDefault;
            documentCategories.canRequest = body.canRequest;

            const saveddocumentCategories = await this.documentTemplateCategory.save(documentCategories);
                
        return {
            code: '201',
            documentCategories: saveddocumentCategories,
        };
        
      } catch (error) {
        console.error(error);
        if (error instanceof HttpException) {
            throw error;
        }
        throw new HttpException('Failed to create document categories', HttpStatus.BAD_REQUEST);
        }
    }


    async getdocumentCategories(companyId,id){
        try{
          
            const query = this.documentTemplateCategory.createQueryBuilder('hrletter_template_category')
            .where("hrletter_template_category.companyId = :companyId", { companyId })
            .orderBy('hrletter_template_category.createdAt', 'DESC');
      
          if (id) {
            query.andWhere('hrletter_template_category.id = :id', { id });
          }

          const categories = await query.getMany();
            return {
                code: '200',
                categories,
            };
        }catch(error){
            console.log('error')
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
        } 

    }

    async updateDocumentCategory(id: string, body: any) {
        try {
            let category = await this.documentTemplateCategory.findOneBy({ id });
    
            if (!category) {
                throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
            }
    
            
            category.name = body.name || category.name;
            category.description = body.description || category.description;
            category.companyId = body.companyId || category.companyId;
            category.isDefault = body.isDefault !== undefined ? body.isDefault : category.isDefault;
            category.canRequest = body.canRequest !== undefined ? body.canRequest : category.canRequest;
    
            await this.documentTemplateCategory.save(category);
    
            return {
                code: '200',
                message: 'Document category updated successfully',
                category
            };
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to update document category', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteDocumentCategory(id: string) {
        try {
            const category = await this.documentTemplateCategory.findOneBy({ id });
    
            if (!category) {
                throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
            }
    
            await this.documentTemplateCategory.delete(id);
    
            return {
                code: '200',
                message: 'Document category deleted successfully',
                id
            };
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to delete document category', HttpStatus.BAD_REQUEST);
        }
    }
    
    
}