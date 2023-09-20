import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     // Allow CORS for all routes
//     consumer.apply(cors()).forRoutes({
//       path: '*',
//       method: RequestMethod.ALL, // Allow all HTTP methods
//       credentials: true,
//     });
//   }
// }
