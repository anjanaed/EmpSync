import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CORS configuration
app.enableCors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
});
  app.setGlobalPrefix('api');
  app.use('/pdfs', express.static(join(__dirname, '..', 'pdfs')));

	await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
