# 🏗️ ANÁLISIS ARQUITECTÓNICO: SISTEMA DE DIAGNÓSTICO

## 📊 DIAGNÓSTICO DEL PROBLEMA

### 🔴 **Problema Principal: Desconexión Frontend-Backend**

El sistema actual tiene **dos endpoints API independientes** que no se comunican:

1. **Frontend (Astro)**: `src/pages/api/diagnostico.ts`
   - Procesa el diagnóstico localmente
   - Intenta guardar directamente en Supabase desde el frontend
   - Tiene problemas con el body del POST (request.body es null)
   - No genera un ID persistente del diagnóstico

2. **Backend (Nest.js)**: `backend/src/modules/diagnostic/`
   - Tiene la lógica completa de procesamiento
   - Guarda correctamente en Supabase
   - Genera IDs únicos
   - **NO está siendo usado por el frontend**

### 🔴 **Problemas Específicos Identificados**

#### 1. **Flujo Roto**
```
❌ ACTUAL (ROTO):
Frontend (Astro) 
  → /api/diagnostico (endpoint Astro)
  → Procesa localmente
  → Intenta guardar en Supabase (falla)
  → Redirige a /diagnostico/resultado?params...
  → Página estática intenta leer params (falla)
```

#### 2. **Página de Resultado Estática**
- `src/pages/diagnostico/resultado.astro` es una página **estática**
- Intenta leer parámetros de la URL
- No tiene acceso a un ID persistente del diagnóstico
- Si el usuario recarga, pierde el resultado

#### 3. **Falta de Página Dinámica**
- No existe `src/pages/diagnostico/[id].astro`
- No hay forma de acceder a un diagnóstico guardado por ID
- No hay persistencia real del resultado

#### 4. **Duplicación de Lógica**
- `diagnosticEngine.ts` existe en:
  - `src/utils/diagnosticEngine.ts` (frontend)
  - `backend/diagnostic-engine.ts` (backend)
- Misma lógica en dos lugares = mantenimiento duplicado

---

## 🎯 FLUJO CORRECTO PROPUESTO

### **Diagrama Mental del Flujo**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Astro)                          │
│                                                              │
│  1. Usuario completa wizard                                 │
│     └─> DiagnosticWizard.astro                              │
│                                                              │
│  2. Envía respuestas                                        │
│     └─> POST /api/backend/diagnostic                        │
│         (llama al backend Nest.js)                          │
│                                                              │
│  3. Recibe respuesta con ID                                 │
│     └─> { success: true, data: { id: "uuid-123" } }        │
│                                                              │
│  4. Redirige a página dinámica                              │
│     └─> window.location = `/diagnostico/${id}`              │
│                                                              │
│  5. Página dinámica obtiene diagnóstico                     │
│     └─> GET /api/backend/diagnostic/${id}                  │
│                                                              │
│  6. Renderiza resultado personalizado                       │
│     └─> [id].astro                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Nest.js)                           │
│                                                              │
│  POST /api/diagnostic                                       │
│  └─> DiagnosticController.createDiagnostic()                │
│      └─> DiagnosticService.createDiagnostic()               │
│          ├─> processDiagnostic() (motor de decisión)        │
│          ├─> Guarda en Supabase                             │
│          └─> Retorna { id, result, ... }                    │
│                                                              │
│  GET /api/diagnostic/:id                                    │
│  └─> DiagnosticController.getDiagnostic()                    │
│      └─> DiagnosticService.getDiagnosticById()              │
│          ├─> Lee de Supabase                                │
│          ├─> Re-procesa resultado                           │
│          └─> Retorna { id, result, ... }                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                    │
│                                                              │
│  Tabla: diagnosticos                                        │
│  ├─> id (UUID, PK)                                          │
│  ├─> nombre, email, empresa                                 │
│  ├─> tipo_empresa, nivel_digital, objetivos               │
│  ├─> solucion_principal, soluciones_complementarias        │
│  ├─> urgencia, match_score                                  │
│  └─> created_at, estado                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 SOLUCIÓN PROPUESTA

### **Paso 1: Configurar Backend Nest.js**

#### 1.1 Verificar que el backend esté corriendo
```bash
cd backend
npm install
npm run start:dev
# Debe estar en http://localhost:3000
```

#### 1.2 Configurar CORS en Nest.js
El backend debe aceptar peticiones del frontend Astro.

