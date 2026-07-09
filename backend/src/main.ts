import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  });

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MediStock API')
    .setDescription('Hospital Inventory Management System API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autentikasi pengguna')
    .addTag('Dashboard', 'Data dashboard')
    .addTag('Categories', 'Manajemen kategori')
    .addTag('Suppliers', 'Manajemen supplier')
    .addTag('Products', 'Manajemen produk')
    .addTag('Inventory', 'Stok masuk & keluar')
    .addTag('Stock Movements', 'Riwayat pergerakan stok')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 MediStock API berjalan di http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
