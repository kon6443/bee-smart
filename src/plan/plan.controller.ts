import { Req, Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
// import { Request } from 'express';
import { PlanService } from './plan.service';

import { GetPlanDto } from './dto/get-plan.dto';
import { PageDto } from './dto/page.dto';

@Controller('plans')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get()
    // async handleGetPlans(@Query('page') page = 1): Promise<{ pageObject: PageDto, plans: GetThreadDto[]}> {
    async handleGetPlans(@Query('page') page = 1): Promise<any> {
        try {
            const pageObject: PageDto = await this.planService.getPageObject(page);
            console.log(pageObject);
            const plans: GetPlanDto[] = await this.planService.getPlans(pageObject);

            return { pageObject, plans };
        } catch(err) {
            throw new Error(err);
        }
    }

    @Get(':id')
    async handleGetDetail(@Param('id') id): Promise<{additional_service: any, plan: GetPlanDto }> {
        try {
            const plan: GetPlanDto = await this.planService.getDetail(id);
            const additional_service = this.planService.distinguishSupportive(plan);
            return { additional_service, plan };
        } catch(err) {
            throw new Error(err);
        }
    }


}
