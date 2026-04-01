import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as fs from 'fs';

async function bootstrap() {
  let app;
  const stage = process.env.STAGE || 'local';

  // SSL/HTTPS Configuration
  if (
    process.env.STAGE === 'local' ||
    !process.env.SSL_KEY_PATH ||
    !process.env.SSL_CERT_PATH
  ) {
    app = await NestFactory.create(AppModule, { rawBody: true });
  } else {
    try {
      const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      };
      app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
      });
    } catch (error) {
      console.error('Error loading SSL certificates, falling back to HTTP:', error.message);
      app = await NestFactory.create(AppModule, { rawBody: true });
    }
  }

  // Global prefix with dynamic stage
  app.setGlobalPrefix(`api/v1/${stage}`);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS Configuration
  app.enableCors({ origin: process.env.APP_URL || '*' });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('PrizeBond Backend API')
    .setDescription('API documentation for PrizeBond Backend')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 PrizeBond Backend running on http://localhost:${port}/api/v1/${stage}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
