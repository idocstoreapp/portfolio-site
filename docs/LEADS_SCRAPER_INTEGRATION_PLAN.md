# Plan de integración: Google Maps Scraper en backend NestJS

**Objetivo:** Integrar el scraper externo (prospect-agent) como módulo NestJS `modules/leads` sin romper módulos existentes, sin tocar proposal generator ni work orders.

**Origen del scraper:** `backend/prospect-agent/` (mapsScraper.js, parser.js, utils.js, runScrape.js).

---

## 1. Estado actual

### 1.1 Backend NestJS

- **Raíz:** `backend/src/`
- **Módulos:** diagnostic, solutions, clients, auth, solution-templates, solution-modules, orders, pricing-config, legal-templates, change-orders, pricing-calculator.
- **Compartido:** `common/supabase` (SupabaseModule, SupabaseService).
- **Registro:** `app.module.ts` importa todos los módulos; añadir `LeadsModule` no afecta a los demás.

### 1.2 Scraper (prospect-agent)

| Archivo        | Rol |
|----------------|-----|
| **runScrape.js** | CLI: `node runScrape.js "rubro" "ciudad" limite`. Construye query → llama scrapeMaps → parsePlaces → normaliza a `{ nombre, telefono, website, direccion, ciudad, rubro, score }` → stdout JSON. |
| **mapsScraper.js** | Puppeteer: `scrapeMaps(fullQuery, { minResults })` → abre Maps, scroll feed, abre cada tarjeta, extrae panel (nombre, dirección, teléfono, website, rating, etc.). Exporta `scrapeMaps`, `cleanWebsiteUrl`. |
| **parser.js**   | `parsePlace(raw)`, `parsePlaces(rawList)` → objeto normalizado (nombre, direccion, ciudad, telefono, website, categoria, etc.). Depende de `utils.GEO_DEFAULT`. |
| **utils.js**   | `GEO_DEFAULT`, `buildSearchQuery(query, comuna)`, `deduplicateByPhone`, `deduplicateByNameAndAddress`, `normalizeString`. |

**Dependencias:** `puppeteer`, `puppeteer-extra`, `puppeteer-extra-plugin-stealth` (en prospect-agent/package.json). El backend actual no las tiene.

### 1.3 Base de datos

- **Motor:** Supabase (Postgres).
- **Acceso:** `SupabaseService` (getClient / getAdminClient). Los módulos que escriben usan `getAdminClient()` para inserts.
- **Migraciones:** `backend/database/migrations/` (SQL). Convención: un archivo por cambio, con comentarios y `IF NOT EXISTS`.

**Tabla `leads` (pipeline de ventas + conversión; columnas listas para FKs futuros):**

| Campo           | Tipo         | Notas |
|-----------------|--------------|--------|
| id              | UUID         | PK, gen_random_uuid() |
| name            | TEXT         | Nombre del negocio (obligatorio) |
| phone           | TEXT         | Nullable |
| website         | TEXT         | Nullable |
| address         | TEXT         | Dirección (puede ser '') |
| city            | TEXT         | Ciudad |
| category        | TEXT         | Rubro/categoría |
| google_maps_url | TEXT         | Nullable |
| rating          | NUMERIC      | Nullable |
| reviews_count   | INT          | Nullable |
| score           | INT          | Nullable |
| status          | TEXT         | DEFAULT 'new'. Valores: new, contacted, replied, diagnostic_completed, proposal_sent, negotiating, won, lost, converted |
| source          | TEXT         | DEFAULT 'google_maps' |
| notes           | TEXT         | Nullable |
| last_contact_at | TIMESTAMPTZ  | Nullable |
| proposal_id     | UUID         | Nullable; futuro FK → proposals.id |
| diagnostic_id   | UUID         | Nullable; futuro FK → diagnosticos.id |
| client_id       | UUID         | Nullable; futuro FK → clientes.id |
| converted_at    | TIMESTAMPTZ  | Nullable; fecha de conversión a cliente |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW() |
| updated_at      | TIMESTAMPTZ  | DEFAULT NOW() |

**Deduplicación (a nivel aplicación):** por `phone` (si existe) o por `(name + address)` antes de insertar.

---

## 2. Arquitectura objetivo

### 2.1 Estructura de carpetas

