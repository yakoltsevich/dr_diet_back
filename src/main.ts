import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // разреши фронту доступ
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter()); // <-- глобально

  const config = new DocumentBuilder()
    .setTitle('Dr Diet App API')
    .setDescription('Документация API для Dr Diet App')
    .setVersion('1.0')
    .addBearerAuth() // Добавляем поддержку Authorization: Bearer токена
    .build();

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Документация будет доступна на /api
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
