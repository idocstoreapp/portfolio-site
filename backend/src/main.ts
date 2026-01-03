import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener configuración
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  // Permitir múltiples orígenes para desarrollo y producción
  const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:4322';
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

  // Habilitar CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Verificar si el origin está permitido
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        // En desarrollo, permitir localhost en cualquier puerto
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir campos adicionales para diagnosticos dinámicos
      transform: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: true, // Ignorar propiedades undefined
    }),
  );

  // Prefijo global para API
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`🚀 Backend API running on: http://localhost:${port}/api`);
}

bootstrap();

