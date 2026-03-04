# Análisis del sistema de generación de propuestas PDF

Este documento describe la arquitectura actual del módulo `proposal-generator`, qué datos usa, qué está fijo y qué habría que hacer para integrarlo en un admin con Supabase, NestJS y Next.js.

---

## 1. Cómo se genera el proposal actualmente

### 1.1 Archivo que ejecuta el proceso

- **Punto de entrada:** `generate-proposal.js` (raíz de `proposal-generator/`).
- **Ejecución:** `node generate-proposal.js` (o `npm run generate` / `npm start`).
- **Flujo:** El script llama a `generateProposal({ ... })` exportada desde `lib/generateProposal.js`. No hay CLI con argumentos; todo se define en el objeto que se pasa a la función.

### 1.2 Cómo se ejecuta (tecnología)

| Paso | Tecnología | Archivo |
|------|------------|---------|
| 1. Extracción de colores del logo | **node-vibrant** (Node) | `lib/extractColors.js` |
| 2. Carga de template HTML | **fs** (lectura de archivos) | `lib/generateProposal.js` |
| 3. Inyección de variables | Sustitución de cadenas `{{variable}}` en el HTML | `lib/generateProposal.js` (función `injectVariables`) |
| 4. Inline de CSS | Reemplazo del `<link href="../base.css">` por `<style>` con el contenido de `base.css` | `lib/generateProposal.js` (función `loadTemplate`) |
| 5. Imágenes | Rutas de archivo → lectura → **data URL base64** embebida en el HTML | `lib/generateProposal.js` (función `imageToDataUrl`) |
| 6. Generación del PDF | **Puppeteer**: `page.setContent(html)` + `page.pdf()` | `lib/generatePDF.js` |

No se usa **html-pdf**, **jsPDF** ni ningún otro generador de PDF; solo **Puppeteer** para renderizar HTML y exportar a A4.

### 1.3 Datos que recibe

La función `generateProposal(options)` recibe un único objeto con:

| Campo | Tipo | Origen típico | Ejemplo |
|-------|------|----------------|---------|
| `cliente` | string | Parámetro | `"Casa Amaranta"` |
| `logoCliente` | string (ruta) | Parámetro | `"./assets/logos/logo.png"` |
| `logoTu` | string (ruta) | Parámetro | `"./assets/logos/mylogo.png"` |
| `mockups` | string[] (rutas) | Parámetro | `["./assets/mockups/mockup1.png", ...]` |
| `tipoNegocio` | string | Parámetro | `"restaurante"` \| `"taller"` \| `"servicio-tecnico"` \| `"generic"` |
| `planes` | object | Parámetro | `{ basico: "150.000 CLP", profesional: "...", enterprise: "..." }` |
| `subtitle` | string (opcional) | Parámetro | Override del subtítulo por tipo |
| `outputPath` | string (opcional) | Parámetro | Ruta absoluta del PDF de salida |

**Datos derivados en tiempo de ejecución:**

- `colorPrimary` y `colorSecondary`: obtenidos con **node-vibrant** desde la imagen del logo (o valores por defecto si falla).
- `subtitle`: si no se pasa, se toma del mapa `SUBTITLES` según `tipoNegocio`.
- `mockup1`, `mockup2`, `mockup3`: data URLs generadas desde las rutas en `mockups` (o placeholders SVG si el archivo no existe).

### 1.4 Datos hardcodeados

- **En `generate-proposal.js`:** Todo el objeto de ejemplo: cliente, rutas de logos/mockups, tipoNegocio, planes.
- **En `lib/generateProposal.js`:**
  - `SUBTITLES`: subtítulos por tipo de negocio (restaurante, taller, servicio-tecnico, generic).
  - Valores por defecto de colores: `#c41e3a`, `#2d2d2d`.
  - Precios por defecto en `buildVariables`: `planes.basico ?? '150.000'`, etc.
  - Placeholders SVG (logos y mockups) cuando falla la lectura del archivo.
  - Nombre del PDF: `propuesta-{cliente}.pdf` en `output/`.
- **En templates HTML:** Ver sección 2.
- **En `lib/generatePDF.js`:** Opciones de Puppeteer (headless, args, timeout, márgenes del PDF).

---

## 2. Estructura del template HTML

### 2.1 Cuántas páginas tiene

