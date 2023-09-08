/**
 * get-detail.dto.ts
 */

export class GetDetailDto {
    thread_id: string;
    video_price: string; // 이거 맞나?
    addition_call_price: number;
    long_message_price: number;
    long_photo_message_price: number;
    requirement: string;
    contract_period: number;
    addition_call: number;
    eSIM: boolean;
    sim_delivery: boolean;
    nfc_delivery: boolean;
    data_sharing: boolean;
    roaming: boolean;
    micropayment: boolean;
    authentication_method: string;
    underage_registration: boolean;
    foreigner_registration: boolean;
    transfer_charge: number;
    detail_url: string;

    constructor(partial: Partial<GetDetailDto>) {
        Object.assign(this, partial);
    }
}