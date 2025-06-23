import {
  Body,
  Controller,
  Request,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Headers,
  Query
} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import { EmployeeService } from '../service/employee.service';
import {JobInformationService} from '../../jobInformation/service/jobInformation.service'
import { Response } from 'express';

import { EmployeeDto } from '../dto/employee.dto';
import { EmailDto } from '../dto/email.dto';
import { PhoneDto } from '../dto/phone.dto';
import { FullNameDto } from '../dto/fullName.dto';
import { SocialDto } from '../dto/social.dto';
import { EducationDto } from '../dto/education.dto';
import { PermanentAddressDto } from '../dto/permanentAddress.dto';
import { TemporaryAddressDto } from '../dto/temporyAddress.dto';
import { EmailsNewService } from '../../ses/service/emails.service';

import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
@Controller()
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jobInformationService: JobInformationService,
    private mailService: EmailsNewService,
    ) { }

  @Post(':companyId/employees')
  
  async postEmployee(  @Request() req, @Param('companyId') companyId: string) {
    try {
      const json = await this.employeeService.postEmployee(
        req.body.personal.employee.userId,
        req.body.personal.employee,
        companyId,
        'EMPLOYEE',
        false,
        req.body,
        true,
        false
      );
      await this.employeeService.postEducation(
        req.body.personal.education,
        json.id
      );
       return (json);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('employees/work-address/:employeeId')
  
  async getEmployeeWorkAddress(@Param('employeeId') employeeId: string) {
    try {
      return await this.employeeService.getEmployeeWorkAddress(employeeId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/employees')
  
  async getEmployees(  @Param('companyId') companyId: string) {
    try {
      return await this.employeeService.getEmployees(   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Post('employee/status')
  
  async postChangeEmployeeStatus(@Body() body: Body) {
    try {
      return await this.employeeService.postChangeEmployeeStatus(body);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/employees/directory')
  
  async getEmployeesDirectory(  @Param('companyId') companyId: string,@Query('all') all: string) {
    try {
      return await this.employeeService.getEmployeesDirectory(   companyId,all);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get('connect-main/:companyId/employees/directory')
  async getEmployeesDirectorySAP(  @Param('companyId') companyId: string, @Query('all') all: string) {
    try {
      return await this.employeeService.getEmployeesDirectory(   companyId,all);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/org-chart')
  
  async getEmployeesOrgChart(  @Param('companyId') companyId: string) {
    try {
      return await this.employeeService.getEmployeesOrgChart(   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('employees/:id')
  
  async getEmployeeById(
    @Param('id') id: string,
    
    ) {
    try {
      return await this.employeeService.getEmployeeById(id );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('employees/list/:id')
  
  async getEmployeeListById(@Param('id') id: string,
  @Query('companyId') companyId:string
  ) {
    try {
      return await this.employeeService.getEmployeeListById(id,companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('employees/:id')
  
  async putEmployeeById(
    @Param('id') id: string,
    @Body() body: Body,
     
    @Request() req
  ) {
    try {
      return await this.employeeService.putEmployeeById(id,req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('change-userId/:id')
  
  async changeUserId(
    @Param('id') id: string,
    @Body() body: Body,
     
    @Request() req
  ) {
    try {
      return await this.employeeService.changeUserId(id,req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('change-user-access/:id')
  
  async changeUserAccess(
    @Param('id') employeeId: string,
     
    @Request() req
  ) {
    try {
      return await this.employeeService.changeUserAccess(employeeId, req);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('employee/:id')
  
  async deleteEmployeeById(
    @Param('id') id: string, 
     
    @Body() body: Body,) {
    try {
      await this.employeeService.deleteEmployeeById(id,   body);
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('education/:employeeId/:eduId')
  
  async deleteEducationById(@Param('eduId') id: string, @Param('employeeId') employeeId: string,  ) {
    try {
      await this.employeeService.deleteEducationById(id, employeeId  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Post('change-username/:employeeId')
  
  async postResetUsername(@Request() req, @Param('employeeId') employeeId: string) {
    try {
      return await this.employeeService.postResetUsername(employeeId, req);

    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Post(':companyId/owner-change')
  
  async postOwnerChange(@Request() req, @Param('companyId') companyId: string) {
    try {
      return await this.employeeService.postOwnerChange(req.body.employeeId);

    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @HttpCode(200)
  @Post('change-profile-image/:employeeId')
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  
  async changeProfileImage(
    @Request() req, 
    @Param('employeeId') employeeId: string, 
    @UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      return await this.employeeService.changeProfileImage(files, employeeId, req);

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post (':companyId/employees/whatsapp-verify')
  async setWhatsappVerification(@Request() req, @Param('companyId') companyId: string) {
    try {
      return await this.employeeService.setWhatsappVerification(req, companyId)
    } catch (error) {
      console.log(error)
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Put (':companyId/employees/whatsapp-verify')
  async updateWhatsappVerification(@Request() req){
    try {
      return await this.employeeService.updateWhatsappVerification(req)
    } catch (error) {
      console.log(error)
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':companyId/payroll/:employeeId/salaryDetails/employment')
  async postEmployment(@Body() body: any, @Param('companyId') companyId: string, @Param('employeeId') employeeId: string): Promise<{ statusCode: number, description: string }> {
    try {
      return await this.employeeService.postEmployment(body, companyId, employeeId);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':companyId/payroll/:employeeId/salaryDetails/employment/:id')
  async getSalaryDetails( 
    @Param('id') id: string,
    @Param('employeeId') employeeId: string
    ): Promise<any> {
    try {
      return await this.employeeService.getEmployment(id,employeeId);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get(':companyId/payroll/:employeeId/salaryDetails/employment')

  async getSalaryDetailByEmployee( @Param('companyId') companyId: string , @Param('employeeId') employeeId:string) {

    try {
      return await this.employeeService.getSalaryDetailByEmployee(companyId,employeeId);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Put(':companyId/payroll/:employeeId/salaryDetails/employment')
  async putSalaryDetails(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() body: any,
  ) {
    try {
      return await this.employeeService.putEmployment(body,employeeId);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-address')
  async getAtlasAddress(@Query('query') query: string, @Query('countryCode') countryCode: string) {
    try {
      return await this.employeeService.getAtlasAddress(query, countryCode);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  @Post('employee/reset-password')
  async postResetPassword(
    @Body() body: {employeeId: string, username: string}, 
  ): Promise<{ description: string }> {
    try {
      return await this.employeeService.postResetPassword(body.employeeId, body.username);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('username-verified/:id')
  async getUsernameVerified( 
    @Param('id') id: string,
    ): Promise<any> {
    try {
      return await this.employeeService.getUsernameVerified(id);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  @Put('username-verified/:id')
  async putUsernameVerified(
    @Param('id') id: string,
    @Body() body: {token: string},
  ): Promise<{status: string}> {
    try {
      return await this.employeeService.putUsernameVerified(id, body);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  @Post('hiring/candidate/hire')
  async hireEmployee(
    @Body() body: any,
  ) {
    try {
      return await this.employeeService.hireEmployee(body)
    } catch (error) {
      console.error(error);
      throw new HttpException('Error while hiring employee!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('employee/generate-payrollid')
  async generatePayrollId( 
    @Body() body: Body,
    ): Promise<any> {
    try {
      return await this.employeeService.generatePayrollId(body['employeeId']);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('delete-validation/:employeeId')
  async deleteValidation( 
    @Param('employeeId') employeeId: string,
    ): Promise<any> {
    try {
      return await this.employeeService.deleteValidation(employeeId);
    } catch (error) {
      console.log(error);
      new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('change-supervisor')
  async changeSupervisor(
    @Request() req,
  ) {
    try {
      return await this.employeeService.changeSupervisor(req.body.from, req.body.to, req.body.companyId)
    } catch (error) {
      console.error(error);
      throw new HttpException('Error while changing supervisor!', HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }
  @Post('compliance-reminder')
  async complianceReminder(
    @Body() body: {employeeId: string, complianceId: string}
  ) {
    try {
      return await this.employeeService.complianceReminder(body.employeeId, body.complianceId)
    } catch (error) {
      console.error(error);
      throw new HttpException('Error while sending compliance reminder!', HttpStatus.INTERNAL_SERVER_ERROR);
      } 
    }
  
}
