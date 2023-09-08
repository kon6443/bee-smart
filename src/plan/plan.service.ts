import { Injectable } from '@nestjs/common';
import { MySQLRepository } from '../shared/mysql.repository';

import { GetThreadDto } from './dto/get-thread.dto';
import { GetDetailDto } from './dto/get-detail.dto';

import { PageDto } from './dto/page.dto';

@Injectable()
export class PlanService {
    private numberOfPlans: number;
    private numberOfPlansPerPage: number;

    constructor(private readonly repositoryInstance: MySQLRepository) {
        this.numberOfPlansPerPage = 50;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        this.numberOfPlans = await this.getNumberOfPlans();
    }

    // Validating page query. 
    validatePage(current_page, total_page):number {
        return isNaN(current_page) || current_page <= 0 || current_page > total_page ? 1 : Number(current_page);
    }

    getPageObject(numberOfPlans, current_page, numberOfPlansPerPage) {
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

        return { numberOfPlans, 
            numberOfPlansPerPage, 
            maxDisplayedPages, 
            startIndex, 
            endIndex, 
            startPage, 
            current_page, 
            endPage, 
            pagination: {   // Add this 'pagination' property
                numberOfPlans,
                numberOfPlansPerPage,
                maxDisplayedPages,
                startIndex,
                endIndex,
                startPage,
                current_page,
                endPage,
            }};
    }

    async getNumberOfPlans() {
        const sql = `SELECT COUNT(thread_id) AS num FROM Threads`;
        const [ numberOfPlans ] = await this.repositoryInstance.executeQuery(sql);
        return numberOfPlans.num;
    }

    async getThreads(startIndex, endIndex): Promise<[GetThreadDto]> {
        const sql = `SELECT * FROM Threads ORDER BY thread_id DESC LIMIT ? OFFSET ?;`;
        // limit: 추출하고 싶은 데이터의 갯수
        const limit = endIndex-startIndex+1;
        // offset: offset 만큼 자르고 시작. ex) offset->3: 3개는 제외하고 다음거부터 시작.
        const offset = startIndex===0 ? 0 : startIndex;

        const values = [ limit, offset ];
        const threads = await this.repositoryInstance.executeQuery(sql, values);
        return threads;
    }

    async getPlans(current_page): Promise<{ pageObject: PageDto, threads: GetThreadDto[]}> {
        const pageObject: PageDto = this.getPageObject(this.numberOfPlans, current_page, this.numberOfPlansPerPage);
        // 부분적으로 데이터 패칭후 해당되는 전체 개수도 추가로 구해두면 페이지네이션 할 때 도움됨.
        // 고민해 볼 것.
        const threads: GetThreadDto[] = await this.getThreads(pageObject.startIndex, pageObject.endIndex);
        return { pageObject, threads };
    }

    async getDetail(thread_id): Promise<GetDetailDto> {
        const sql = `SELECT * FROM Details WHERE thread_id = ?;`;
        const values = [ thread_id ];
        const detail: GetDetailDto = await this.repositoryInstance.executeQuery(sql, values);
        return detail;
    }

}
