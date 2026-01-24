# 📦 Guía de Instalación - Backend Nest.js

## ✅ Estructura Creada

El backend Nest.js ha sido creado con la siguiente estructura:

```
backend/
├── src/
│   ├── modules/
│   │   ├── diagnostic/      # Módulo de diagnósticos
│   │   ├── solutions/       # Módulo de soluciones
│   │   ├── clients/         # Módulo de clientes
│   │   └── auth/            # Módulo de autenticación
│   ├── common/
│   │   └── supabase/        # Servicio de Supabase
│   ├── app.module.ts        # Módulo principal
│   └── main.ts              # Punto de entrada
├── diagnostic-engine.ts     # Motor de decisión
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Pasos para Configurar

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4321
```

### 3. Crear Tablas en Supabase

Ejecuta el SQL del archivo `ARQUITECTURA_SISTEMA_DIAGNOSTICO.md` en tu proyecto de Supabase.

### 4. Ejecutar el Backend

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📡 Endpoints Disponibles

### Diagnósticos
- `POST /api/diagnostic` - Crear diagnóstico
- `GET /api/diagnostic/:id` - Obtener diagnóstico
- `GET /api/diagnostic/:id/result` - Obtener resultado procesado
- `GET /api/diagnostic?page=1&limit=20` - Listar diagnósticos
- `PUT /api/diagnostic/:id/status` - Actualizar estado

### Soluciones
- `GET /api/solutions` - Listar todas las soluciones

### Clientes
- `GET /api/clients?page=1&limit=20` - Listar clientes

### Auth
- `GET /api/auth/verify` - Verificar token

## 🔧 Próximos Pasos

1. **Conectar Frontend**: Actualizar `DiagnosticWizard.astro` para enviar datos al backend
2. **Crear Panel Admin**: Implementar Next.js para gestión administrativa
3. **Testing**: Agregar tests unitarios y e2e
4. **Deploy**: Configurar para producción

## ⚠️ Notas Importantes

- El backend usa el motor de decisión copiado en `diagnostic-engine.ts`
- En producción, considera mover el motor a un paquete compartido
- El Service Role Key solo debe usarse en el backend, nunca en el frontend
- Configura CORS correctamente para producción