El PDF tiene **exactamente 5 páginas**. Cada una es un `<section class="proposal-page">` con `page-break-after: always` (definido en `base.css`).

| Página | Contenido (título / bloque principal) |
|--------|----------------------------------------|
| 1 | Portada / Carta de presentación (cover letter) |
| 2 | Experiencia Digital (features + mockups) |
| 3 | Sistema Administrativo (grid de icon boxes) |
| 4 | Funcionalidades avanzadas (roles, permisos, alert box) |
| 5 | Propuesta final (grid de precios, CTA, cierre) |

### 2.2 Partes dinámicas (variables inyectadas)

Sustitución por `{{variable}}` en el HTML (y en el `<style>` del `<head>`):

| Variable | Uso |
|----------|-----|
| `{{cliente}}` | Título, carta, alt de imagen, footer de página |
| `{{logoCliente}}` | `src` del logo del cliente (data URL) |
| `{{logoTu}}` | `src` de “tu” logo (data URL) |
| `{{subtitle}}` | Subtítulo del bloque de título en página 1 |
| `{{colorPrimary}}` | CSS: variables, fondos, bordes, precio |
| `{{colorSecondary}}` | CSS: variables (p. ej. sidebar oscuro) |
| `{{mockup1}}`, `{{mockup2}}`, `{{mockup3}}` | `src` de imágenes de mockups (data URLs) |
| `{{precioBasico}}`, `{{precioProfesional}}`, `{{precioEnterprise}}` | Precios en la página 5 |

El **texto de la carta** (página 1) incluye `{{cliente}}` pero el párrafo en sí está fijo en el HTML (por plantilla: generic, restaurante, taller, servicio-tecnico).

### 2.3 Partes hardcodeadas en el template

- **Contacto y CTA (en todos los templates):**
  - Texto: "Escanea y contacta", "Jonathan Guarirapa", "+56 9 6261 4851", "Iniciar transformación", "Jonathan Guarirapa · +56 9 6261 4851 · WhatsApp".
- **QR:** No hay imagen real de QR; hay un `<div class="qr-placeholder">` con el texto "QR WhatsApp" (no enlazado a URL ni generado).
- **Textos de contenido:** Títulos de sección, descripciones de feature cards, textos de icon boxes, ítems de listas de precios (p. ej. "Página web estática", "Hasta 5 secciones"), texto del alert box, mensaje de cierre ("Espero con entusiasmo...").
- **Estructura de planes:** Siempre 3 planes (Básico, Profesional, Enterprise); nombres y lista de ítems por plan están en el HTML.
- **Número de páginas:** "Página X de 5" en el footer.

### 2.4 Assets que usa

| Asset | Origen en runtime | Uso en template |
|-------|-------------------|------------------|
| Logo cliente | Ruta `logoCliente` → leído y convertido a data URL | `<img src="{{logoCliente}}">` en página 1 |
| Logo “tu” | Ruta `logoTu` → data URL | `<img src="{{logoTu}}">` en página 1 |
| Mockup 1 | Ruta `mockups[0]` → data URL | Portada y página 2 |
| Mockup 2 | Ruta `mockups[1]` → data URL | Página 2 |
| Mockup 3 | Ruta `mockups[2]` → data URL | (disponible; no siempre usado en generic) |
| base.css | Lectura desde disco e inyectado como `<style>` | Estilos globales (no hay link externo en el HTML final) |
| Fuentes | Google Fonts (Inter, Poppins) vía `@import` en base.css | Tipografía de todo el documento |

No hay referencias a archivos externos en el HTML final: CSS y imágenes se embeben para que Puppeteer no dependa de rutas relativas ni de red.

---

## 3. Dependencias para generar el PDF

| Dependencia | Versión (package.json) | Uso |
|-------------|------------------------|-----|
| **puppeteer** | ^23.0.0 | Abrir Chromium headless, cargar HTML en memoria con `setContent`, llamar a `page.pdf()` para generar el archivo A4. |
| **node-vibrant** | ^4.0.0 | Extraer paleta del logo (Vibrant, DarkVibrant, Muted, etc.) y devolver `primary` y `secondary` en hex para el template. |

No se usa:

- **html-pdf**
- **jsPDF**
- **pdf-lib**
- **@react-pdf/renderer**
- Ningún otro motor de PDF

