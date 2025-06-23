import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CompanyService } from '../company/service/company.service';
const axios = require('axios')
import { DataSource, Repository } from 'typeorm';

const connection = 'connect-sap';
import { Response } from 'express';
import { log } from 'util';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class APIService {
    private readonly API;
    constructor(
      @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
      @InjectDataSource() private dataSource: DataSource,
      private readonly configService: ConfigService,
    ) {
      this.API = axios.create({
        baseURL: `${this.configService.get<string>('SAPDOMAIN')}/admin/v1`,
      })
      this.API.defaults.headers.common["backendsecret"] = '$#1q2w3e4r';
    }
    //API calls
    async romeoWebPackages(currency) {
      try {
        let pkgArray = [];
          const superAdminConfigPackages = await this.getSuperAdminConfigPackages();  
          
          for (let i=0;i<superAdminConfigPackages.length;i++) {
            let json = {
              packageName:'',
              monthly: {perSeatCost:''},
              yearly: {perSeatCost:''}
            }
            json.packageName = superAdminConfigPackages[i].name;
            for (let j=0;j<superAdminConfigPackages[i].stripeValues.length;j++) {
              if (superAdminConfigPackages[i].stripeValues[j].currency === currency) {
                json.monthly.perSeatCost = superAdminConfigPackages[i].stripeValues[j].monthlyCost;
                json.yearly.perSeatCost = superAdminConfigPackages[i].stripeValues[j].yearlyCost;
              }
            }
            pkgArray.push(json);
          }
          return pkgArray;
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postSuperAdminSurvey(survey) {
      try {
          const res = await this.API.post(`${connection}/survey`, survey);   
          return res.data;
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async addStripeCustomer(email:string, name:string, address) {
      try {
        let body = {email: email, name: name, address: address}
        const res = await this.API.post(`${connection}/stripe-customer`, body);   
        return res.data;
      } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async addTrialSubscription(currency:string, stripeOwnerId, productId) {
      try {
        let body = {stripeOwnerId, productId, currency}
        const res = await this.API.post(`${connection}/trial-subscription`, body);   
        return res.data; 
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async deleteStripeSubscription(subscriptionId) {
      try {
        const res = await this.API.delete(`${connection}/delete-subscription/${subscriptionId}`);   
        return res.data;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async getStripeSubscription(subscriptionId:string) {
      try {
        const res = await this.API.get(`${connection}/get-subscription/${subscriptionId}`);   
        return res.data;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async updateStripeSubscription(subscriptionId, items, type) {
      try {
        let body = {subscriptionId, items, type}
        const res = await this.API.put(`${connection}/update-subscription`, body);   
        return res.data; 
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async voidInvoice(invoiceId) {
      try {
        const res = await this.API.delete(`${connection}/void-invoice`, invoiceId);   
        return res.data;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async deleteCompanyUnsubscribeByCompanyId(companyId:string) {
      try {
          await this.API.delete(`${connection}/company-unsubscribe/${companyId}`);   
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteSuperAdminCompanyFeatures(companyId:string) {
      try {
          await this.API.delete(`${connection}/sap-company-features/${companyId}`);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteSuperAdminCompanyEmail(companyId:string) {
      try {
          await this.API.delete(`${connection}/sap-company-email/${companyId}`);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postSuperAdminCompanyFeatures(superAdminCompanyFeature) {
      try {
          await this.API.post(`${connection}/sap-company-features`, superAdminCompanyFeature);    
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getActiveSuperAdminCompanyFeatures(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap-company-features/active/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getActivePackageSuperAdminCompanyFeatures(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap-company-features/active-package/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getActiveAddonSuperAdminCompanyFeatures(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap-company-features/active-addon/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteSuperAdminCompanyRefund(companyId:string) {
      try {
          await this.API.delete(`${connection}/sap-company-refund/${companyId}`);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminConfigFeatureById(id:string) {
      try {
        const res = await this.API.get(`${connection}/sap-config-features/${id}`);
        return res.data;  
      } catch (error) {
        console.log(error)
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminConfigFeatures() {
      try {
        const res = await this.API.get(`${connection}/sap-config-features-all`);
        return res.data;  
      } catch (error) {
        console.log(error)
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminConfigFeatureHistoryCleanUp() {
      try {
        const res = await this.API.get(`${connection}/sap-config-features-history-cleanup`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminPackagesById(id:string) {
      try {
        const res = await this.API.get(`${connection}/sap-packages/${id}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminPackagesPremium() {
      try {
        const res = await this.API.get(`${connection}/sap-packages-premium`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminUserByEmail(email:string) {
      try {
        const res = await this.API.get(`${connection}/sap-users-email/${email}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminUserById(id:string) {
      try {
        const res = await this.API.get(`${connection}/sap-users/${id}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postSuperAdminUser(superAdminUser) {
      try {
          await this.API.post(`${connection}/sap-users/`, superAdminUser);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getTestCompanyByEmail(email:string) {
      try {
        const response = await this.API.get(`${connection}/test-company/${email}`);
        return response.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminConfigPackagesById(id:string) {
      try {
        const res = await this.API.get(`${connection}/sap/config/packages/${id}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCouponByCompanyId(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/${companyId}/coupon`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminConfigPackages() {
      try {
        const res = await this.API.get(`${connection}/sap/config/packages`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminCompanyFeaturesSingle(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap/company/features/single/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminCompanyFeatures(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap-company-features/active/${companyId}`);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postSuperAdminEmailCount(superAdminEmailCount) {
      try {
          await this.API.post(`${connection}/sap-company-email-count`, superAdminEmailCount);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getSuperAdminEmailCount(type:string, companyId:string) {
      try {
        const res = await this.API.get(`${connection}/sap-company-email-count/${type}/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCompanyById(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/company/${companyId}`);
        return res.data;  
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCompanyAbnVerification(abn: string, branchNo: string) {
      try {
        const res = await this.API.get(`${connection}/company-abn?abn=${abn}&branchNo=${branchNo}`);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCompanyByName(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/company-name/${companyId}`);
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getAllCompanies() {
      try {
        const res = await this.API.get(`${connection}/company-all/`);   
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getActiveCompanies() {
    try {
      const res = await this.API.get(`${connection}/company-active/`);
      return res.data;  
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
    }
    async postCompany(company) {
      try {
        const res = await this.API.post(`${connection}/company`, company); 
        
        return res.data;
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async putCompany(company) {
      try {
        const res = await this.API.put(`${connection}/company`, company); 
        
        return res.data;
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteCompanyById(companyId:string) {
      try {
          await this.API.delete(`${connection}/company/${companyId}`); 
             
      } catch (error) {
        console.log(error)
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getTestCompanies() {
      try {
        const res = await this.API.get(`${connection}/company-all-test/`);   
        return res.data;  
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postPackageUpgrade(packageUpgrade) {
      try {
        const res = await this.API.post(`${connection}/package/upgrade`, packageUpgrade);  
        return res.data;   
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postPackageVerify(packageVerify) {
      try {
        const res = await this.API.post(`${connection}/package/verify`, packageVerify);   
        return res.data;    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async deleteSubscripton(companyId:string) {
      try {
          await this.API.delete(`${connection}/package-unsubscribe/${companyId}`);    
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getCard(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/${companyId}/retrieve-card-information`);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postUpdateCard(updateCard, companyId:string) {
      try {
        const res = await this.API.post(`${connection}/${companyId}/update-card`, updateCard); 
        return res.data; 
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    //Methods
    async getOwnerByUserName(username:string) {
      try {
        const employee = await this.dataSource.query(`SELECT * FROM hrm_employee_details WHERE "username" = $1 AND "owner" = $2`,[username, true]);
          return employee[0];
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getOwnerByCompanyId(companyId:string) {
      try {

        
        const employee = await this.dataSource.query(
          `SELECT *
          FROM hrm_employee_details e
          JOIN hrm_users u ON e."userId" = u."userId" AND e."companyId"='${companyId}' AND e."owner"=TRUE`

        ).then(res=> res[0]);
          return employee;
      } catch (error) {
        console.log(error);
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getEmployeesByCompanyId(companyId:string) {
      try {
        const employees = await this.employeeDetailsRepository.find({
          where: { companyId: companyId }});
          return employees;
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postCoupons(companyId:string) {
      try {
        const body = {companyId:companyId}
        const res = await this.API.post(`${connection}/post-coupon`, body); 
        return res.data; 
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async postCouponsEmailSend(companyId:string) {
      try {
        const body = {companyId:companyId}
        const res = await this.API.post(`${connection}/post-coupon-email`, body); 
        return res.data; 
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async updateStripeCustomerEmail(companyId: string, email: string) {
      try {
        const body = {companyId:companyId, email: email}
        const res = await this.API.post(`${connection}/update-customer-email`, body); 
        return res.data; 
      } catch (error) {
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getStripeInvoiceList(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/${companyId}/invoice-list`);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async renewStripeSubscription(execute: boolean,companyId:string) {
      try {
        if (execute) {}
        else {
          execute = false;
        }
        const body = {execute: execute}
        const res = await this.API.post(`${connection}/${companyId}/renew-subscription`, body);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
    async getAttemptCount(companyId:string) {
      try {
        const res = await this.API.get(`${connection}/${companyId}/latest-invoice-attempt-count`);
        return res.data;  
      } catch (error) {
        console.log(error);
        
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    }
}
