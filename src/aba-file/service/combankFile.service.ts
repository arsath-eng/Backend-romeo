import { Injectable } from '@nestjs/common';
import { Company } from './abaFile.service';


@Injectable()
export class CombankFileService {
  generateCombankFile(data: CombankFileInput): string {
    const lines = data.lines.map(line => this.generateLine(line));
    return lines.join('\n');
  }


private generateLine(line: Line): string {
    const isCombank = line.isCombank;
    const accountNumber = line.accountNumber.substring(0, 18).padStart(10, '');
    const amount = Math.round(line.amount || 0) .toString().substring(0, 18).padStart(10, '');
    const senderDescription = line.senderDescription.substring(0, 30).padEnd(30, '');
    const beneficiaryDescription = line.beneficiaryDescription.substring(0, 30).padEnd(30, '');
    const purposeCode = line.purposeCode.substring(0, 6).padEnd(6, '');
    const purposeDescription = line.purposeDescription.substring(0, 50).padEnd(50, '');

    if (isCombank) {
        return `${accountNumber}|${amount}|${senderDescription}|${beneficiaryDescription}|${purposeCode}|${purposeDescription}`;
    } else {
        const swiftCode = line.swiftCode?.substring(0, 11).padEnd(11, '');
        const beneficiaryName = line.beneficiaryName.substring(0, 25).padEnd(25, '');
        const beneficiaryId = line.beneficiaryId.substring(0, 30).padEnd(30, '');
        return `${accountNumber}|${amount}|${swiftCode}|${senderDescription}|${beneficiaryDescription}|${beneficiaryName}|${beneficiaryId}|${purposeCode}|${purposeDescription}`;
    }
}

}



export interface CombankFileInput {
  company: Company; 
  lines: Line[];
  validUntil: string;
  totalCredit: number;
  totalDebit: number;
  netTotal: number;
}


interface Line {
  isCombank: boolean;
  accountNumber: string;
  amount: number;
  swiftCode?: string;
  senderDescription: string;
  beneficiaryDescription: string;
  beneficiaryName: string;
  beneficiaryId: string;
  purposeCode: string;
  purposeDescription: string;
}

