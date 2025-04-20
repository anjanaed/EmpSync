import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors({
    origin: 'http://localhost:5173', // React dev server
    credentials: true,
  });



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
