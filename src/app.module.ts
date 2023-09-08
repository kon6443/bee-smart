import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanModule } from './plan/plan.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [PlanModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