```
backend/src/modules/leads/
├── leads.module.ts
├── leads.controller.ts
├── leads.service.ts
├── dto/
│   ├── scrape-leads.dto.ts   # DTO para POST /leads/scrape
│   └── lead.dto.ts           # Respuesta / tipo Lead (opcional)
└── scraper/
    ├── mapsScraper.js        # Copia/adaptación desde prospect-agent
    ├── parser.js
    ├── utils.js
    └── index.ts              # Re-exporta scrapeMaps + parsePlaces + buildSearchQuery (wrapper TS si hace falta)
```

- **No** se mueve `proposal-generator` ni nada que no sea scraper.
- Los archivos del scraper pueden quedarse en `.js` (Nest/Node los importa); si se prefiere TypeScript más adelante, se puede migrar en una segunda fase.

### 2.2 Flujo de datos

1. **Cliente** llama `POST /api/leads/scrape` con body:
   - `query` (rubro, ej. "servicio tecnico celulares")
   - `city` (ej. "Santiago")
   - `limit` (opcional, ej. 20; entre 5 y 50)

2. **LeadsController** valida body con `ScrapeLeadsDto`, llama `LeadsService.scrapeLeads(dto)`.

3. **LeadsService**:
   - Construye `fullQuery = buildSearchQuery(dto.query, dto.city)` (utils).
   - Llama `scrapeMaps(fullQuery, { minResults: dto.limit })` (mapsScraper).
   - `parsePlaces(results)` (parser).
   - Mapea a formato tabla: `name`, `phone`, `website`, `address`, `city`, `category`; `status = 'new'`.
   - Para cada item: comprueba duplicado por **phone** (si phone existe) o por **(name + address)** en Supabase.
   - Inserta en `leads` solo los no duplicados (usa `SupabaseService.getAdminClient()`).
   - Devuelve `{ created: number, skipped: number, total: number, leads: [...] }` (o similar).

4. **Deduplicación:**  
   - Opción A (recomendada): en servicio, antes de insertar, `SELECT` por `phone` (si not null) o por `LOWER(TRIM(name)) = ? AND LOWER(TRIM(address)) = ?`; si existe, skip.  
   - Opción B: constraint único en DB (UNIQUE(phone)) y UNIQUE(name, address) — más rígido (nulls y espacios). La opción A es más flexible para "casi duplicados".

### 2.3 Endpoint

- **POST /api/leads/scrape**  
  - Body: `ScrapeLeadsDto` (query, city, limit?).  
  - Respuesta: `{ success: true, data: { created, skipped, total, leads } }`.  
  - No modifica proposal ni work orders.  
  - Opcional: proteger con AuthGuard (solo admin) usando el mismo patrón que otros módulos que requieren auth.

### 2.4 Dependencias del backend

- Añadir en `backend/package.json`:
  - `puppeteer` (o `puppeteer-core` si se usa browser externo)
  - `puppeteer-extra`
  - `puppeteer-extra-plugin-stealth`

Versiones alineadas con las de prospect-agent para evitar cambios de comportamiento.

---

## 3. Base de datos: tabla `leads` y RLS

### 3.1 Migración SQL

**Archivo:** `backend/database/migrations/create_leads_table.sql`

