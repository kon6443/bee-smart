import { Injectable } from '@nestjs/common';
import { MySQLRepository } from '../shared/mysql.repository';

import { GetPlanDto } from './dto/get-plan.dto';
import { PageDto } from './dto/page.dto';

@Injectable()
export class PlanService {
    private numberOfPlansPerPage: number;

    constructor(private readonly repositoryInstance: MySQLRepository) {
        this.numberOfPlansPerPage = 50;
    }

    validatePage(current_page, total_page):number {
        return isNaN(current_page) || current_page <= 0 || current_page > total_page ? 1 : Number(current_page);
    }

    distinguishSupportive(plan) {
        const supportedProperties: string[] = [];
        const unsupportedProperties: string[] = [];

        if(plan.data_sharing === 1) {
            supportedProperties.push('data_sharing');
        } else {
            unsupportedProperties.push('data_sharing');
        }

        if(plan.micropayment === 1) {
            supportedProperties.push('micropayment');
        } else {
            unsupportedProperties.push('micropayment');
        }

        if(plan.roaming === 1) {
            supportedProperties.push('roaming');
        } else {
            unsupportedProperties.push('roaming');
        }

        return {
            isSupported: supportedProperties,
            isUnsupported: unsupportedProperties,
        };
    }

    async getNumberOfPlans() {
        const sql = `SELECT COUNT(plan_id) AS num FROM Plans`;
        const [ numberOfPlans ] = await this.repositoryInstance.executeQuery(sql);
        return numberOfPlans.num;
    }

    async getPageObject(current_page) {
        const numberOfPlansPerPage = this.numberOfPlansPerPage
        const numberOfPlans = await this.getNumberOfPlans();
        const maxDisplayedPages = 10;
        const total_page = Math.ceil(numberOfPlans/numberOfPlansPerPage);
        current_page = this.validatePage(current_page, total_page);
        const startIndex = (current_page-1)*numberOfPlansPerPage;
        const endIndex = current_page===total_page ? numberOfPlans-1 : current_page*numberOfPlansPerPage-1;

        const offset = Math.floor((maxDisplayedPages-1) / 2);
        let startPage = current_page - offset;
        let endPage = current_page + offset;
        startPage = startPage<1 ? 1 : startPage;
        endPage = endPage>total_page ? total_page : endPage;

        if(endPage-startPage+1 < maxDisplayedPages) {
            startPage = Math.max(1, endPage-maxDisplayedPages+1);
        }

        return {  
            numberOfPlans,
            numberOfPlansPerPage,
            maxDisplayedPages,
            startIndex,
            endIndex,
            startPage,
            current_page,
            endPage,
        };
    }

    async getPlans(pageObject: PageDto): Promise<[GetPlanDto]> {
        const sql = `SELECT 
        Carriers.carrier_logo, 
        Plans.plan_id, 
        Plans.carrier, 
        Plans.plan_title, 
        Plans.monthly_data, 
        Plans.daily_data, 
        Plans.postExhaustedDataSpeed, 
        Plans.voice, 
        Plans.SMS, 
        Plans.network, 
        Plans.parent_carrier, 
        Plans.original_price, 
        Plans.discount_period, 
        Plans.discounted_price 
    FROM 
        Carriers 
    INNER JOIN 
        Plans ON Carriers.carrier = Plans.carrier 
    ORDER BY 
        Plans.plan_id DESC LIMIT ? OFFSET ?;
    `;

        // limit: 추출하고 싶은 데이터의 갯수
        const limit = pageObject.endIndex-pageObject.startIndex+1;
        // offset: offset 만큼 자르고 시작. ex) offset->3: 3개는 제외하고 다음거부터 시작.
        const offset = pageObject.startIndex===0 ? 0 : pageObject.startIndex;
        const values = [ limit, offset ];

        const plans = await this.repositoryInstance.executeQuery(sql, values);
        return plans;
    }

    async getDetail(plan_id): Promise<GetPlanDto> {
        const sql = `SELECT plan_id, carrier, plan_title, monthly_data, daily_data, postExhaustedDataSpeed, requirement, contract_period, eSIM, sim_delivery, nfc_delivery, data_sharing, roaming, micropayment, authentication_method, underage_registration, foreigner_registration, transfer_charge, voice, SMS, network, original_price, discount_period, discounted_price, parent_carrier, addition_call FROM Plans WHERE plan_id = ?;`;
        const values = [ plan_id ];
        const plan: GetPlanDto = await this.repositoryInstance.executeQuery(sql, values);
        return plan[0];
    }

}