**Archivo**: `backend/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir peticiones del frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4322',
    credentials: true,
  });
  
  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

### **Paso 2: Modificar Frontend para Usar Backend**

#### 2.1 Eliminar endpoint Astro (o mantenerlo como fallback)
**Archivo**: `src/pages/api/diagnostico.ts`
- Opción A: Eliminarlo completamente
- Opción B: Mantenerlo como fallback si el backend no está disponible

#### 2.2 Crear cliente API para el backend
**Archivo**: `src/utils/backendClient.ts` (NUEVO)
```typescript
const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface DiagnosticRequest {
  tipoEmpresa: string;
  nivelDigital: string;
  objetivos: string[];
  tamano: string;
  necesidadesAdicionales?: string[];
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
}

export interface DiagnosticResponse {
  success: boolean;
  data: {
    id: string;
    created_at: string;
    // ... otros campos
  };
}

export async function createDiagnostic(
  data: DiagnosticRequest
): Promise<DiagnosticResponse> {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getDiagnostic(id: string): Promise<DiagnosticResponse> {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}`);

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}
```

#### 2.3 Modificar DiagnosticWizard para usar backend
**Archivo**: `src/components/DiagnosticWizard.astro`

```typescript
// En la función showResultStep()
async function showResultStep() {
  // Normalizar respuestas al formato del backend
  const diagnosticData = {
    tipoEmpresa: answers[1],
    nivelDigital: answers[2],
    objetivos: Array.isArray(answers[3]) ? answers[3] : [answers[3]],
    tamano: answers[4],
    necesidadesAdicionales: answers[5] || [],
    nombre: contactInfo.name || undefined,
    empresa: contactInfo.company || undefined,
  };

  try {
    // Llamar al backend Nest.js
    const response = await createDiagnostic(diagnosticData);
    
    if (response.success && response.data.id) {
      // Redirigir a la página dinámica con el ID
      window.location.href = `/diagnostico/${response.data.id}`;
    } else {
      throw new Error('No se recibió ID del diagnóstico');
    }
  } catch (error) {
    console.error('Error creando diagnóstico:', error);
    // Fallback: mostrar error o redirigir a página de error
    alert('Error al procesar el diagnóstico. Por favor, intenta de nuevo.');
  }
}
```

### **Paso 3: Crear Página Dinámica de Resultado**

#### 3.1 Crear página dinámica `[id].astro`
**Archivo**: `src/pages/diagnostico/[id].astro` (NUEVO)

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getDiagnostic } from '../../utils/backendClient';

interface Props {
  id: string;
}

// En Astro, los parámetros dinámicos vienen en Astro.params
const { id } = Astro.params;

let diagnostic = null;
let error = null;

try {
  const response = await getDiagnostic(id);
  if (response.success) {
    diagnostic = response.data;
  }
} catch (e) {
  error = e.message;
}
---

<Layout 
  title={`Diagnóstico ${id} | Maestro Digital`}
  description="Resultado de tu diagnóstico estratégico."
>
  {error ? (
    <div class="error-container">
      <h1>Error al cargar el diagnóstico</h1>
      <p>{error}</p>
      <a href="/">Volver al inicio</a>
    </div>
  ) : diagnostic ? (
    <div class="diagnostic-result">
      <!-- Renderizar resultado usando diagnostic -->
      <h1>{diagnostic.solucion_principal}</h1>
      <!-- ... resto del resultado ... -->
    </div>
  ) : (
    <div class="loading">Cargando...</div>
  )}
</Layout>
```

### **Paso 4: Actualizar DTOs del Backend**

#### 4.1 Verificar DTO de creación
**Archivo**: `backend/src/modules/diagnostic/dto/create-diagnostic.dto.ts`

Debe aceptar los campos que envía el frontend:
```typescript
export class CreateDiagnosticDto {
  tipoEmpresa: string;
  nivelDigital: string;
  objetivos: string[];
  tamano: string;
  necesidadesAdicionales?: string[];
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
  ipAddress?: string;
  userAgent?: string;
}
```

### **Paso 5: Configurar Variables de Entorno**

#### 5.1 Frontend (`.env.local`)
```env
PUBLIC_BACKEND_URL=http://localhost:3000
```

#### 5.2 Backend (`.env`)
```env
FRONTEND_URL=http://localhost:4322
PORT=3000
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Backend (Nest.js)**
- [ ] Verificar que el backend esté corriendo en `http://localhost:3000`
- [ ] Configurar CORS en `main.ts`
- [ ] Verificar que el endpoint `POST /api/diagnostic` funcione
- [ ] Verificar que el endpoint `GET /api/diagnostic/:id` funcione
- [ ] Probar con Postman/Thunder Client

