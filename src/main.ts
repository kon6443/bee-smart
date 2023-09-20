import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';
import * as path from 'path'; 


async function bootstrap() {

  const app = await NestFactory.create(AppModule, {cors:true});

  // Set the static file serving.
  app.use('/public', express.static(path.join(__dirname, '../..', 'public')));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  // app.enableCors(
  //   credentials: true,
  // );

  await app.listen(3001);
}
bootstrap();
