# 🚀 Backend API - Maestro Digital

Backend Nest.js para el sistema de diagnóstico inteligente.

## 📋 Requisitos

- Node.js 20.x o superior
- Supabase (URL, Anon Key, Service Role Key)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de Supabase
```

## ⚙️ Configuración

Edita el archivo `.env` con tus credenciales:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3000
CORS_ORIGIN=http://localhost:4321
```

## 🚀 Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📡 Endpoints

### Diagnósticos

- `POST /api/diagnostic` - Crear diagnóstico
- `GET /api/diagnostic/:id` - Obtener diagnóstico
- `GET /api/diagnostic/:id/result` - Obtener resultado procesado
- `GET /api/diagnostic` - Listar diagnósticos (con paginación)
- `PUT /api/diagnostic/:id/status` - Actualizar estado

### Soluciones

- `GET /api/solutions` - Listar todas las soluciones

### Clientes

- `GET /api/clients` - Listar clientes (con paginación)

### Auth

- `GET /api/auth/verify` - Verificar token

## 📊 Base de Datos

Asegúrate de tener las tablas creadas en Supabase según `ARQUITECTURA_SISTEMA_DIAGNOSTICO.md`.

## 🔒 Seguridad

- Usa Service Role Key solo en el backend
- Nunca expongas Service Role Key en el frontend
- Implementa autenticación para endpoints administrativos


