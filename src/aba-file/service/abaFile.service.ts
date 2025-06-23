import { Injectable } from '@nestjs/common';
@Injectable()
export class AbaFileService {
  generateAbaFile(data: AbaFileInput): string {
    const headerRecord = this.generateHeaderRecord(data.company, data.validUntil);
    const detailRecords = data.lines.flatMap(line => 
      this.generateDetailRecord(line, data.company)
    );
    const debitRecord = this.generateDebitRecord(data.lines[0], data.totalDebit, data.company)
    const totalRecord = this.generateTotalRecord(detailRecords, data.company, data.totalCredit, data.totalDebit, data.netTotal);
    return [headerRecord, ...detailRecords, debitRecord, totalRecord].join('\n');
  }

  private generateHeaderRecord(companyAccount: Company, validUntil: string): string {
    const recordType = '0';
    const reserved1 = ' '.padEnd(17);
    const reelSequence = '01';
    const bankCode = companyAccount.bankCode;
    const reserved2 = ' '.padEnd(7);
    const userName = (companyAccount.companyName || '').substring(0, 26).padEnd(26);
    const apcaId = companyAccount.apcaId.substring(0, 6).padStart(6, '0');
    const description = 'PAYROLL'.substring(0, 12).padEnd(12);
    const processingDate = new Date(validUntil).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '');
    const reserved3 = ' '.padEnd(40);

    return recordType +
      reserved1 +
      reelSequence +
      bankCode +
      reserved2 +
      userName +
      apcaId +
      description +
      processingDate +
      reserved3;
  }

  private generateDetailRecord(line: Line, companyAccount: Company): string {
    const recordType = '1';
    const bsb = (line.bsb || '').replace(/(\d{3})(\d{3})/, '$1-$2').substring(0, 7).padEnd(7);
    const accountNumber = (line.accountNumber || '').substring(0, 9).padStart(9, ' ');
    const indicator = ' ';
    const transactionCode = (line.transactionCode || '53').padStart(2, '0');
    const amount = Math.round((line.amount || 0) * 100).toString().substring(0, 10).padStart(10, '0');
    const accountTitle = (line.accountName || '').substring(0, 32).padEnd(32);
    const lodgementRef = (line.lodgementReference || 'Salary').substring(0, 18).padEnd(18);
    const traceBsb = (line.traceBsb || '').replace(/(\d{3})(\d{3})/, '$1-$2').substring(0, 7).padEnd(7);
    const traceAccount = (line.traceAccountNumber || '').substring(0, 9).padStart(9, ' ');
    const remitterName = (line.remitterName || '').substring(0, 16).padEnd(16); 
    const withholdingTax = (line.withHoldingTax || 0).toString().substring(0, 8).padStart(8, '0');

    return recordType +
      bsb +
      accountNumber +
      indicator +
      transactionCode +
      amount +
      accountTitle +
      lodgementRef +
      traceBsb +
      traceAccount +
      remitterName +
      withholdingTax;
  }

  private generateDebitRecord(line: Line,totalDebit: number, companyAccount: Company):string {
    const recordType = '1';
    const bsb = (line.traceBsb || '').replace(/(\d{3})(\d{3})/, '$1-$2').substring(0, 7).padEnd(7);
    const accountNumber = (line.traceAccountNumber || '').substring(0, 9).padStart(9, ' ');
    const indicator = ' ';
    const transactionCode = ('13').padStart(2, '0');
    const amount = Math.round((totalDebit || 0) * 100).toString().substring(0, 10).padStart(10, '0');
    const accountTitle = (line.remitterName || '').substring(0, 32).padEnd(32);
    const lodgementRef = (line.lodgementReference || 'Salary').substring(0, 18).padEnd(18);
    const traceBsb = (line.traceBsb || '').replace(/(\d{3})(\d{3})/, '$1-$2').substring(0, 7).padEnd(7);
    const traceAccount = (line.traceAccountNumber || '').substring(0, 9).padStart(9, ' ');
    const remitterName = (line.remitterName || '').substring(0, 16).padEnd(16); 
    const withholdingTax = (line.withHoldingTax || 0).toString().substring(0, 8).padStart(8, '0');

    return recordType +
      bsb +
      accountNumber +
      indicator +
      transactionCode +
      amount +
      accountTitle +
      lodgementRef +
      traceBsb +
      traceAccount +
      remitterName +
      withholdingTax;
  }
  

  private generateTotalRecord(detailRecords: string[], companyAccount: Company, totalCredit: number, totalDebit: number, netTotal: number): string {
    const recordType = '7';
    const bsb = '999-999'.padEnd(7);
    
    const blank = ' '.padEnd(12)
    const netTotalStr = Math.round((netTotal || 0)* 100).toString().substring(0, 10).padStart(10, '0');
    const creditTotalStr = Math.round((totalCredit || 0)* 100).toString().substring(0, 10).padStart(10, '0');
    const debitTotalStr = Math.round((totalDebit || 0)* 100).toString().substring(0, 10).padStart(10, '0');
    const reserved2 = ' '.padEnd(24);
    const count = (detailRecords.length + 1).toString().padStart(6, '0');
    const reserved3 = ' '.padEnd(40);

    return recordType +
      bsb +
      blank +
      netTotalStr +
      creditTotalStr +
      debitTotalStr +
      reserved2 +
      count +
      reserved3;
  }
}
export interface Company {
  bsb: string;
  bankCode: string;
  apcaId: string;
  accountNumber: string;
  companyName: string;
  shortName: string;
  fileCreationDate: string;
  fileId: string;
}
  

export interface BankAccount {
  accName: string;
  accNumber: string;
  bsbNumber: string;
  amount: string;
}

export interface PayslipDetail {
  companyName: string;
  employeeName: string;
  payDate: string;
  netPay: number;
  bankAccounts: BankAccount[];
}

export interface AbaFileInput {
  company: Company;
  lines: Line[];
  validUntil: string;
  totalCredit: number;
  totalDebit: number;
  netTotal: number;
}

export interface Line {
  bsb: string;
  accountNumber: string;
  transactionCode: string;
  amount: number;
  accountName: string;
  lodgementReference: string;
  traceBsb: string;
  traceAccountNumber: string;
  remitterName: string;
  withHoldingTax: number;
}