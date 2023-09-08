import { NestFactory } from '@nestjs/core';
// import { CorsModule } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
