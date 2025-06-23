
import { ConfigService } from '@nestjs/config';
import { APIService } from '../../superAdminPortalAPI/APIservice.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { HrmEmployeeDetails } from '../../allEntities/employeeDetails.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository,DataSource } from 'typeorm';
import { InjectRepository,InjectDataSource } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import * as crypto from 'crypto';
@Injectable()
export class EmailsNewService {
  private ses: AWS.SES;
  constructor(
    private APIService: APIService,
    private configService: ConfigService,

    @InjectRepository(HrmEmployeeDetails)
    private readonly hrmEmployeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmVerification) private verificationRepository: Repository<HrmVerification>,
     @InjectDataSource() private dataSource: DataSource,
     private eventEmitter: EventEmitter2,
    ) {
      this.ses = new AWS.SES({
        accessKeyId: this.configService.get<string>('AWS_SES_AKI_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_SES_SECRET'),
        region: this.configService.get<string>('AWS_SES_REGION'),
      });
      this.createVerificationEmailTemplate();
    }
    

    async sendCompanyEmail(subject: string, email: string, body,companyId: string,fromEmail?: string) {
      const company = await this.APIService.getCompanyById(companyId);
      const companyMail = company.appIntegration?.senderEmail?.email;
      //const fromEmail = companyMail ? companyMail : 'notifications@romeohr.com';
      const senderEmail =company.appIntegration?.senderEmail?.email|| fromEmail 

    
      const params: AWS.SES.SendEmailRequest = {
        Source: senderEmail || 'notifications@romeohr.com',
        Destination: {
          ToAddresses: [email],
          CcAddresses: [],
          BccAddresses: [],
        },
        Message: {
          Subject: {
            Data: `RomeoHR ${subject}`,
          },
          Body: {
            Html: {
              Data: body,
            },
          },
        },
      };
      return this.ses.sendEmail(params).promise();
    }

  async sendEmail(subject: string, email: string[], body,companyId: string,fromEmail?: string) {

    
    const company = await this.APIService.getCompanyById(companyId);
      const companyMail = company.appIntegration?.senderEmail?.email;
      //const fromEmail = companyMail ? companyMail : 'notifications@romeohr.com';
      const senderEmail =company.appIntegration?.senderEmail?.email|| fromEmail 

    
      const params: AWS.SES.SendEmailRequest = {
        Source: senderEmail || 'notifications@romeohr.com',
        Destination: {
          ToAddresses: email,
          CcAddresses: [],
          BccAddresses: [],
        },
        Message: {
          Subject: {
            Data: `RomeoHR ${subject}`,
          },
          Body: {
            Html: {
              Data: body,
            },
          },
        },
      };
      return this.ses.sendEmail(params).promise();
  }
  async postSapEmailCount(sapCountType:string, companyId:string) {
    if (sapCountType === 'sap') {}
    else {
      const existingSuperAdminEmailCount = await this.APIService.getSuperAdminEmailCount(sapCountType, companyId);
      
      if (existingSuperAdminEmailCount) {
        existingSuperAdminEmailCount.count = existingSuperAdminEmailCount.count + 1;
        existingSuperAdminEmailCount.modifiedAt = new Date(Date.now());
        await this.APIService.postSuperAdminEmailCount(existingSuperAdminEmailCount);
      }
    }
  }

