import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CORS configuration
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5175'], 
    credentials: true,
  });

  app.use('/pdfs', express.static(join(__dirname, '..', 'pdfs')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
