import { Controller, Res, Post, Query, Body, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import {EmailsNewService} from '../ses/service/emails.service';

@Controller('pdf')
export class PdfController {
    constructor(
      private readonly pdfService: PdfService,
      private readonly emailsNewService: EmailsNewService,
    ) {}

    @Post('/generate-pdf/payroll')
    async generatePdf(@Res() res: Response, @Query('type') type: string,@Body() data: any) {
      console.log(type);

      const templatePath = `src/pdf/template/${type}.pug`;
  
      const details = data.details
  
      const pdfBuffer = await this.pdfService.generatePdf(templatePath, { details });
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Content-Disposition': 'attachment; filename="generated.pdf"',
      });
      res.send(pdfBuffer);
    }

    @Post('payroll/send-payslip')
    async sendPayslip(
      @Body() body: PayslipRequest,
      @Body('subject') subject: string,
      @Query('type') type: string
    ) {

      try {
        const payslips = body.payslips;    
        // Check if payslips is an array
        if (!Array.isArray(payslips)) {
          throw new Error("payslips is not an array");
        }
        for (const payslip of payslips) {
          const formattedPayDate = new Date(payslip.payDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      
          // Generate a subject for the email
          const emailSubject = `Payslip for ${formattedPayDate} - ${payslip.companyName}`;
          const templatePath = `src/pdf/template/${type}.pug`;
          const pdfBuffer = await this.pdfService.generatePdf(templatePath, {details:[payslip]} );
          const employeeNameFormatted = payslip.employeeName.replace(/\s+/g, '_'); 
          const companyNameFormatted = payslip.companyName.replace(/\s+/g, '_'); 
          const fileName = `payslip_${employeeNameFormatted}_${formattedPayDate}_${companyNameFormatted}.pdf`;
          // const subject = payslip.companyName + " "+""
          await this.emailsNewService.sendEmailWithAttachment(
            fileName,
            emailSubject,
            pdfBuffer,
            payslip.employeeId
          );
        }
      }
      catch (error) {
        console.error('Error sending payslip:', error);
        throw error;
      }
    }

    @Post('payroll/epfFile')
    async generateEpfEmployer(@Body() formData, @Res() res: Response) {
      try {
        
        // Fill and save the PDF
        const pdfBuffer = await this.pdfService.generateEpfEmployer(formData);
        
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename="etf.pdf"',
        });
        res.send(pdfBuffer);
      } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }
    }
    @Post('payroll/etfFile')
    async generateEtfEmployer(@Body() formData, @Res() res: Response) {
      try {
        
        // Fill and save the PDF
        const pdfBuffer = await this.pdfService.generateEtfEmployer(formData);
        
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename="etf.pdf"',
        });
        res.send(pdfBuffer);
      } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }
    }
}
interface PayslipRequest {
  payslips: Payslip[];
}

interface Payslip {
  employeeAddress: {
    no: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  companyAddress: {
    streetOne: string;
    streetTwo: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  companyName: string;
  companyLogo: string;
  employeeName: string;
  payPeriod: string;
  payDate: string;
  currency: string;
  payslipId: string;
  companyId: string;
  payrunId: string;
  employeeId: string;
  include: boolean;
  updatedDate: string;
  earnings: number;
  earningLines: EarningLine[];
  deductions: number;
  deductionLines: DeductionLine[];
  taxes: number;
  taxLines: TaxLine[];
  superannuations: number;
  superannuationLines: SuperannuationLine[];
  reimbursements: number;
  reimbursementsLines: ReimbursementLine[];
  leaves: number;
  leaveLines: LeaveLine[];
  netPay: number;
  emailSent: boolean;
  setAsFinalPay: boolean;
}

interface EarningLine {
  earningsRateId: string;
  name: string;
  rateType: string;
  typeOfUnit: string;
  calculationType: string;
  annualSalary: string;
  ratePerUnit: string;
  numberOfUnits: string;
  numberOfUnitsPerWeek: string;
  fixedAmount: string;
  amount: number;
}

interface DeductionLine {
  deductionTypeId: string;
  name: string;
  calculationType: string;
  percentage: string;
  fixedAmount: string;
  amount: number;
}

interface TaxLine {
  name: string;
  amount: string;
}

interface SuperannuationLine {
  superannuationMembershipId: string;
  name: string;
  contributionType: string;
  calculationType: string;
  expenseAccountId: string;
  liabilityAccountId: string;
  paymentDateForThisPeriod: string;
  percentage: string;
  fixedAmount: string;
  paymentPeriod: string;
  amount: number;
}

interface ReimbursementLine {
  reimbursementTypeId: string;
  name: string;
  description: string;
  amount: string;
}

interface LeaveLine {
  name: string;
  amount: number;
}
