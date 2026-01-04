# ESTRATEGIA DE PRODUCTO DIGITAL - MAESTRO DIGITAL
## Análisis Estratégico y Arquitectura del Sitio

---

## 1. PRODUCTOS/SERVICIOS REALES

### 1.1 Sistemas de Gestión para Restaurantes
**Problema que resuelve:** Restaurantes que usan papel, WhatsApp o sistemas obsoletos
**Solución:** Sistema completo POS + Menú QR + Gestión de mesas
**Características clave:**
- Menú QR para clientes
- POS para caja
- Gestión de mesas y comandas
- Comandas a cocina
- Uso móvil para meseros
- Impresión de comandas y boletas

**Imágenes disponibles:**
- `/images/menuqr/mockup-arabe.png` - Mockup principal
- `/images/menuqr/restaurant-arabe.jpeg` - Contexto real
- `/images/menuqr/menu-*.jpeg` - Ejemplos de menús

**Cliente ideal:** Restaurantes, cafés, bares con 5-50 mesas

---

### 1.2 Sistema de Servicio Técnico
**Problema que resuelve:** Talleres que pierden órdenes, no controlan garantías, no saben ganancias reales
**Solución:** Sistema completo de gestión de órdenes de trabajo
**Características clave:**
- Órdenes de trabajo digitales
- Registro de estado del equipo
- Firmas digitales, garantías y políticas
- Gestión de técnicos con comisiones
- Panel para técnicos (trabajos y ganancias)
- Panel admin (ganancias reales, gastos, pagos)

**Imágenes disponibles:**
- `/images/sistemas/idocstore-hero.png` - Hero
- `/images/sistemas/idocstore1-7.png` - Capturas móvil
- `/images/sistemas/idocstorepc1-2.PNG` - Capturas desktop

**Cliente ideal:** Servicios técnicos de celulares, electrónicos, electrodomésticos

---

### 1.3 Sistema para Taller Mecánico
**Problema que resuelve:** Talleres que no controlan estados, repuestos, boletas
**Solución:** Sistema similar a servicio técnico adaptado a mecánica
**Características clave:**
- Registro de estados y novedades
- Uso en tablets por técnicos
- Gestión de repuestos
- Boletas y facturación

**Imágenes disponibles:**
- Reutilizar estructura de idocstore (adaptar)
- Necesita imágenes específicas de taller mecánico

**Cliente ideal:** Talleres mecánicos, motos, bicicletas

---

### 1.4 Cotizador para Fábricas/Mueblerías
**Problema que resuelve:** Fábricas que cotizan a ojo, no controlan costos reales, pierden dinero
**Solución:** Sistema de cotización complejo con control de costos
**Características clave:**
- Cotizador por medidas y variables
- Control de costos reales vs cotizados
- Mano de obra, horas, empleados
- Gestión de gastos reales por proyecto

**Imágenes disponibles:**
- `/images/sistemas/cotizador-hero.png` - Hero
- `/images/sistemas/cotizador1-3.png` - Capturas móvil
- `/images/sistemas/cotizadorpc1-4.PNG` - Capturas desktop
- `/images/webs/muebleria1-2.png` - Web del cotizador
- `/images/webs/mobiliario*.png` - Web Kubica

**Cliente ideal:** Fábricas de muebles, carpinterías, empresas que cotizan a medida

---

### 1.5 Desarrollo Web
**Problema que resuelve:** Empresas sin presencia digital o con sitios obsoletos
**Solución:** Páginas web modernas y funcionales
**Características clave:**
- Páginas corporativas
- Landings
- Catálogos
- Ecommerce con pago online
- Portafolios

**Imágenes disponibles:**
- `/images/webs/muebleria1-2.png` - Ejemplos de webs
- `/images/webs/mobiliario*.png` - Ejemplos de webs
- `/images/projects/portfolio-web/cover.jpg` - Portafolio

**Cliente ideal:** Cualquier empresa que necesite presencia web profesional

---

## 2. ARQUITECTURA DE PÁGINAS

### 2.1 Estructura Principal

