   
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as pug from 'pug';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import path from 'path';
import { TemplateEmployee, EPFTemplate } from './pdf.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { format } from 'date-fns';
import e from 'express';

@Injectable()
export class PdfService {
  constructor(
        @InjectDataSource() private datasource: DataSource,
  ) {}

    async generatePdf(templatePath: string, data: any): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
      
        const html = pug.renderFile(templatePath,  data );
        
        await page.setContent(html, { waitUntil: 'networkidle0' });  
        
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground:true,landscape: false });

        await browser.close();
        return pdfBuffer;
    }

    async generateEtfEmployer(etfTemplate: EPFTemplate): Promise<Buffer> {
        try {
          const templatePath = 'src/pdf/template/etf-template.pdf';
          const pdfBytes = fs.readFileSync(templatePath);
          const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
          const form = pdfDoc.getForm();

          form.getTextField('empNo')?.setText(etfTemplate.epfRegistrationNo);
          form.getTextField('dateOfPayment')?.setText(etfTemplate.monthYear);
          form.getTextField('amountOfContribution')?.setText(etfTemplate.contributions);
          form.getTextField('surcharge')?.setText(etfTemplate.surcharges);
          form.getTextField('totalAmountOfRemitance')?.setText(etfTemplate.totalRemittance);
          form.getTextField('chequeNo')?.setText(etfTemplate.chequeNo);
          form.getTextField('bankAndBranch')?.setText(etfTemplate.bankNameBranch);
          form.getTextField('NumberOfEmp')?.setText(etfTemplate.employees.length.toString());
          
          let total = 0;
          for (let i = 0; i < etfTemplate.employees.length; i++) {
            form.getTextField(`member_${i}_name`)?.setText(etfTemplate.employees[i].name);
            form.getTextField(`nationalId_${i}`)?.setText(etfTemplate.employees[i].nationalId);
            form.getTextField(`member_${i}_no`)?.setText(etfTemplate.employees[i].memberNo);
            const employerContrib = etfTemplate.employees[i].employerContribution.split('.');
            const rupees = employerContrib[0] || '0';
            const cents = employerContrib[1] || '00';
            form.getTextField(`member_${i}_rs`)?.setText(rupees);
            form.getTextField(`member_${i}_cts`)?.setText(cents);
            total += parseFloat(etfTemplate.employees[i].employerContribution);
          }
          const [totalRupees, totalCents] = total.toFixed(2).split('.');
          form.getTextField('totalRs')?.setText(totalRupees);
          form.getTextField('totalCts')?.setText(totalCents);
          form.getTextField('signatureEmp')?.setText(etfTemplate.employerSignature);
          form.getTextField('telPhoneNo')?.setText(etfTemplate.employerTelephone);
          form.getTextField('emailAddress')?.setText(etfTemplate.employerEmail);
          const currentDate = new Date().toLocaleDateString();
          form.getTextField('date')?.setText(currentDate);
          form.flatten();
          const filledPdfBytes = await pdfDoc.save();
          return Buffer.from(filledPdfBytes);
        } catch (error) {
          throw new Error(`Failed to fill PDF form: ${error.message}`);
        }
    }

    async generateEpfEmployer(etfTemplate: EPFTemplate): Promise<Buffer> {
      try {
        const templatePath = 'src/pdf/template/epf-template.pdf';
        const pdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
        const form = pdfDoc.getForm();

        form.getTextField('company_name')?.setText('-');
        form.getTextField('no')?.setText('-');
        form.getTextField('address_line')?.setText('-');
        form.getTextField('city')?.setText('-');
        form.getTextField('month_year')?.setText(etfTemplate.totalRemittance);

        const contributions = etfTemplate.contributions.split('.');
        const contributionsRs = contributions[0] || '0';
        const contributionsCts = contributions[1] || '00';
        const surcharges = etfTemplate.surcharges.split('.');
        const surchargesRs = surcharges[0] || '0';
        const surchargesCts = surcharges[1] || '00';
        const totalRemittance = etfTemplate.totalRemittance.split('.');
        const totalRemittanceRs = totalRemittance[0] || '0';
        const totalRemittanceCts = totalRemittance[1] || '00';
        form.getTextField('contributions_rs')?.setText(contributionsRs);
        form.getTextField('contributions_cts')?.setText(contributionsCts);
        form.getTextField('surcharges_rs')?.setText(surchargesRs);
        form.getTextField('surcharges_cts')?.setText(surchargesCts);
        form.getTextField('total_remittance_rs')?.setText(totalRemittanceRs);
        form.getTextField('total_remittance_cts')?.setText(totalRemittanceCts);
        form.getTextField('cheque_no')?.setText(etfTemplate.chequeNo);
        form.getTextField('bank_branch_name')?.setText(etfTemplate.bankNameBranch);

        form.getTextField('signature_of_employer')?.setText(etfTemplate.employerSignature);
        form.getTextField('telephone_no')?.setText(etfTemplate.employerTelephone);
        form.getTextField('telephone_e')?.setText(etfTemplate.employerTelephone);
        form.getTextField('fax_e')?.setText(etfTemplate.employerFax);
        form.getTextField('email_e')?.setText(etfTemplate.employerEmail);
        form.getTextField('telephone_s')?.setText(etfTemplate.employerTelephone);
        form.getTextField('fax_s')?.setText(etfTemplate.employerFax);
        form.getTextField('email_s')?.setText(etfTemplate.employerEmail);
        form.getTextField('telephone_t')?.setText(etfTemplate.employerTelephone);
        form.getTextField('fax_t')?.setText(etfTemplate.employerFax);
        form.getTextField('email_t')?.setText(etfTemplate.employerEmail);
        
        let totalEmployer = 0;
        let totalEmployee = 0;
        for (let i = 0; i < etfTemplate.employees.length; i++) {
          form.getTextField(`employee_name_${i}`)?.setText(etfTemplate.employees[i].name);
          form.getTextField(`national_id_no_${i}`)?.setText(etfTemplate.employees[i].nationalId);
          form.getTextField(`member_no_${i}`)?.setText(etfTemplate.employees[i].memberNo);
          const total = etfTemplate.employees[i].total.split('.');
          const totalRs = total[0] || '0';
          const totalCts = total[1] || '00';
          const employer = etfTemplate.employees[i].employerContribution.split('.');
          const employerRs = employer[0] || '0';
          const employerCts = employer[1] || '00';
          const earnings = etfTemplate.employees[i].totalEarnings.split('.');
          const earningsRs = earnings[0] || '0';
          const earningsCts = earnings[1] || '00';
          form.getTextField(`total_rs_${i}`)?.setText(totalRs);
          form.getTextField(`total_cts_${i}`)?.setText(totalCts);
          form.getTextField(`employer_rs_${i}`)?.setText(employerRs);
          form.getTextField(`employer_cts_${i}`)?.setText(employerCts);
          form.getTextField(`employee_rs_${i}`)?.setText(earningsRs);
          form.getTextField(`employee_cts_${i}`)?.setText(earningsCts);
          form.getTextField(`total_earnings_${i}`)?.setText(etfTemplate.employees[i].totalEarnings);
          totalEmployer += parseFloat(etfTemplate.employees[i].employeeContribution);
          totalEmployee += parseFloat(etfTemplate.employees[i].employerContribution);
        }
        const [totalEmployerRs, totalEmployerCts] = totalEmployer.toFixed(2).split('.');
        const [totalEmployeRs, totalEmployeeCts] = totalEmployee.toFixed(2).split('.');
        form.getTextField('total_rs')?.setText(totalRemittanceRs);
        form.getTextField('total_cts')?.setText(totalRemittanceCts);
        form.getTextField('employer_rs')?.setText(totalEmployerRs);
        form.getTextField('employer_cts')?.setText(totalEmployerCts);
        form.getTextField('employee_rs')?.setText(totalEmployeRs);
        form.getTextField('employee_cts')?.setText(totalEmployeeCts);
        form.flatten();
        const filledPdfBytes = await pdfDoc.save();
        return Buffer.from(filledPdfBytes);
      } catch (error) {
        throw new Error(`Failed to fill PDF form: ${error.message}`);
      }
  }
    
}