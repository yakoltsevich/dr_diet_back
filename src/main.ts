import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // ✅

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ✅ ← вот это ключ

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Dr Diet App API')
    .setDescription('Документация API для Dr Diet App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