```
/
├── / (Home)
│   ├── Hero con CTA a diagnóstico
│   ├── Diagnóstico estratégico (wizard)
│   ├── Proyectos destacados (carousel)
│   ├── Casos de éxito
│   └── Testimonios
│
├── /soluciones/ (Nueva - Reemplaza /servicios)
│   ├── /soluciones/restaurantes
│   ├── /soluciones/servicio-tecnico
│   ├── /soluciones/taller-mecanico
│   ├── /soluciones/cotizador-fabrica
│   └── /soluciones/desarrollo-web
│
├── /proyectos/ (Mejorar)
│   ├── Filtros por tipo de solución
│   ├── Grid de proyectos con contexto
│   └── Páginas individuales mejoradas
│
├── /sobre-mi/ (Mantener)
│
└── /contacto/ (Mantener)
```

### 2.2 Flujo de Conversión

```
HOME
  ↓
[CTA: "Solicitar diagnóstico"]
  ↓
DIAGNÓSTICO WIZARD
  ├─ Paso 1: Tipo de empresa
  ├─ Paso 2: Nivel digital
  ├─ Paso 3: Objetivo
  ├─ Paso 4: Tamaño
  ├─ Paso 5: Análisis
  └─ Paso 6: Resultado
      ├─ Si califica → Redirige a página específica de solución
      └─ Si no califica → Muestra alternativas
  ↓
PÁGINA DE SOLUCIÓN ESPECÍFICA
  ├─ Hero con problema/solución
  ├─ Características principales
  ├─ Proceso de trabajo
  ├─ Casos de éxito relacionados
  └─ CTA final: "Agendar llamada"
  ↓
CONTACTO
  └─ Formulario con datos del diagnóstico
```

---

## 3. PÁGINAS DE SOLUCIONES - ESTRUCTURA

### 3.1 Template Base para Soluciones

Cada página de solución debe tener:

1. **Hero Section**
   - Título: Problema que resuelve
   - Subtítulo: Solución en una línea
   - Imagen: Mockup o captura del sistema
   - CTA: "Ver cómo funciona" o "Agendar demo"

2. **Sección: El Problema**
   - 3-4 problemas comunes del cliente
   - Visual: Cards con iconos
   - Texto directo, sin marketing

3. **Sección: La Solución**
   - Características principales (4-6)
   - Visual: Grid con capturas/imágenes
   - Enfoque en beneficios, no features técnicas

4. **Sección: Cómo Funciona**
   - Proceso paso a paso (3-5 pasos)
   - Visual: Timeline o steps
   - Imágenes del sistema en acción

5. **Sección: Casos de Éxito Relacionados**
   - Proyectos específicos de esta solución
   - Cards con: Problema → Solución → Resultado
   - Imágenes reales del proyecto

6. **Sección: CTA Final**
   - "Agendar llamada estratégica"
   - "Ver demo del sistema"
   - Formulario corto o link a contacto

---

## 4. MAPEO DE IMÁGENES POR PÁGINA

### 4.1 /soluciones/restaurantes
**Hero:**
- `/images/menuqr/mockup-arabe.png` (mockup principal)

**Características:**
- `/images/menuqr/menu-bar.jpeg` (ejemplo menú)
- `/images/menuqr/menu-cafeteria.jpeg` (ejemplo menú)
- `/images/menuqr/restaurant-arabe.jpeg` (contexto real)

**Faltan:**
- Captura de POS/caja
- Captura de gestión de mesas
- Captura de comandas a cocina
- Captura de panel admin

---

### 4.2 /soluciones/servicio-tecnico
**Hero:**
- `/images/sistemas/idocstore-hero.png`

**Características:**
- `/images/sistemas/idocstore1-7.png` (móvil)
- `/images/sistemas/idocstorepc1-2.PNG` (desktop)

**Faltan:**
- Captura de panel de técnico
- Captura de panel admin con ganancias
- Captura de firmas/garantías

---

### 4.3 /soluciones/taller-mecanico
**Hero:**
- Reutilizar estructura de servicio técnico
- Necesita imágenes específicas de taller

**Faltan:**
- Todas las imágenes (adaptar de servicio técnico o crear nuevas)

---

### 4.4 /soluciones/cotizador-fabrica
**Hero:**
- `/images/sistemas/cotizador-hero.png`

**Características:**
- `/images/sistemas/cotizador1-3.png` (móvil)
- `/images/sistemas/cotizadorpc1-4.PNG` (desktop)
- `/images/webs/muebleria1-2.png` (web del sistema)

**Faltan:**
- Captura de control de costos
- Captura de gestión de empleados/horas

---

### 4.5 /soluciones/desarrollo-web
**Hero:**
- `/images/webs/muebleria1.png` o mockup genérico

