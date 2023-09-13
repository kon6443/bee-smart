import { Injectable } from '@nestjs/common';
import { MySQLRepository } from '../shared/mysql.repository';

import { GetPlanDto } from './dto/get-plan.dto';
import { PageDto } from './dto/page.dto';

import { join } from 'path';
// import * as fs from 'fs';
import { promises as fsPromises } from 'fs'; // Use fs.promises for promise-based operations


@Injectable()
export class PlanService {
    private numberOfPlansPerPage: number;

    constructor(private readonly repositoryInstance: MySQLRepository) {
        this.numberOfPlansPerPage = 50;
    }

    validatePage(current_page, total_page):number {
        return isNaN(current_page) || current_page <= 0 || current_page > total_page ? 1 : Number(current_page);
    }

    validateItemsPerPage(itemsPerPage) {
        return isNaN(itemsPerPage) || itemsPerPage<=0 ? 50 : Number(itemsPerPage);
    }

    distinguishSupportive(plan) {
        const supportedProperties: string[] = [];
        const unsupportedProperties: string[] = [];
        const list = ['data_sharing', 'micropayment', 'roaming', 'family_combination', 'mobile_hotSpot'];

        for(let i=0;i<list.length;i++) {
            if(plan[list[i]]===1) {
                supportedProperties.push(list[i]);
            } else {
                unsupportedProperties.push(list[i]);
            }
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

    async getPageObject(current_page, itemsPerPage) {
        itemsPerPage = this.validateItemsPerPage(itemsPerPage);
        // const numberOfPlansPerPage = this.numberOfPlansPerPage;
        const numberOfPlansPerPage = itemsPerPage;
        const numberOfPlans = await this.getNumberOfPlans();
        const maxDisplayedPages = 10;
        const total_page = Math.ceil(numberOfPlans/itemsPerPage);
        current_page = this.validatePage(current_page, total_page);
        const startIndex = (current_page-1)*itemsPerPage;
        const endIndex = current_page===total_page ? numberOfPlans-1 : current_page*itemsPerPage-1;

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

        let plans = await this.repositoryInstance.executeQuery(sql, values);
        for(let i=0;i<plans.length;i++) {
            plans[i]['starPoint'] = this.getStarPoint(1.0, 5.0);
            plans[i]['isAppliableHere'] = this.getRandomNumber(0,1);
        }
        return plans;
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random()*(max-min+1)) + min;
    }

    getStarPoint(min, max) {
        return {
            score: (Math.random() * (max - min) + min).toFixed(1),
            numberOfParticipants: this.getRandomNumber(0, 5000)
        };
    }

    async getDetail(plan_id): Promise<GetPlanDto> {
        // const sql = `SELECT plan_id, carrier, plan_title, monthly_data, daily_data, postExhaustedDataSpeed, requirement, contract_period, eSIM, sim_delivery, nfc_delivery, data_sharing, roaming, micropayment, authentication_method, underage_registration, foreigner_registration, transfer_charge, voice, SMS, network, original_price, discount_period, discounted_price, parent_carrier, addition_call FROM Plans WHERE plan_id = ?;`;
        const sql = `SELECT Plans.plan_id, Plans.carrier, Plans.plan_title, Plans.monthly_data, Plans.daily_data, Plans.postExhaustedDataSpeed, Plans.requirement, Plans.contract_period, Plans.eSIM, Plans.sim_delivery, Plans.nfc_delivery, Plans.data_sharing, Plans.roaming, Plans.micropayment, Plans.authentication_method, Plans.underage_registration, Plans.foreigner_registration, Plans.transfer_charge, Plans.voice, Plans.SMS, Plans.network, Plans.original_price, Plans.discount_period, Plans.discounted_price, Plans.parent_carrier, Plans.addition_call, ExceededPrice.data_price, ExceededPrice.call_price, ExceededPrice.video_price, ExceededPrice.SMS_price, ExceededPrice.LMS_price, ExceededPrice.MMS_text_price, ExceededPrice.MMS_image_price, ExceededPrice.MMS_video_price
        FROM ExceededPrice 
        INNER JOIN 
        Plans ON ExceededPrice.parent_carrier=Plans.parent_carrier
        WHERE Plans.plan_id = ?;`;
        const values = [ plan_id ];
        let plan: GetPlanDto = await this.repositoryInstance.executeQuery(sql, values);
        plan[0]['data_price'] = Number(plan[0]['data_price']);
        plan[0]['call_price'] = Number(plan[0]['call_price']);
        plan[0]['video_price'] = Number(plan[0]['video_price']);
        plan[0]['family_combination'] = this.getRandomNumber(0,1);
        plan[0]['mobile_hotSpot'] = this.getRandomNumber(0,1);
        return plan[0];
    }

    validatePlan(plans) {
        for(let i=0;i<plans.length;i++) {
            if(!plans[i]['addition_call']) plans[i]['addition_call'] = '-';
            if(!plans[i]['postExhaustedDataSpeed']) plans[i]['postExhaustedDataSpeed'] = 0;
            if(plans[i]['discount_period']==='평생할인') plans[i]['discount_period'] = 999999;
            if(!plans[i]['monthly_data']) plans[i]['monthly_data'] = 0;
            if(plans[i]['discount_period']==='계단식할인') plans[i]['discount_period'] = 456789;
            if(!plans[i]['original_price']) plans[i]['original_price'] = plans[i]['discounted_price'];
        }
        return plans;
    }

    async getJsonObject() {
        try {
            const filePath = join(__dirname,'..', '..', '..', 'src', 'plan', 'eyes.json');
            const data = await fsPromises.readFile(filePath, 'utf-8');
            let plans = JSON.parse(data);
            plans = this.validatePlan(plans);
            return plans;
        } catch(err) {
            throw new Error(`파일을 읽는데 문제가 발생했어요!: ${err.message}`);
        }
    }

    async insertPlans(plans) {
        const sql = `INSERT INTO Plans (
            carrier,
            plan_title,
            monthly_data,
            daily_data,
            postExhaustedDataSpeed,
            requirement,
            contract_period,
            eSIM,
            sim_delivery,
            nfc_delivery,
            data_sharing,
            roaming,
            micropayment,
            authentication_method,
            underage_registration,
            foreigner_registration,
            transfer_charge,
            detail_url,
            voice,
            SMS,
            network,
            original_price,
            discount_period,
            discounted_price,
            parent_carrier,
            addition_call
          )
          VALUES ?;`;
        // const values = [];
        const values = plans.map((plan) => [
            plan.carrier,
            plan.plan_title,
            plan.monthly_data,
            plan.daily_data,
            plan.postExhaustedDataSpeed,
            plan.requirement,
            plan.contract_period,
            plan.eSIM,
            plan.sim_delivery,
            plan.nfc_delivery,
            plan.data_sharing,
            plan.roaming,
            plan.micropayment,
            plan.authentication_method,
            plan.underage_registration,
            plan.foreigner_registration,
            plan.transfer_charge,
            plan.detail_url,
            plan.voice,
            plan.SMS,
            plan.network,
            plan.original_price,
            plan.discount_period,
            plan.discounted_price,
            plan.parent_carrier,
            plan.addition_call,
        ]);
        const res = await this.repositoryInstance.executeQuery(sql, [values]);
        return res;
    }

}
