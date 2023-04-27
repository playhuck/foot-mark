import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/global.exception';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