**Características:**
- `/images/webs/muebleria1-2.png`
- `/images/webs/mobiliario*.png`
- `/images/projects/portfolio-web/cover.jpg`

**Faltan:**
- Más ejemplos de diferentes tipos de webs
- Capturas de ecommerce
- Capturas de landings

---

## 5. CONTENIDO POR PÁGINA

### 5.1 /soluciones/restaurantes

**Hero:**
- Título: "Sistema completo para restaurantes que quieren dejar el papel atrás"
- Subtítulo: "Menú QR, POS, gestión de mesas y comandas. Todo en un solo sistema que funciona desde el celular."

**Problemas:**
1. "Pierdes órdenes porque los meseros olvidan anotar"
2. "Los clientes esperan mucho porque la cocina no sabe qué hacer"
3. "No sabes cuánto vendiste hoy hasta que cierras la caja"
4. "Los menús impresos se desactualizan y cuestan dinero"

**Solución - Características:**
1. Menú QR para clientes (sin contacto, siempre actualizado)
2. POS integrado (cobro rápido, control en tiempo real)
3. Comandas directas a cocina (sin papel, sin errores)
4. Gestión de mesas (sabes qué mesa está ocupada, qué pidió)
5. Uso desde celular (meseros no necesitan tablet)
6. Impresión automática (comandas y boletas cuando necesites)

**Cómo funciona:**
1. Cliente escanea QR → Ve menú → Hace pedido
2. Pedido llega a cocina → Cocina prepara → Marca listo
3. Mesero cobra desde su celular → Imprime boleta
4. Admin ve todo en tiempo real → Reportes automáticos

---

### 5.2 /soluciones/servicio-tecnico

**Hero:**
- Título: "Sistema para servicios técnicos que quieren controlar todo"
- Subtítulo: "Órdenes de trabajo, garantías, comisiones de técnicos y ganancias reales. Todo en un solo lugar."

**Problemas:**
1. "Pierdes órdenes porque las anotas en papel"
2. "No sabes cuánto ganaste realmente (gastos, comisiones)"
3. "Los técnicos no saben cuánto ganan por comisión"
4. "Las garantías se pierden o no sabes cuándo vencen"

**Solución - Características:**
1. Órdenes de trabajo digitales (nunca se pierden)
2. Firmas digitales del cliente (garantías legales)
3. Control de garantías y políticas (avisos automáticos)
4. Panel para técnicos (ven sus trabajos y ganancias)
5. Panel admin (ganancias reales, gastos, pagos)
6. Registro de estado del equipo (historial completo)

**Cómo funciona:**
1. Cliente trae equipo → Creas orden → Técnico la toma
2. Técnico registra estado → Toma fotos → Estima costo
3. Cliente aprueba → Técnico repara → Marca completado
4. Cliente firma digital → Se imprime garantía → Se cobra
5. Admin ve ganancias reales (venta - gastos - comisiones)

---

### 5.3 /soluciones/taller-mecanico

**Hero:**
- Título: "Sistema para talleres que quieren profesionalizar su operación"
- Subtítulo: "Gestión de órdenes, repuestos, boletas y técnicos. Todo desde una tablet."

**Problemas:**
1. "No controlas qué repuestos usaste en cada trabajo"
2. "Las boletas se hacen a mano y se pierden"
3. "No sabes el estado real de cada vehículo"
4. "Los técnicos trabajan en papel y pierden información"

**Solución - Características:**
1. Órdenes de trabajo digitales
2. Gestión de repuestos (control de stock)
3. Boletas y facturación automática
4. Registro de estados y novedades
5. Uso en tablets (técnicos trabajan directo ahí)
6. Panel admin con ganancias y gastos

**Cómo funciona:**
1. Cliente trae vehículo → Creas orden → Asignas técnico
2. Técnico registra estado → Selecciona repuestos → Estima costo
3. Cliente aprueba → Técnico repara → Registra trabajo
4. Se genera boleta automática → Se cobra → Se imprime garantía

---

### 5.4 /soluciones/cotizador-fabrica

**Hero:**
- Título: "Cotizador inteligente para fábricas que cotizan a medida"
- Subtítulo: "Controla costos reales, cotiza con precisión y no pierdas dinero en proyectos."