```sql
-- ============================================
-- MIGRACIÓN: TABLA LEADS (PIPELINE + CONVERSIÓN)
-- ============================================
-- Soporta: scraper Google Maps, pipeline de ventas, diagnóstico, propuestas, conversión a cliente
-- Deduplicación: por aplicación (phone o name+address)
-- Columnas preparadas para FKs futuros (sin REFERENCES aún):
--   leads.diagnostic_id → diagnosticos.id
--   leads.proposal_id   → proposals.id
--   leads.client_id     → clientes.id
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Datos del negocio (scraper / manual)
  name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  category TEXT,

  -- Datos desde Google Maps
  google_maps_url TEXT,
  rating NUMERIC,
  reviews_count INT,

  -- Pipeline y scoring
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',
    'contacted',
    'replied',
    'diagnostic_completed',
    'proposal_sent',
    'negotiating',
    'won',
    'lost',
    'converted'
  )),
  score INT,
  source TEXT NOT NULL DEFAULT 'google_maps',

  -- Seguimiento
  notes TEXT,
  last_contact_at TIMESTAMP WITH TIME ZONE,

  -- Integración pipeline (columnas preparadas para FKs; no se crean REFERENCES aquí)
  proposal_id UUID NULL,      -- futuro: REFERENCES proposals(id)
  diagnostic_id UUID NULL,    -- futuro: REFERENCES diagnosticos(id)
  client_id UUID NULL,       -- futuro: REFERENCES clientes(id)
  converted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Índices para listados, filtros y deduplicación
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL AND phone != '';
CREATE INDEX IF NOT EXISTS idx_leads_proposal_id ON leads(proposal_id) WHERE proposal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_diagnostic_id ON leads(diagnostic_id) WHERE diagnostic_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id) WHERE client_id IS NOT NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin puede leer leads"
  ON leads FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

CREATE POLICY "Admin puede insertar leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

CREATE POLICY "Admin puede actualizar leads"
  ON leads FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

COMMENT ON TABLE leads IS 'Leads; pipeline de ventas, diagnóstico, propuestas y conversión a cliente';
COMMENT ON COLUMN leads.status IS 'new | contacted | replied | diagnostic_completed | proposal_sent | negotiating | won | lost | converted';
COMMENT ON COLUMN leads.proposal_id IS 'Futuro FK a proposals(id); sin REFERENCES en esta migración';
COMMENT ON COLUMN leads.diagnostic_id IS 'Futuro FK a diagnosticos(id); sin REFERENCES en esta migración';
COMMENT ON COLUMN leads.client_id IS 'Futuro FK a clientes(id); sin REFERENCES en esta migración';
COMMENT ON COLUMN leads.converted_at IS 'Fecha en que el lead se convirtió en cliente';
COMMENT ON COLUMN leads.source IS 'Origen del lead: google_maps, manual, etc.';
```

**Nota:** Añadir FKs en migraciones posteriores cuando corresponda, por ejemplo:
- `ALTER TABLE leads ADD CONSTRAINT fk_leads_diagnostic FOREIGN KEY (diagnostic_id) REFERENCES diagnosticos(id) ON DELETE SET NULL;`
- `ALTER TABLE leads ADD CONSTRAINT fk_leads_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL;`
- `ALTER TABLE leads ADD CONSTRAINT fk_leads_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE SET NULL;`

### 3.2 Políticas RLS (resumen)

- SELECT/INSERT/UPDATE para `authenticated` que exista en `usuarios_admin` y esté activo (igual que diagnosticos/orders).
- El backend usando service role (SupabaseService.getAdminClient()) bypassa RLS en operaciones desde Nest.
- DELETE no incluido; se puede añadir después si se requiere.

---

## 4. Mapeo scraper → tabla `leads`

**LeadsService debe mapear desde el resultado del scraper/parser a la tabla así:**

| Scraper / parser      | Campo tabla     | Notas |
|------------------------|-----------------|--------|
| nombre                 | name            | Obligatorio |
| telefono               | phone           | |
| website                | website         | |
| direccion              | address         | |
| ciudad                 | city            | |
| rubro / categoria      | category        | |
| (enlace place o URL Maps construida) | google_maps_url | Si el scraper expone href del lugar o URL de la búsqueda |
| rating                 | rating          | NUMERIC; parser/scraper ya lo expone |
| reviews_count / reviews | reviews_count | INT |
| score                  | score           | INT; parser puede devolver score; si no, null o 0 |
| —                      | status          | Siempre `'new'` en inserción desde scrape |
| —                      | source          | Siempre `'google_maps'` en inserción desde scrape |
| —                      | created_at      | NOW() |
| —                      | updated_at      | NOW() |
| —                      | proposal_id      | NULL (asignar cuando exista flujo de propuesta) |
| —                      | notes, last_contact_at | NULL en inserción desde scrape |

**Integración futura con proposal generator:** el campo `proposal_id` permite enlazar un lead con la propuesta generada cuando se implemente ese flujo (ej. al crear propuesta desde un lead, actualizar `leads.proposal_id`). La estructura queda lista sin tocar aún el módulo de propuestas.

---

## 5. Deduplicación (detalle)

- **Por teléfono:** si `phone` no es null ni vacío, normalizar a dígitos y buscar en `leads` por ese número (por ejemplo columna calculada o `REPLACE(phone, '\D', '')` en query). Si existe → no insertar, contar como "skipped".
- **Por name + address:** si no se encontró por phone (o no hay phone), buscar por `LOWER(TRIM(name))` y `LOWER(TRIM(address))`. Si existe → skip.
- Orden sugerido: primero comprobar por phone; si no hay match, comprobar por name+address. Así no se insertan dos filas para el mismo negocio.

