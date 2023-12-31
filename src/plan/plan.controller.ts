import { Req, Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PlanService } from './plan.service';

import { GetPlanDto } from './dto/get-plan.dto';
import { PageDto } from './dto/page.dto';

@Controller('plans')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get()
    async handleGetPlans(@Query('page') page = 1, @Query('items-per-page') itemsPerPage = 50): Promise<any> {
        try {
            const pageObject: PageDto = await this.planService.getPageObject(page, itemsPerPage);
            const plans: GetPlanDto[] = await this.planService.getPlans(pageObject);
            return { pageObject, plans };
        } catch(err) {
            throw new Error(err);
        }
    }

    @Get(':id')
    async handleGetDetail(@Param('id') id): Promise<{ numberOfUser: number, additional_service: any, plan: GetPlanDto }> {
        try {
            const plan: GetPlanDto = await this.planService.getDetail(id);
            const additional_service = this.planService.distinguishSupportive(plan);
            const numberOfUser = this.planService.getRandomNumber(10000, 50000);
            return { numberOfUser, additional_service, plan };
        } catch(err) {
            throw new Error(err);
        }
    }

    @Get('admin/insertion/:carrier')
    async handlePostPlans(@Param('carrier') carrier, @Query('password') password) {
        try {
            if(password!=999999) return `Invalid request.`;
            const plans = await this.planService.getJsonObject(carrier);
            const res = this.planService.insertPlans(plans);
            return res;
        } catch(err) {
            throw new Error(err);
        }
    }

}
