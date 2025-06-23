import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Post, Put, Query,Req,UploadedFiles, UseInterceptors, Request } from '@nestjs/common';
import { CandidateService } from 'src/Hiring/service/candidate.service';
import { CareerService } from 'src/Hiring/service/career.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JobOpeningsService } from 'src/Hiring/service/jobOpening.service'; 
import { TalentPoolService } from 'src/Hiring/service/talentPool.service';
import { OfferLettersService } from '@flows/Hiring/service/offerLetter.service';
@Controller()
export class HiringController {
    constructor(
        private readonly candidateaService:CandidateService,
        private readonly careerService :CareerService,
        private readonly jobService:JobOpeningsService,
        private readonly talentPoolService:TalentPoolService,
        private readonly offerLettersService:OfferLettersService
    ){}

    @Post('hiring/candidates')
    async createJobForcandidates(@Body()body:any){
        try{
            return await this.candidateaService.createCandidate(body);
        }catch(error){
            console.log(error)
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));

        }
       
    }

    @Get('hiring/candidates')
    async getAllJobsForcandidates(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
  ) {
    try{
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    return await this.candidateaService.getCandidates(companyId,id);
  }

  


  @Put('hiring/candidatess')
  async updateCandidate(
    @Query('id') id: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    try{
        const userId = req.headers['user-id'] as string;
        return this.candidateaService.updateCandidate(id,body,userId);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating Job!', HttpStatus.BAD_REQUEST)
    }
   
  }


  @Delete('hiring/candidatess')
  async deleteCandidate(@Query('id') id: string) {
    try{
        return this.candidateaService.deleteCandidate(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting Job !', HttpStatus.BAD_REQUEST)
    }
    
  }

  /* job */

  @Post('hiring/jobs')
  async createJob(@Body()body:any){
      try{
          return await this.jobService.createJob(body);
      }catch(error){
          console.log(error)
          return (new HttpException('error!', HttpStatus.BAD_REQUEST));

      }
     
  }

  @Get('hiring/jobs')
  async getAllJobs(
  @Query('companyId') companyId?: string,
  @Query('employeeId') employeeId?: string,
  @Query('status') status?: string,
  @Query('id') id?: string,
) {

  try{
    return await this.jobService.getAllJobs(companyId, employeeId, status,id);
  }catch(error){
      console.log(error)
      throw new HttpException('error',HttpStatus.BAD_REQUEST)
  }
  
}


@Put('hiring/Jobs')
async updatejob(
  @Query('id') id: string,
  @Body() body: any,
) {
  try{
      return this.jobService.updateJob(id, body);
  }catch(error){
      console.error(error);
      throw new HttpException('Error updating Job!', HttpStatus.BAD_REQUEST)
  }
 
}


@Delete('hiring/jobs')
async deletejob(@Query('id') id: string) {
  try{
      return this.jobService.deleteJob(id);
  }catch(error){
      console.error(error)
      throw new HttpException('Error deleting Job !', HttpStatus.BAD_REQUEST)
  }
  
}

@Post('hiring/generate-job')
  async generateJon(@Req() req)
   {
    try {
      return await this.jobService.generateJob(req);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  /* career ====================== */

  @Post('hiring/site/jobs')
    async CreateCareer(@Body()body:any){
        try{
           return await this.careerService.createCareer(body)

        }catch(error){
            console.log(error)
            throw new HttpException('error',HttpStatus.BAD_REQUEST)
        }
    }
    @Get('hiring/site/jobs')
    async getAllJobsforSite(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
  ) {

    try{
        return await this.careerService.getCareer(companyId,id);
    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    
  }


  @Put('hiring/site/offer-letter')
  async updatOfferLetter(
    @Query('id') id: string,
    @Body() body: any,
  ) {
    try{
        return this.careerService.updateOfferLetter(id, body);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating career!', HttpStatus.BAD_REQUEST)
    }
   
  }


  @Delete('hiring/site/jobs')
  async deleteCareer(@Query('id') id: string) {
    try{
        return this.careerService.deleteCareer(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting career !', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Get('hiring/site/offer-letter')
  async getSiteOfferLetter(
  @Query('companyId') companyId: string,
  @Query('id') id?: string,
) {
  try{
      return this.careerService.getOfferLetters(companyId, id);
  }catch(error){
      console.error(error);
      throw new HttpException('Error getting offerLetters', HttpStatus.BAD_REQUEST)
  }
  
}

  @HttpCode(201)
  @Post('hiring/site/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  async postHiringDocuments(
    @Query('companyId') companyId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('id') id: string,
  ){
    try {
      return await this.careerService.postHiringDocuments( files,  companyId, id);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

 
  
  /* talentpool */

  @Post('hiring/talent-pools')
    async createTalenPool(@Body()body:any){
        try{
            return await this.talentPoolService.createTalentPool(body);
        }catch(error){
            console.log(error)
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));

        }
       
    }

    @Get('hiring/talent-pools')
    async getAllTalentPools(
    @Query('companyId') companyId?: string,
    @Query('id') id?: string,
  ) {

    try{

    }catch(error){
        console.log(error)
        throw new HttpException('error',HttpStatus.BAD_REQUEST)
    }
    return await this.talentPoolService.getAllTalentPools(companyId,id);
  }


  @Put('hiring/talent-pools')
  async updateTalentPools(
    @Query('id') id: string,
    @Body() body: any,
  ) {
    try{
        return this.talentPoolService.updateTalentPools(id, body);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating Job!', HttpStatus.BAD_REQUEST)
    }
   
  }


  @Delete('hiring/talent-pools')
  async deleteTalentPool(
    @Query('id') id: string,
    @Query('moveId') moveId:string
) {
    try{
        return this.talentPoolService.deleteTalentPool(id,moveId);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting Job !', HttpStatus.BAD_REQUEST)
    }
    
  }
  
  /* offer letter */

  @Post('hiring/candidate/offer-letter')
    async postOfferLetters(@Body() body: any){
        try{
            return await this.offerLettersService.postOfferLetters(body)
        }catch(error){
            console.log(error)
            throw new HttpException('error creating offer letter', HttpStatus.BAD_REQUEST)
        }
       
    }

    @Get('hiring/candidate/offer-letter')
    async getOfferLetter(
    @Query('companyId') companyId: string,
    @Query('id') id?: string,
  ) {
    try{
        return this.offerLettersService.getOfferLetters(companyId, id);
    }catch(error){
        console.error(error);
        throw new HttpException('Error getting offerLetters', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Put('hiring/candidate/offer-letter')
  async updateOfferLetterk(
    @Query('id') id: string,
    @Body() body: any,
  ) {
    try{
        return this.offerLettersService.updateOfferLetters(id, body);
    }catch(error){
        console.error(error);
        throw new HttpException('Error updating offerLetters', HttpStatus.BAD_REQUEST)
    }
   
  }

  @Delete('hiring/candidate/offer-letter')
  async deleteOfferLetter(@Query('id') id: string) {
    try{
        return this.offerLettersService.deleteofferLetters(id);
    }catch(error){
        console.error(error)
        throw new HttpException('Error deleting oofferLetters', HttpStatus.BAD_REQUEST)
    }
    
  }

  @Post('hiring/candidate/generate-summary')
  async generatesummary(@Req() req)
   {
    try {
      return await this.candidateaService.generateSummary(req);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
