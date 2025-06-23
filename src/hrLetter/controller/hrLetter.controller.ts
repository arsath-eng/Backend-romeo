
import { HRLetterCategoriesService } from "@flows/hrLetter/service/hrLetterCategories.service"
import { HRLetterTemplatesService } from "@flows/hrLetter/service/hrLetterTemplate.service";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query,Request } from "@nestjs/common";
import { HRLetterGenerateService } from "../service/hrLetterGenerate.service";
import { HRLetterRequesteService } from "@flows/hrLetter/service/hrLetterRequest.service";
@Controller()
export class HRLetterController {
    constructor(
        private readonly documentCategoriesService:HRLetterCategoriesService,
        private readonly documentTemplateService:HRLetterTemplatesService,
        private readonly documentgenerateService:HRLetterGenerateService,
        private readonly documentRequesteService:HRLetterRequesteService,

    ){}

    @Post('hrletter/templates/categories')
    async createdocumentCategories(@Body()body:any){
        try{
            return await this.documentCategoriesService.documentCategories(body);
        }catch(error){
            console.log(error)
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));

        }
       
    }

    @Get('hrletter/templates/categories')
    async getdocumentCategories(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
  ) {
    try{
      return await this.documentCategoriesService.getdocumentCategories(companyId,id);
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    
  }

   @Put('hrletter/templates/categories')
    async updatedocumentCategories(
      @Query('id') id: string,
      @Body()body:any
   
    ) {
      try{
          return this.documentCategoriesService.updateDocumentCategory(id,body);
      }catch(error){
          console.error(error);
          throw new HttpException('Error updating document Categories!', HttpStatus.BAD_REQUEST)
      }
     
    }
  
    @Delete('hrletter/templates/categories')
    async deletedocumentCategories(
        @Query('id') id: string
    ) {
      try{
          return this.documentCategoriesService.deleteDocumentCategory(id);
      }catch(error){
          console.error(error)
          throw new HttpException('Error deleting  document Categories!', HttpStatus.BAD_REQUEST)
      }
      
    }

    /* ==========document template======== */

    @Post('hrletter/templates')
    async createDocumentTemplate(@Body()body:any){
        try{
            return await this.documentTemplateService.createDocumentTemplate(body);
        }catch(error){
            console.log(error)
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));

        }
       
    }

    @Get('hrletter/templates')
    async getDocumentTemplates(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
  ) {
    try{
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    return await this.documentTemplateService.getDocumentTemplates(companyId,id);
  }

   @Put('hrletter/templates')
    async updateDocumentTemplate(
      @Query('id') id: string,
      @Body()body:any
   
    ) {
      try{
          return this.documentTemplateService.updateDocumentTemplate(id,body);
      }catch(error){
          console.error(error);
          throw new HttpException('Error updating document Categories!', HttpStatus.BAD_REQUEST)
      }
     
    }
  
    @Delete('hrletter/templates')
    async deleteDocumentTemplate(
        @Query('id') id: string
    ) {
      try{
          return this.documentTemplateService.deleteDocumentTemplate(id);
      }catch(error){
          console.error(error)
          throw new HttpException('Error deleting  document Categories!', HttpStatus.BAD_REQUEST)
      }
      
    }
    /* ===========document generate ============ */


    @Post('hrletter/generate')
    async createDocumentRequest(@Body()body:any){
        try{
            return await this.documentgenerateService.createDocumentGenerate(body);
        }catch(error){
            console.log(error)
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));

        }
       
    }

    @Get('hrletter/generate')
    async getDocumentGenerate(
    @Query('companyId') companyId: string,
    @Query('id') id?: string,
  ) {
    try{
      return await this.documentgenerateService.getGeneratedDocument(companyId,id);
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    
  }

  @Put('hrletter/generate')
  async updategeneratedDocument(
    @Query('id') id: string,
    @Body()body:any,
   
){
      try{
          return await this.documentgenerateService.updategeneratedDocument(id,body);
      }catch(error){
          console.log(error)
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));

      }
     
  }

  @Delete('hrletter/generate')
  async deletegeneratedDocument(
  @Query('id') id?: string,
) {
  try{
  }catch(error){
      console.log(error)
      throw new HttpException('error',HttpStatus.BAD_REQUEST)
  }
  return await this.documentgenerateService.deletegeneratedDocument(id);
}

/* =============document request ================= */

@Post('hrletter/requests')
async createDocumentGenerate(@Body()body:any){
    try{
        return await this.documentRequesteService.createDocumentRequest(body);
    }catch(error){
        console.log(error)
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));

    }
   
}

@Get('hrletter/requests')
async getGeneratedDocument(
   @Query('companyId') companyId: string,
    @Query('id') id?: string,
) {
  try{
    return await this.documentRequesteService.getDocumentRequest(companyId,id);
  }
  catch(error){
    console.log(error)
    throw new HttpException('error',HttpStatus.BAD_REQUEST)
  }

}

@Put('hrletter/requests')
async updateDocumentRequest(
    @Query('id') id: string,
     @Body()body:any,
  
){
    try{
        return await this.documentRequesteService.updateDocumentRequest(id,body);
    }catch(error){
        console.log(error)
        return (new HttpException('error!', HttpStatus.BAD_REQUEST));

    }
   
}

@Delete('hrletter/requests')
async deleteDocumentRequest(
  @Query('id') id?: string,
  ) {
    try{
      return await this.documentRequesteService.deleteDocumentRequest(id);
    }catch(error){
      console.log(error)
      throw new HttpException('error',HttpStatus.BAD_REQUEST)
}

}

 @Post('hrletter/generate-ai')
    async generateTemplate(@Request() req) {
      try {
        return await this.documentgenerateService.generateDocument(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    @Post('generate-ai')
    async updategenerateDocument(@Request() req) {
      try {
        return await this.documentgenerateService.updategenerateDocument(req);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
    


}
