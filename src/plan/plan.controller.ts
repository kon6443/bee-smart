import { Req, Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
// import { Request } from 'express';
import { PlanService } from './plan.service';

import { GetThreadDto } from './dto/get-thread.dto';
import { GetDetailDto } from './dto/get-detail.dto';
import { PageDto } from './dto/page.dto';

@Controller('plans')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get()
    async handleGetPlans(@Query('page') page = 1): Promise<{ pageObject: PageDto, threads: GetThreadDto[]}> {
        try {
            const { pageObject, threads }: { pageObject: PageDto, threads: GetThreadDto[]} = await this.planService.getPlans(page);
            return { pageObject, threads }; 
        } catch(err) {
            throw new Error(err);
        }
    }

    @Get(':id')
    async handleGetDetail(@Param('id') id): Promise<GetDetailDto> {
        try {
            const detail: GetDetailDto = await this.planService.getDetail(id);
            return detail;
        } catch(err) {
            throw new Error(err);
        }
    }

}
