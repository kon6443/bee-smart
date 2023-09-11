/**
 * get-plan.dto.ts
 */

export class GetPlanDto {

    plan_id: string;
    carrier: string;
    plan_title: string;
    monthly_data: string;
    daily_data: string;
    postExhaustedDataSpeed: number;
    requirement: string;
    contract_period: number;
    eSIM: boolean;
    sim_delivery: boolean;
    nfc_delivery: boolean; 
    data_sharing: number;
    roaming: boolean;
    micropayment: boolean;
    authentication_method: string; 
    underage_registration: boolean;
    foreigner_registration: boolean;
    transfer_charge: number;
    detail_url: string;
    voice: string;
    SMS: string;
    network: string;
    original_price: number;
    discount_period: number;
    discounted_price: number;
    parent_carrier: string;
    addition_call: string;

    constructor(partial: Partial<GetPlanDto>) {
        Object.assign(this, partial);
    }
}