### **Fase 2: Frontend (Astro)**
- [ ] Crear `src/utils/backendClient.ts`
- [ ] Modificar `DiagnosticWizard.astro` para usar backend
- [ ] Crear `src/pages/diagnostico/[id].astro`
- [ ] Eliminar o deshabilitar `src/pages/api/diagnostico.ts`
- [ ] Eliminar `src/pages/diagnostico/resultado.astro` (o mantener como fallback)

### **Fase 3: Integración**
- [ ] Probar flujo completo: Wizard → Backend → Supabase → Página dinámica
- [ ] Verificar que el diagnóstico se guarde en Supabase
- [ ] Verificar que la página dinámica cargue correctamente
- [ ] Probar recarga de página (debe seguir funcionando con el ID)

### **Fase 4: Limpieza**
- [ ] Eliminar duplicación de `diagnosticEngine.ts` (usar solo el del backend)
- [ ] Eliminar código no usado
- [ ] Documentar el flujo completo

---

## 🎓 DECISIONES DE ARQUITECTURA

### **1. ¿Por qué usar el backend Nest.js en lugar del endpoint Astro?**

**Razones:**
- **Separación de responsabilidades**: El backend maneja lógica de negocio, el frontend solo presenta
- **Seguridad**: Las claves de Supabase no se exponen al cliente
- **Escalabilidad**: El backend puede manejar más carga y lógica compleja
- **Mantenibilidad**: Una sola fuente de verdad para la lógica de diagnóstico
- **Reutilización**: El backend puede ser usado por otros clientes (móvil, admin, etc.)

### **2. ¿Por qué página dinámica `[id].astro` en lugar de estática?**

**Razones:**
- **Persistencia**: El resultado se puede acceder en cualquier momento con el ID
- **SEO**: URLs amigables como `/diagnostico/abc-123-def`
- **Compartibilidad**: Se puede compartir el link del resultado
- **Recuperación**: Si el usuario recarga, no pierde el resultado

### **3. ¿Por qué mantener el motor de diagnóstico solo en el backend?**

**Razones:**
- **Single Source of Truth**: Una sola implementación del motor
- **Mantenimiento**: Cambios en un solo lugar
- **Testing**: Más fácil de testear en el backend
- **Versionado**: El backend puede versionar la lógica del motor

---

## 🚨 PROBLEMAS ACTUALES Y SOLUCIONES

### **Problema 1: `request.body` es null en Astro**

**Causa**: Astro en modo estático tiene limitaciones con POST bodies.

**Solución**: Usar el backend Nest.js que maneja POST bodies correctamente.

### **Problema 2: No se genera página de resultados**

**Causa**: La página `resultado.astro` es estática y depende de parámetros de URL que se pierden.

**Solución**: Crear página dinámica `[id].astro` que obtiene el diagnóstico del backend usando el ID.

### **Problema 3: No se encuentra el diagnóstico del cliente**

**Causa**: No hay ID persistente, solo parámetros temporales en la URL.

**Solución**: El backend genera un ID único (UUID) y lo retorna. El frontend redirige a `/diagnostico/{id}`.

---

## 📝 CÓDIGO DE EJEMPLO

### **Ejemplo 1: Cliente Backend (Frontend)**

```typescript
// src/utils/backendClient.ts
const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function createDiagnostic(data: any) {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
```

### **Ejemplo 2: Página Dinámica (Frontend)**

```astro
---
// src/pages/diagnostico/[id].astro
import { getDiagnostic } from '../../utils/backendClient';

const { id } = Astro.params;
const response = await getDiagnostic(id);
const diagnostic = response.data;
---

<Layout>
  <h1>Diagnóstico: {diagnostic.solucion_principal}</h1>
  <!-- Renderizar resultado -->
</Layout>
```

### **Ejemplo 3: Modificación del Wizard (Frontend)**

```typescript
// En DiagnosticWizard.astro
async function showResultStep() {
  const diagnosticData = {
    tipoEmpresa: answers[1],
    nivelDigital: answers[2],
    objetivos: Array.isArray(answers[3]) ? answers[3] : [answers[3]],
    tamano: answers[4],
    nombre: contactInfo.name,
    empresa: contactInfo.company,
  };

  const response = await createDiagnostic(diagnosticData);
  window.location.href = `/diagnostico/${response.data.id}`;
}
```

---

## ✅ CONCLUSIÓN

El problema principal es que **el frontend no está usando el backend**. La solución es:

1. **Conectar el frontend con el backend Nest.js**
2. **Usar el ID generado por el backend para crear páginas dinámicas**
3. **Eliminar la duplicación de lógica**

Esto resuelve todos los problemas actuales y crea una arquitectura escalable y mantenible.