El “motor” del PDF es exclusivamente **Puppeteer** (Chromium) renderizando HTML/CSS.

---

## 4. Partes que convendría convertir en sistema dinámico editable

Para un admin donde el usuario pueda configurar propuestas sin tocar código:

1. **Datos de contacto y CTA**
   - Nombre y apellido del responsable (hoy "Jonathan Guarirapa").
   - Teléfono / WhatsApp (hoy "+56 9 6261 4851").
   - URL del QR (WhatsApp u otra) para generar la imagen del QR desde el backend.
   - Textos de CTA ("Escanea y contacta", "Iniciar transformación", etc.).

2. **Textos de la carta (página 1)**
   - Saludo y cuerpo de la carta (hoy fijo por tipo de plantilla).
   - Deberían poder editarse por plantilla o por propuesta (por ejemplo en Supabase).

3. **Contenido por página (textos)**
   - Títulos y subtítulos de cada sección.
   - Feature cards (título + descripción) en página 2.
   - Icon boxes (título + descripción) en páginas 3 y 4.
   - Texto del alert box en página 4.
   - Párrafo introductorio de la página 5 y mensaje de cierre.

4. **Planes y precios**
   - Número de planes (hoy fijo en 3).
   - Nombre de cada plan (Básico, Profesional, Enterprise).
   - Precio y moneda por plan.
   - Lista de ítems/features por plan (hoy lista fija en HTML).

5. **Subtítulos por tipo de negocio**
   - Hoy en código (`SUBTITLES`). Deberían ser configurables (por ejemplo en BD o en admin).

6. **Assets**
   - Logo cliente y logo “tu”: URLs o IDs de almacenamiento (Supabase Storage/S3), no rutas de disco.
   - Mockups: lista de URLs/IDs, posiblemente con orden y etiqueta por página.
   - Opción de subir/editar QR (o seguir generándolo desde URL).

7. **Colores**
   - Mantener extracción desde logo como opción.
   - Permitir override manual de color primario y secundario desde el admin.

8. **Estructura de plantillas**
   - Variantes por tipo de negocio (restaurante, taller, servicio-tecnico, generic) hoy son archivos HTML distintos.
   - En un sistema editable podría haber: “template base” + “variante” o “bloques” por página editables (guardados en BD).

---

## 5. Arquitectura recomendada para integrar con Supabase + NestJS + Next.js

### 5.1 Visión general

- **Supabase:** Datos de propuestas, clientes, plantillas (textos, bloques), configuración de contacto, planes/precios; Storage para logos y mockups.
- **NestJS:** API de generación de PDF, orquestación (colores, plantilla, variables), llamada a Puppeteer; no exponer Puppeteer directamente desde Next.js.
- **Next.js (admin):** UI para crear/editar propuestas, subir assets, previsualizar (por ejemplo si se expone un endpoint que devuelve HTML o una miniatura), descargar PDF.

### 5.2 Supabase

- **Tablas sugeridas (resumen):**
  - `clients`: nombre, logo_url, etc.
  - `proposals`: client_id, template_type, status, contact_name, contact_phone, contact_whatsapp_url, custom_subtitle, created_at, etc.
  - `proposal_plans`: proposal_id, name, price, currency, sort_order; `proposal_plan_features`: plan_id, text, sort_order.
  - `templates` (opcional): si se guardan versiones de HTML por tipo; o solo “base” y el resto en BD.
  - `template_blocks` o `template_texts`: clave (ej. `cover_letter_body`, `page2_subtitle`), valor (texto), template_type.
- **Storage:** buckets para `logos` y `mockups`; URLs públicas o firmadas para que NestJS pueda descargar y convertir a base64/data URL si se mantiene ese enfoque.

### 5.3 NestJS (backend)

- **ProposalModule / ProposalService:**
  - `generateProposalPdf(proposalId: string)`: carga propuesta y datos relacionados desde Supabase, resuelve URLs de logos/mockups (descargar y convertir a base64 o pasar URL a un worker).
  - O bien un **worker/queue** (Bull, etc.) que reciba el job “generar PDF para propuesta X” y devuelva la URL del PDF en Storage.