---

## 6. Pasos de implementación (orden)

1. **Crear migración**  
   - Añadir `backend/database/migrations/create_leads_table.sql` con tabla `leads` y RLS.  
   - Ejecutar en Supabase (o documentar "ejecutar esta migración").

2. **Crear DTOs**  
   - `dto/scrape-leads.dto.ts`: query (string), city (string), limit (number, opcional, 5–50).  
   - (Opcional) `dto/lead.dto.ts` para tipar respuesta.

3. **Copiar scraper a `modules/leads/scraper/`**  
   - Copiar `mapsScraper.js`, `parser.js`, `utils.js` desde `prospect-agent/`.  
   - Ajustar imports entre ellos si hace falta (rutas relativas `.js`).  
   - No modificar lógica de runScrape.js del proposal-generator ni de work orders.

4. **Crear LeadsService**  
   - Inyectar `SupabaseService`.  
   - Método `scrapeLeads(dto: ScrapeLeadsDto)`:  
     - buildSearchQuery(dto.query, dto.city)  
     - scrapeMaps(fullQuery, { minResults: dto.limit })  
     - parsePlaces(results)  
     - Mapear a objetos con name, phone, website, address, city, category, status.  
     - Para cada uno: comprobar duplicado (phone o name+address); si no existe, insert.  
   - Retornar created, skipped, total y lista de leads insertados (o ids).

5. **Crear LeadsController**  
   - `POST /leads/scrape` con body `ScrapeLeadsDto`, llama `leadsService.scrapeLeads(dto)` y devuelve formato estándar `{ success, data }`.

6. **Crear LeadsModule**  
   - Importar `SupabaseModule`.  
   - Declarar controller y service.  
   - Exportar `LeadsService` si otro módulo lo necesitara en el futuro.

7. **Registrar en AppModule**  
   - `imports: [ ..., LeadsModule ]`.  
   - No tocar DiagnosticModule, OrdersModule, etc.

8. **Añadir dependencias**  
   - En `backend/package.json`: puppeteer, puppeteer-extra, puppeteer-extra-plugin-stealth.  
   - `npm install` en backend.

9. **Pruebas manuales**  
   - Ejecutar migración.  
   - Llamar `POST /api/leads/scrape` con query, city, limit.  
   - Verificar inserts en Supabase y que no se duplican por phone o name+address.

10. **Opcional:** Auth en `POST /leads/scrape` (solo admin) cuando el resto de la API esté protegida.

---

## 7. Qué no se hace en esta fase

- No se modifica el **proposal generator** (prospect-agent/proposal-generator).
- No se modifica el **work order system** (orders, order_modules, etc.).
- No se crean aún relaciones `leads` → `diagnosticos` ni `leads` → `clientes` (queda para una fase posterior según auditoría).
- No se cambia `runScrape.js` del prospect-agent; sigue siendo CLI independiente; la lógica se reutiliza dentro de `LeadsService` vía scraper movido a `modules/leads/scraper/`.

---

## 8. Resumen de archivos nuevos/modificados

| Acción   | Ruta |
|----------|------|
| Crear    | `backend/database/migrations/create_leads_table.sql` |
| Crear    | `backend/src/modules/leads/dto/scrape-leads.dto.ts` |
| Crear    | `backend/src/modules/leads/leads.service.ts` |
| Crear    | `backend/src/modules/leads/leads.controller.ts` |
| Crear    | `backend/src/modules/leads/leads.module.ts` |
| Copiar   | `prospect-agent/mapsScraper.js` → `backend/src/modules/leads/scraper/mapsScraper.js` |
| Copiar   | `prospect-agent/parser.js` → `backend/src/modules/leads/scraper/parser.js` |
| Copiar   | `prospect-agent/utils.js` → `backend/src/modules/leads/scraper/utils.js` |
| Modificar| `backend/src/app.module.ts` (añadir LeadsModule) |
| Modificar| `backend/package.json` (añadir puppeteer, puppeteer-extra, puppeteer-extra-plugin-stealth) |

Con esto el sistema queda preparado para integrar el scraper como módulo NestJS, con tabla `leads`, deduplicación y endpoint `POST /leads/scrape`, sin romper módulos existentes ni tocar propuestas ni órdenes de trabajo.
