import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors();

  // Augmente la limite des requêtes JSON/form
  app.use(
    express.json({ limit: '10mb' }),
    express.urlencoded({ limit: '10mb', extended: true })
  );

  // Sert les fichiers statiques (ex. uploads/attestations)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