- **Puppeteer:** Ejecutar en el backend (NestJS), no en el navegador. Reutilizar la lógica actual: construir HTML (template + variables), opcionalmente leer CSS desde disco o desde BD, luego `generatePDF(html, path)`.
- **Endpoints ejemplos:**
  - `POST /proposals/:id/generate-pdf`: dispara la generación y devuelve job id o URL del PDF.
  - `GET /proposals/:id/pdf`: devuelve el PDF o redirección a Supabase Storage.
  - `GET /proposals/:id/preview-html`: opcional; devuelve HTML para iframe en el admin (sin Puppeteer).

### 5.4 Next.js (admin)

- Páginas para: listar propuestas, crear/editar propuesta (cliente, tipo, contacto, planes, textos editables), subir logos y mockups (a Supabase Storage).
- Al guardar, los datos van a Supabase; la generación del PDF se dispara desde el backend (NestJS) cuando el usuario pulsa “Generar PDF” o de forma automática al publicar.
- No ejecutar Puppeteer en el frontend; el frontend solo consume la API de NestJS.

### 5.5 Flujo de datos

1. Usuario en Next.js elige cliente (o crea uno) y asigna logo (URL de Storage).
2. Usuario edita textos, planes, precios, contacto, URL de WhatsApp para QR.
3. Next.js guarda en Supabase (proposals, proposal_plans, etc.).
4. Usuario hace clic en “Generar PDF”.
5. Next.js llama a NestJS `POST /proposals/:id/generate-pdf`.
6. NestJS (o worker) carga datos desde Supabase, descarga imágenes desde URLs si hace falta, construye variables, carga template (desde archivo o BD), inyecta variables, llama a `generatePDF(html, outputPath)`, sube el PDF a Supabase Storage y actualiza la propuesta con `pdf_url`.
7. Next.js muestra enlace de descarga o abre el PDF desde la URL.

---

## 6. Qué archivos deberían convertirse en qué

| Rol en el sistema futuro | Archivos / componentes actuales | Recomendación |
|---------------------------|---------------------------------|----------------|
| **Template base** | `templates/base.css` + estructura común del HTML (doctype, head, body, clases de página, estructura de secciones) | Mantener `base.css` como recurso compartido; extraer una “base” HTML (o un único template con bloques reemplazables) que defina solo layout y clases. Los textos y listas pasan a venir de BD o de “template editable”. |
| **Template editable** | `templates/generic/template.html`, `restaurante/`, `taller/`, `servicio-tecnico/` | Opción A: Un solo template “base” con placeholders ampliados (p. ej. `{{cover_letter_body}}`, `{{page2_features}}` como JSON o HTML fragment). Opción B: Guardar en Supabase el HTML por tipo (o por propuesta) y que el generator solo inyecte variables. En ambos casos, los textos y listas de features/planes no deberían estar hardcodeados en el repo. |
| **Assets configurables** | Rutas en `generate-proposal.js` y en `buildVariables`: `logoCliente`, `logoTu`, `mockups` | Dejar de usar rutas de disco. Recibir URLs (Supabase Storage) o IDs; el servicio en NestJS descarga el archivo y genera la data URL, o sirve una URL pública si Puppeteer puede cargarla (menos portable). Mantener `imageToDataUrl` (o equivalente) para seguir embebiendo y no depender de red en el momento del PDF. |
| **Generator service** | `lib/generateProposal.js`, `lib/generatePDF.js`, `lib/extractColors.js` | Migrar a un **ProposalPdfService** (o similar) en NestJS: `generateProposal` se convierte en método que recibe `proposalId` o DTO con cliente, logo URLs, mockup URLs, planes, textos, contacto, etc. `generatePDF` se mantiene como utilidad que recibe HTML y path (o buffer). `extractColors` se mantiene como utilidad; el logo puede llegar como URL descargada temporalmente. |

Resumen por archivo:

- **`generate-proposal.js`:** Dejar de ser el orquestador; será reemplazado por la API de NestJS que recibe `proposalId` y opcionalmente parámetros.
- **`lib/generateProposal.js`:** Lógica a llevar al backend: construcción de variables, elección de template, inyección. Los datos ya no vendrán de un objeto local sino de Supabase (y en parte del request).
- **`lib/generatePDF.js`:** Reutilizable tal cual (o con pequeñas adaptaciones para recibir buffer en lugar de path y devolver buffer para subir a Storage).
- **`lib/extractColors.js`:** Reutilizable; aceptar ruta local o buffer si se adapta node-vibrant para leer desde buffer.
- **Templates HTML:** Pasar a “template base” + contenido inyectable (textos, listas) desde BD o desde configuración guardada.

