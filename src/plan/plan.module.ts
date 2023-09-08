import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [PlanController],
  providers: [PlanService],
  imports: [SharedModule]
})
export class PlanModule {}
