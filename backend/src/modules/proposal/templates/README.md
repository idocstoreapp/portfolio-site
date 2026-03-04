# Plantillas de propuesta PDF

Aquí se editan las plantillas HTML que se usan para generar el PDF de la propuesta.

## Ubicación

- **Carpeta:** `backend/src/modules/proposal/templates/`
- Después de `npm run build`, se copian a `dist/modules/proposal/templates/`.

## Estructura

```
templates/
├── README.md           ← Este archivo
├── base.css            ← Estilos globales (colores, tipografía, márgenes)
├── generic/
│   └── template.html   ← Plantilla genérica
├── restaurante/
│   └── template.html   ← Plantilla para restaurantes
├── servicio-tecnico/
│   └── template.html   ← Plantilla para servicio técnico
└── taller/
    └── template.html   ← Plantilla para talleres
```

## Dónde editar el texto

### Primera página (portada / carta de presentación)

- **Archivo:** `generic/template.html` (o el que uses: restaurante, taller, servicio-tecnico).
- **Bloque:** la primera `<section class="proposal-page has-sidebar">`.
- **Texto largo de la primera página:** está dentro de  
  `<div class="cover-letter-text">`  
  Ahí puedes cambiar o ampliar el párrafo de presentación (por ejemplo más texto antes de “A continuación encontrará…”).

### Otras secciones

- **Título y subtítulo de la portada:**  
  `<h1 class="page-title">` y `<p class="page-subtitle">{{subtitle}}</p>`.
- **Página 2 (Experiencia digital):** segunda `<section>`; títulos y textos dentro de `.feature-card`.
- **Página 3–4 (Sistema administrativo, funcionalidades):** siguientes `<section>`; textos en `.icon-box` y `.alert-box`.
- **Página 5 (Propuesta final y precios):** última `<section>`; texto intro antes de la grilla en `.body-text`, mensaje de cierre en `.closing-message`.
- **Logos al final del PDF:** en la última página, bloque `<div class="footer-logos">` (logo del negocio + logo Maestro Digital).

### Estilos

- **Archivo:** `base.css`
- Ahí se definen colores, fuentes, tamaños de logo (`.cover-logo-client`, `.cover-logo-you`, `.footer-logo-client`, `.footer-logo-you`), márgenes y estilos de las tarjetas de precios.

## Variables que se reemplazan

El backend inyecta estas variables en el HTML (sintaxis `{{nombre}}`):

| Variable           | Uso |
|--------------------|-----|
| `{{cliente}}`      | Nombre del negocio/cliente |
| `{{logoCliente}}`  | Imagen (data URL) del logo del negocio |
| `{{logoTu}}`       | Imagen (data URL) del logo Maestro Digital. Por defecto se usa **`public/images/logo.png`** (raíz del repo); si no existe, un SVG de respaldo. |
| `{{mockup1}}`      | Primera imagen mockup. En **servicio técnico**: se usa en slot **Vista móvil** (vertical). |
| `{{mockup2}}`      | Segunda imagen mockup. En **servicio técnico**: slot **Vista escritorio / panel** (horizontal). |
| `{{mockup3}}`      | **Muestra del PDF de orden de trabajo** (suele ser vertical). En servicio técnico/taller: página 2, bloque "Cómo se verá el PDF de la orden". Slot en vertical para que no se deforme. |
| `{{mockup4}}`      | Imagen opcional para **página 3** (ej. panel, dashboard). Si no se envía, se usa mockup2. |
| `{{mockup5}}`      | Imagen opcional para **página 4** (ej. reportes, permisos). Si no se envía, se usa mockup1. |
| `{{colorPrimary}}` | Color primario (hex) |
| `{{colorSecondary}}` | Color secundario (hex) |
| `{{subtitle}}`     | Subtítulo bajo el título principal |
| `{{precioBasico}}` | Precio plan básico (texto) |
| `{{precioProfesional}}` | Precio plan profesional |
| `{{precioEnterprise}}` | Precio plan enterprise |

## Cuántas imágenes usar para que el PDF no se vea vacío

- **Portada (página 1):** 2 imágenes (mockup móvil + mockup escritorio).
- **Página 2:** mockup móvil, escritorio y **muestra del PDF de orden de trabajo** (mockup3, suele ser vertical).
- **Páginas 3 y 4:** Imágenes opcionales mockup4 y mockup5 (panel, reportes, etc.). Si no se envían, se reutilizan mockup2 y mockup1.
- **Recomendación:** Para servicio técnico o taller, subir al menos **3 imágenes** (móvil, escritorio, muestra PDF orden). Opcionalmente **5** (añadiendo imagen para página 3 y para página 4) para que las páginas 3 y 4 tengan más contenido visual.

## Después de editar

1. Guarda los cambios en los `.html` o `base.css`.
2. Si el backend está en modo desarrollo (`npm run start:dev`), a veces hace falta reiniciar para que cargue los templates desde `src/` (según cómo esté configurado `getTemplatesDir()`).
3. En producción, ejecuta `npm run build` para que se copien las plantillas a `dist/` y el backend use la versión actualizada.