---

## 7. Problemas actuales que impedirían integrarlo directamente

1. **Entrada solo por código**  
   No hay API ni CLI con parámetros; todo está en el objeto hardcodeado en `generate-proposal.js`. Para integrar hace falta un endpoint (p. ej. NestJS) que reciba `proposalId` o un DTO y ejecute la misma lógica.

2. **Rutas de archivo locales**  
   `logoCliente`, `logoTu`, `mockups` son rutas del sistema de archivos relativas a `proposal-generator/`. En un backend en la nube o en un contenedor no existirán; hay que pasar a URLs (Supabase Storage) y descargar en memoria (o a un temporal) antes de construir las data URLs.

3. **Contacto y QR fijos**  
   Nombre, teléfono y texto “QR WhatsApp” están en el HTML. Para multi-tenant o multi-usuario hay que parametrizarlos (variables `{{contactName}}`, `{{contactPhone}}`, `{{whatsappUrl}}`) y generar una imagen de QR real desde la URL de WhatsApp (u otra) en el backend.

4. **Un solo output en disco**  
   `outputPath` es un path local. En producción el PDF debería subirse a Storage (Supabase/S3) y guardarse la URL en la propuesta; el servicio debería devolver buffer o stream para subir, no solo escribir en disco.

5. **Templates en archivos estáticos**  
   Cualquier cambio de texto o estructura implica desplegar código. Para un admin editable, los textos (y opcionalmente la estructura por página) deberían vivir en BD o en un CMS, no solo en HTML en el repo.

6. **Puppeteer en el mismo proceso**  
   Puppeteer es pesado y puede ser inestable en entornos serverless o con muchas concurrencias. Recomendación: cola de jobs (Bull, etc.) y/o servicio/worker dedicado que ejecute Puppeteer, para no bloquear la API principal.

7. **Sin identificación de propuesta en el PDF**  
   El nombre del archivo se deriva solo del nombre del cliente (`propuesta-{cliente}.pdf`). No hay `proposalId` en el flujo actual; al integrar con Supabase convendría que el nombre o el contenido del PDF refleje el ID de la propuesta para trazabilidad.

8. **Idioma y moneda fijos**  
   Textos en español y “CLP” están fijos. Para internacionalización o múltiples monedas harían falta variables (por ejemplo `{{currency}}`) y textos por idioma.

9. **Dependencia de Google Fonts en tiempo de generación**  
   `base.css` usa `@import` de Google Fonts. Puppeteer necesita red para cargar las fuentes; en entornos restringidos o sin red podría fallar. Alternativa: fuentes locales o self-hosted para el proceso de generación.

10. **Sin validación de inputs**  
    No hay validación de tipos ni de rangos (p. ej. precios, longitud de textos). En una API pública haría falta un DTO validado (class-validator, etc.) para evitar errores o contenido inesperado en el PDF.

---

## Resumen ejecutivo

- **Generación:** Un solo script Node (`generate-proposal.js`) que llama a `generateProposal()` con un objeto fijo; la función carga template según `tipoNegocio`, inyecta variables (incluidas imágenes como data URLs) y usa Puppeteer para generar un PDF A4 de 5 páginas.
- **Template:** 4 variantes HTML (generic, restaurante, taller, servicio-tecnico) + un `base.css` inyectado; solo un conjunto limitado de variables (`{{cliente}}`, logos, mockups, colores, precios, subtítulo); el resto (contacto, QR, textos de secciones, listas de planes) está hardcodeado.
- **Dependencias:** Solo Puppeteer (para el PDF) y node-vibrant (para colores del logo).
- **Para integrar en Supabase + NestJS + Next.js:** Parametrizar contacto y QR, sacar textos y planes a BD, usar URLs de Storage para assets, exponer la generación como servicio en NestJS (o worker), subir el PDF a Storage y servir la URL desde el admin en Next.js. Los archivos actuales pueden reutilizarse como “template base” y “generator” una vez adaptados a datos desde API/BD y a salida por buffer/Storage en lugar de solo disco local.
