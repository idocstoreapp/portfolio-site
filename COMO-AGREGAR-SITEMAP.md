# 📍 Cómo Agregar el Sitemap en Google Search Console

## ✅ Paso a Paso

### 1. Verifica que tu sitemap funcione

Primero, asegúrate de que el sitemap esté accesible:
- Abre: `https://portfolio-site-blush-one.vercel.app/sitemap.xml`
- Debe mostrar un XML con todas tus páginas y proyectos

### 2. Accede a Google Search Console

1. Ve a: https://search.google.com/search-console
2. Asegúrate de estar en la propiedad correcta: `https://portfolio-site-blush-one.vercel.app`
3. Si no estás en la propiedad correcta, selecciónala del menú desplegable

### 3. Ve a la sección "Sitemaps"

1. En el **menú lateral izquierdo**, busca **"Sitemaps"** (o "Mapas del sitio")
2. Haz clic en esa opción

### 4. Agrega tu sitemap

1. Verás un campo que dice: **"Agregar un nuevo sitemap"** o **"Enviar nuevo sitemap"**
2. En el campo de texto, ingresa: `sitemap.xml`
   - ⚠️ **NO pongas la URL completa**, solo: `sitemap.xml`
   - Google automáticamente usará tu dominio base
3. Haz clic en **"Enviar"** o **"Enviar sitemap"**

### 5. Verifica el estado

Después de enviarlo:
- Aparecerá en la lista de sitemaps
- Estado inicial: **"Pendiente"** o **"En proceso"**
- Después de unos minutos/horas: **"Correcto"** o **"Éxito"**
- Verás cuántas URLs se descubrieron

## 📊 Qué verás después

```
Sitemaps enviados
┌─────────────────────────────────────────┐
│ sitemap.xml                             │
│ Estado: Correcto                        │
│ URLs descubiertas: 15                    │
│ Última lectura: Hace 2 horas            │
└─────────────────────────────────────────┘
```

## ⏱️ Tiempo de procesamiento

- **Inmediato**: El sitemap se envía y aparece en la lista
- **Minutos**: Google comienza a procesarlo
- **Horas/Días**: Google rastrea e indexa las páginas
- **Semanas**: Las páginas empiezan a aparecer en búsquedas

## 🔍 Verificar que funciona

1. En Search Console, ve a **"Cobertura"** (o "Indexación")
2. Verás cuántas páginas están indexadas
3. Puede tardar días o semanas en ver resultados

## ⚠️ Notas importantes

- **Solo ingresa**: `sitemap.xml` (no la URL completa)
- **No uses**: `https://portfolio-site-blush-one.vercel.app/sitemap.xml`
- **Solo usa**: `sitemap.xml`
- Google automáticamente lo buscará en tu dominio

## 🎯 Ubicación exacta en Search Console

```
Google Search Console
├── Panel de control
├── Rendimiento
├── Cobertura
├── Mejoras
├── Sitemaps ← AQUÍ
├── Eliminaciones
└── Configuración
```

## 📝 Ejemplo visual

```
┌─────────────────────────────────────────┐
│  Sitemaps                               │
├─────────────────────────────────────────┤
│                                         │
│  Agregar un nuevo sitemap               │
│  ┌─────────────────────────────────┐   │
│  │ sitemap.xml                     │   │
│  └─────────────────────────────────┘   │
│  [Enviar]                               │
│                                         │
│  Sitemaps enviados:                     │
│  (Aquí aparecerá tu sitemap después)   │
│                                         │
└─────────────────────────────────────────┘
```

## ✅ Checklist

- [ ] Verifiqué que `/sitemap.xml` funciona en mi sitio
- [ ] Estoy en la propiedad correcta en Search Console
- [ ] Encontré la sección "Sitemaps" en el menú
- [ ] Ingresé solo `sitemap.xml` (sin URL completa)
- [ ] Hice clic en "Enviar"
- [ ] Veo el sitemap en la lista con estado "Pendiente" o "Correcto"

---

**¿Problemas?** Si no ves la opción "Sitemaps", asegúrate de que:
1. Tu propiedad esté verificada correctamente
2. Estés en la propiedad correcta (no en otra)
3. Espera unos minutos si acabas de verificar la propiedad

