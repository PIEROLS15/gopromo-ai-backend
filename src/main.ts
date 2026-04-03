import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const origins = process.env.CORS
    ? process.env.CORS.split(',')
    : 'http://localhost:3000';

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = {};

        errors.forEach((error) => {
          formattedErrors[error.property] = Object.values(
            error.constraints || {},
          );
        });

        return new BadRequestException({
          status: 'error',
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  const openApiPath = join(
    process.cwd(),
    'docs',
    'openapi',
    'tour-packages.openapi.json',
  );
  const openApiSpec = JSON.parse(readFileSync(openApiPath, 'utf-8')) as Record<
    string,
    unknown
  >;

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  expressApp.get('/api/docs-json', (_req, res) => {
    res.json(openApiSpec);
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
