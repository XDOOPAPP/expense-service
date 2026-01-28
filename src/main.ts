import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'expense_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Global exception filter for RPC
  app.useGlobalFilters(new RpcExceptionFilter());

  // Global interceptor for response transformation
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.startAllMicroservices();
  const port = process.env.PORT || 3010;
  await app.listen(port);
  console.log(
    `🚀 Expense Microservice is listening on RabbitMQ queue: expense_queue`,
  );
  console.log(`🚀 Expense Hybrid Service is listening on HTTP port: ${port}`);
}
bootstrap();