/* @OnEvent('send.company.email')
  async sendUserConfirmationCompanyEmai(emitterBody) {
    try {
      await this.sendCompanyEmail(emitterBody.subjects, emitterBody.email, emitterBody.body,emitterBody.companyId,emitterBody.fromEmail);
      await this.postSapEmailCount(emitterBody.sapCountType, emitterBody.companyId);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  } */
  @OnEvent('send.email')
  async sendUserConfirmation(emitterBody) {
    try {
      await this.sendEmail(emitterBody.subjects, Array.isArray(emitterBody.email) ? emitterBody.email : [emitterBody.email], emitterBody.body,emitterBody.companyId,emitterBody.fromEmail);
      await this.postSapEmailCount(emitterBody.sapCountType, emitterBody.companyId);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async getEmployeeEmail(employeeId: string): Promise<string> {
    const employeeDetails = await this.hrmEmployeeDetailsRepository.findOne({
      where: { employeeId },
    });

    if (!employeeDetails) {
      throw new Error(`Employee details not found for employee ID ${employeeId}`);
    }

    const employeeEmail = employeeDetails?.email?.work;

    if (!employeeEmail) {
      throw new Error(`Work email not found for employee ID ${employeeId}`);
    }

    return employeeEmail;
  }

  async blobToBase64(pdfBuffer: Buffer): Promise<string> {
    return pdfBuffer.toString('base64');
  }
  private constructRawEmail({ Source, Destination, Message, Attachments }) {
    const boundary = `----=_Part_${Math.random()}`;
    const attachmentContent = Attachments[0].Content;

    const attachment = `--${boundary}\r\n` +
      `Content-Type: ${Attachments[0].ContentType}; name="${Attachments[0].Filename}"\r\n` +
      'Content-Transfer-Encoding: base64\r\n' +
      `Content-Disposition: attachment; filename="${Attachments[0].Filename}"\r\n\r\n` +
      `${attachmentContent}\r\n\r\n`;

    const email = `From: ${Source}\r\n` +
      `To: ${Destination.ToAddresses.join(', ')}\r\n` +
      `Subject: ${Message.Subject.Data}\r\n` +
      'MIME-Version: 1.0\r\n' +
      `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n` +
      `--${boundary}\r\n` +
      'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
      `${Message.Body.Html.Data}\r\n\r\n` +
      `${attachment}\r\n--${boundary}--`;

    return email;
  }
  async sendEmailWithAttachment(
    fileName: string,
    subject:string,    
    pdfBuffer: Buffer,
    employeeId: string
  
  ){

    try{
      const employeeEmail = await this.getEmployeeEmail(employeeId);
    //console.log(employeeEmail)
    
    const base64Pdf = await this.blobToBase64(pdfBuffer);
    
    const rawMessage = this.constructRawEmail({
      Destination: {
        ToAddresses: [employeeEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'Please find the attached payslip.',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: 'notifications@romeohr.com',
      Attachments: [
        {
          ContentType: 'application/pdf',
          Filename: fileName,
          ContentDisposition: 'attachment',
          Content: base64Pdf,
        },
      ],
    });
    await this.ses.sendRawEmail({
      RawMessage: {
        Data: Buffer.from(rawMessage),
      },
    }).promise();
    }catch(error){
      console.error('Error sending email:', error);
      throw new HttpException('Failed to send email with attachment', HttpStatus.BAD_REQUEST);
    }
    
  }

  private async downloadFile(url: string): Promise<Buffer> {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new HttpException('Failed to download attachment', HttpStatus.BAD_REQUEST);
    }
  }

  private getFileExtension(url: string): string {
    const match = url.match(/\.([^.]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : '';
  }

  private getMimeType(extension: string): string {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async sendEmailWithAttachmentsfromS3(
    subject: string,
    email: string,
    bodyText: string,
    attachmentUrls: { path: string }[]
  ) {
    try {
      // Process attachments
      const attachments = await Promise.all(
        attachmentUrls.map(async ({ path }) => {
          const fileData = await this.downloadFile(path);
          const extension = this.getFileExtension(path);
          const filename = path.split('/').pop()?.split('?')[0] || `attachment.${extension}`;
          
          return {
            filename,
            content: fileData.toString('base64'),
            contentType: this.getMimeType(extension),
            contentDisposition: 'attachment'
          };
        })
      );

      // raw email with attachments
      const boundary = `boundary_${Date.now().toString(36)}`;
      const message = this.createMultipartMessage(
        email,
        subject,
        bodyText,
        attachments,
        boundary
      );

      const params = {
        RawMessage: { Data: Buffer.from(message) },
        Source: 'notifications@romeohr.com',
        Destinations: [email]
      };

      return this.ses.sendRawEmail(params).promise();
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException(
        'Failed to send email with attachments',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private createMultipartMessage(
    toEmail: string,
    subject: string,
    bodyText: string,
    attachments: any[],
    boundary: string
  ): string {
    let message = [
      'MIME-Version: 1.0',
      `From: notifications@romeohr.com`,
      `To: ${toEmail}`,
      `Subject: RomeoHR ${subject}`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      bodyText,
      ''
    ].join('\r\n');

    // Add attachments
    attachments.forEach(attachment => {
      message += [
        `--${boundary}`,
        `Content-Type: ${attachment.contentType}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: ${attachment.contentDisposition}; filename="${attachment.filename}"`,
        '',
        attachment.content,
        ''
      ].join('\r\n');
    });

    message += `--${boundary}--`;
    return message;
  }

  @OnEvent('send.email.with.S3attachments')
  async handleEmailWithAttachments(emitterBody: {
    sapCountType: string;
    companyId: string;
    subjects: string;
    email: string;
    body: string;
    attachments: { path: string }[];
  }) {
    try {
      await this.sendEmailWithAttachmentsfromS3(
        emitterBody.subjects,
        emitterBody.email,
        emitterBody.body,
        emitterBody.attachments
      );
      
      
      if (emitterBody.sapCountType && emitterBody.companyId) {
        await this.postSapEmailCount(emitterBody.sapCountType, emitterBody.companyId);
      }
    } catch (error) {
      console.error('Error handling email with attachments:', error);
      throw new HttpException('Failed to process email', HttpStatus.BAD_REQUEST);
    }
  }

  
    async verifyEmail(email: string): Promise<void> {
      const params = {
        EmailAddress: email,
      };
      await this.ses.verifyEmailIdentity(params).promise();
      //console.log(`Verification email sent to ${email}`);
    }
  
    private async createVerificationEmailTemplate(): Promise<void> {
      try {
        const templateName = 'SESIdentityVerificationTemplatefinal';
        
        
        const existingTemplates = await this.ses.listCustomVerificationEmailTemplates().promise();
        const templateExists = existingTemplates.CustomVerificationEmailTemplates?.some(
          (template) => template.TemplateName === templateName
        );
    
        if (templateExists) {
          //console.log(`Template "${templateName}" already exists. Skipping creation.`);
          return;
        }
    
        // Create the template if it doesn't exist
        const params: AWS.SES.CreateCustomVerificationEmailTemplateRequest = {
          TemplateName: templateName,
          FromEmailAddress: 'notifications@romeohr.com',
          TemplateSubject: 'Verify Your Email Address for RomeoHR',
          TemplateContent: `
          <html>
                      <head></head>
                      <body style='font-family:sans-serif;'>
                        <h1 style='text-align:center'>Verify Your Email for Configuration</h1>
                        <p>Thank you for configuring your HR platform account! This
                  includes setting up your custom email for seamless
                  communication.</p>
                      </body>
                      </html>
          `,
          SuccessRedirectionURL: `${process.env.DOMAIN}/email-verified`,
          FailureRedirectionURL: `${process.env.DOMAIN}/email-verified`,
        };

    
    
        await this.ses.createCustomVerificationEmailTemplate(params).promise();
        //console.log('SES identity verification template created successfully ${templateName}');
      } catch (error) {
        console.error('Error creating SES verification email template:', error);
      }
    }
    

    async verifyEmailIdentity(body: any, companyId: string) {
      try {
        const company = await this.APIService.getCompanyById(companyId);
        const ownerEmployee = await this.dataSource.query(
          `SELECT "employeeId" FROM hrm_employee_details WHERE "companyId" = $1 AND "status" != 'Non Active' AND "owner" = true ORDER BY RANDOM() LIMIT 1`,
          [companyId],
        );
  
        const email = body['email'];
  
        
        const identityParams = {
          Identities: [email],
        };
        const identityResult = await this.ses.getIdentityVerificationAttributes(identityParams).promise();
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationRecord = new HrmVerification();
        verificationRecord.username = email;
        verificationRecord.employeeId = ownerEmployee[0].employeeId; 
        verificationRecord.type = 'email verification';
        verificationRecord.status = 'pending';
        verificationRecord.canUse = true;
        verificationRecord.token = verificationToken;
        const savedverificationRecord =  await this.verificationRepository.save(verificationRecord);

        const successRedirectURL = `${process.env.DOMAIN}/#/email-verified?token=${verificationToken}&email=${email}&id=${savedverificationRecord.id}&companyId=${companyId}`
  
        if (
          !identityResult.VerificationAttributes[email] ||
          identityResult.VerificationAttributes[email].VerificationStatus !== 'Success'
        ) {


          const customParams = {
            EmailAddress: email,
            TemplateName: 'SESIdentityVerificationTemplatefinal',
            
          };

          try{
            await this.ses.sendCustomVerificationEmail(customParams).promise();
          }catch(error){
            console.log(error);
          }
  
          
          //console.log(`Custom verification email sent to ${email}`);
  
          
         /*  const verificationToken = crypto.randomBytes(32).toString('hex');
          const verificationRecord = new HrmVerification();
          verificationRecord.username = email;
          verificationRecord.employeeId = ownerEmployee[0].employeeId; 
          verificationRecord.type = 'email verification';
          verificationRecord.status = 'pending';
          verificationRecord.canUse = true;
          verificationRecord.token = verificationToken;
          const savedverificationRecord =  await this.verificationRepository.save(verificationRecord);
 */
          try{
            await this.ses.updateCustomVerificationEmailTemplate({
              TemplateName: 'SESIdentityVerificationTemplatefinal',
              SuccessRedirectionURL: successRedirectURL,
              FailureRedirectionURL: `${process.env.DOMAIN}/#/email-verified?verified=${false}`,
              FromEmailAddress: 'notifications@romeohr.com',
              TemplateSubject: 'Verify Your Email Address for RomeoHR',
              TemplateContent: `
              <html>
                <head></head>
                <body style='font-family:sans-serif;'>
                  <h1 style='text-align:center'>Verify Your Email for Configuration</h1>
                  <p>Thank you for configuring your HR platform account! This
                    includes setting up your custom email for seamless
                    communication.</p>
                </body>
              </html>
              `
            }).promise();
          }catch(e){
            console.log(e);
          }


         

          const updatedCompany = {
            ...company,
            appIntegration: {
              ...company.appIntegration,
              senderEmail: {
                email: email,
                verified: false
              }
            }
          };
          

          
          
         // console.log("Updated company object before PUT request:", JSON.stringify(updatedCompany, null, 2));
          
         try{
          const updateResponse = await this.APIService.putCompany(updatedCompany);
         }catch(error){
           console.log(error);
         }
          

          return { message: `Verification email sent`};
          //return updateResponse;

          //const updateAppIntergration = await this.APIService.putCompany(updateAppIntegration);
        } else {
          console.log(`Email ${email} is already verified as a sending identity`);
          const emitBody = {
            sapCountType: 'email verification',
            companyId,
            subjects: 'Verify Your Email for Configuration',
            email: email,
            body: `Thank you for configuring your HR platform account! This includes setting up your custom email for seamless communication. Please confirm your email by clicking <a href="${successRedirectURL}">here</a>.`,
          };
          this.eventEmitter.emit('send.email', emitBody);
          return { message: `Verification email sent`};
        }
      } catch (error) {
        console.error('Error verifying email identity:', error);
        throw new Error(`Failed to verify email identity for ${body['email']}: ${error.message}`);
      }
    }  

    async completeVerification(token: string, body: any,companyId:string){
      try {
        const company = await this.APIService.getCompanyById(companyId);
        const email = body['email'];
        const id = body['id'];
        const verificationRecord = await this.verificationRepository.findOneOrFail({
          where: { token: token, id: id },
        });
  
        if (!verificationRecord) {
          throw new Error('Invalid verification token or email');
        }
        const identityParams = {
          Identities: [email],
        };
        const identityResult = await this.ses.getIdentityVerificationAttributes(identityParams).promise();
  
        if (
          identityResult.VerificationAttributes[email] &&
          identityResult.VerificationAttributes[email].VerificationStatus === 'Success'
        ) {
          verificationRecord.status = 'verified';
          verificationRecord.canUse = false;
          verificationRecord.token = null;
          await this.verificationRepository.save(verificationRecord);

          const updatedCompany = {
            ...company,
            appIntegration: {
              ...company.appIntegration,
              senderEmail: {
                email: email,
                verified: true
              }
            }
          };
          try {
            await this.APIService.putCompany(updatedCompany);
          } catch (error) {
            console.log(error);
          }
    
          return { message: `Email has been successfully verified and updated in the company settings.`};
        } else {
          throw new Error(`Email ${email} is not yet verified with AWS SES`);
        }
      } catch (error) {
        console.error('Error completing verification:', error);
        throw new Error(`Failed to complete verification for ${body['email']}: ${error.message}`);
      }
    } 

    

}