**Problemas:**
1. "Cotizas a ojo y luego pierdes dinero"
2. "No sabes cuánto costó realmente un proyecto"
3. "No controlas horas de empleados por proyecto"
4. "Los gastos reales no coinciden con lo cotizado"

**Solución - Características:**
1. Cotizador por medidas y variables (precisión)
2. Control de costos reales vs cotizados
3. Gestión de mano de obra y horas
4. Control de empleados por proyecto
5. Gestión de gastos reales (materiales, horas, extras)
6. Reportes de rentabilidad por proyecto

**Cómo funciona:**
1. Cliente pide cotización → Ingresas medidas/variables
2. Sistema calcula costo estimado → Ajustas margen → Generas cotización
3. Cliente aprueba → Inicias proyecto → Registras gastos reales
4. Sistema compara: cotizado vs real → Ves ganancia/pérdida
5. Aprendes de cada proyecto → Mejoras próximas cotizaciones

---

### 5.5 /soluciones/desarrollo-web

**Hero:**
- Título: "Páginas web que convierten, no solo se ven bonitas"
- Subtítulo: "Diseño profesional, rápido y orientado a resultados para tu empresa."

**Problemas:**
1. "No tienes presencia digital o tu sitio está obsoleto"
2. "Tu web no genera contactos ni ventas"
3. "No sabes cómo actualizar tu contenido"
4. "Tu sitio es lento y no se ve bien en celular"

**Solución - Características:**
1. Páginas corporativas modernas
2. Landings optimizadas para conversión
3. Catálogos interactivos
4. Ecommerce con pago online
5. Portafolios profesionales
6. Diseño responsive (se ve bien en todo)

**Cómo funciona:**
1. Analizamos tu negocio → Definimos objetivos
2. Diseñamos propuesta → Aprobamos juntos
3. Desarrollamos → Probamos → Lanzamos
4. Te enseñamos a actualizar → Soporte continuo

---

## 6. MEJORAS A /proyectos

### 6.1 Estructura Mejorada

**Filtros inteligentes:**
- Por tipo de solución (Restaurantes, Servicio técnico, etc.)
- Por objetivo (Aumentar ventas, Optimizar procesos, etc.)
- Por tamaño de empresa

**Grid de proyectos:**
- Cada proyecto muestra:
  - Imagen principal
  - Tipo de solución
  - Problema que resolvió
  - Resultado obtenido
  - Link a caso completo

**Páginas individuales:**
- Contexto del cliente
- Problema específico
- Solución implementada
- Resultados medibles
- Galería de imágenes
- Testimonio (si hay)

---

## 7. COMPONENTES NECESARIOS

### 7.1 Nuevos Componentes

1. **SolutionHero.astro**
   - Hero específico para páginas de soluciones
   - Props: title, subtitle, image, cta

2. **ProblemCards.astro**
   - Grid de problemas comunes
   - Props: problems array

3. **FeatureGrid.astro**
   - Grid de características con imágenes
   - Props: features array con images

4. **ProcessTimeline.astro**
   - Timeline de cómo funciona
   - Props: steps array

5. **RelatedProjects.astro**
   - Proyectos relacionados con la solución
   - Props: projects array filtrados

6. **SolutionCTA.astro**
   - CTA final de la página
   - Props: ctaText, ctaLink

### 7.2 Componentes a Mejorar

1. **ProjectsCarousel** → Agregar filtros
2. **ProjectCard** → Agregar contexto (problema/resultado)

---

## 8. PLAN DE IMPLEMENTACIÓN

### Fase 1: Estructura Base
1. Crear carpeta `/soluciones/`
2. Crear template base para soluciones
3. Crear componentes nuevos

### Fase 2: Páginas de Soluciones
1. /soluciones/restaurantes
2. /soluciones/servicio-tecnico
3. /soluciones/taller-mecanico
4. /soluciones/cotizador-fabrica
5. /soluciones/desarrollo-web

### Fase 3: Mejoras a Proyectos
1. Agregar filtros
2. Mejorar cards con contexto
3. Mejorar páginas individuales

### Fase 4: Integración
1. Conectar diagnóstico con páginas específicas
2. Actualizar navegación
3. Optimizar flujo de conversión

---

## 9. NOTAS FINALES

- Todo el contenido debe ser específico, no genérico
- Enfocarse en problemas reales del cliente
- Usar imágenes reales de los sistemas
- Mantener diseño premium y limpio
- Priorizar conversión sobre estética
- Cada página debe tener un propósito claro


