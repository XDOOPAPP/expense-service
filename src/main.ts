import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // Create Hybrid Application (HTTP + Microservices)
  const app = await NestFactory.create(AppModule);

  // Connect microservice for expense_queue (API requests from gateway)
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

  // Connect microservice for ocr_events (OCR completed events)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'ocr_events',
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

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server (if needed for health checks, etc.)
  const port = process.env.PORT || 3010;
  await app.listen(port);

  console.log('🚀 Expense Microservice is listening on:');
  console.log('   - RabbitMQ queue: expense_queue (API requests from gateway)');
  console.log('   - RabbitMQ queue: ocr_events (OCR completed events)');
  console.log(`   - HTTP port: ${port} (health checks, metrics)`);
}
bootstrap();
