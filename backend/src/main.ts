import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AppModule } from './app.module';

const BODY_LIMIT = '20mb';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(express.json({ limit: BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

  // CORS: middleware que pone cabeceras en TODAS las respuestas (incl. 500)
  // Así el admin en Vercel puede ver errores aunque el backend falle
  app.use((req: any, res: any, next: () => void) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Obtener configuración
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

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

  // Ruta de salud para verificar que el servidor está funcionando
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Maestro Digital Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        diagnostic: '/api/diagnostic',
        solutionTemplates: '/api/solution-templates',
        solutionModules: '/api/solution-modules',
        orders: '/api/orders',
        clients: '/api/clients',
        auth: '/api/auth',
      },
      docs: 'All endpoints are under /api prefix',
    });
  });

  // Ruta de salud en /api también
  app.getHttpAdapter().get('/api', (req, res) => {
    res.json({
      message: 'Maestro Digital Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        diagnostic: '/api/diagnostic',
        solutionTemplates: '/api/solution-templates',
        solutionModules: '/api/solution-modules',
        orders: '/api/orders',
        clients: '/api/clients',
        auth: '/api/auth',
      },
    });
  });

  await app.listen(port);
  console.log(`🚀 Backend API running on: http://localhost:${port}/api`);
  console.log(`📋 Health check: http://localhost:${port}/`);
}

bootstrap();

