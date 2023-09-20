import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';
import * as path from 'path'; 


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Set the static file serving.
  app.use('/public', express.static(path.join(__dirname, '../..', 'public')));

  app.enableCors();

  await app.listen(3001);
}
bootstrap();
