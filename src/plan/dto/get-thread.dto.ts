/**
 * get-thread.dto.ts
 */

export class GetThreadDto {
    thread_id: number; 
    carrier_logo: string;
    plan_title: string;
    monthly_data: string;
    daily_data: string;
    postExhaustedDataSpeed: string;
    call: string; 
    short_message: string;
    carrier: string;
    network: string;
    original_price: number;
    discount_period: number;
    discounted_price: number;

    constructor(partial: Partial<GetThreadDto>) {
        Object.assign(this, partial);
    }
}