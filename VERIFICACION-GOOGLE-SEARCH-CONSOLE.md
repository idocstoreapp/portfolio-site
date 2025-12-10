# 🔍 Cómo Verificar tu Sitio en Google Search Console (Dominio Vercel)

## ❌ Problema: No puedes usar DNS con dominios de Vercel

Los dominios gratuitos de Vercel (`*.vercel.app`) **NO permiten** configurar registros DNS personalizados. Por eso el método DNS no funciona.

## ✅ Solución: Usa el Método de Etiqueta HTML

Este es el método más fácil y funciona perfectamente con Vercel.

### Paso 1: Obtén tu código de verificación

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Haz clic en **"Agregar propiedad"**
3. Selecciona **"Prefijo de URL"**
4. Ingresa: `https://portfolio-site-blush-one.vercel.app`
5. Haz clic en **"Continuar"**
6. Selecciona el método **"Etiqueta HTML"**
7. **Copia el código** que te da Google

El código se ve así:
```html
<meta name="google-site-verification" content="ABC123xyz789..." />
```

### Paso 2: Agrega el código a tu sitio

1. Abre el archivo: `src/layouts/Layout.astro`
2. Busca la sección que dice:
   ```html
   <!-- Google Search Console Verification -->
   <!-- ⚠️ Agrega aquí tu etiqueta de verificación de Google Search Console -->
   ```
3. **Reemplaza el comentario** con tu etiqueta real:
   ```html
   <meta name="google-site-verification" content="TU_CODIGO_AQUI" />
   ```
4. Guarda el archivo
5. Haz commit y push a tu repositorio
6. Vercel desplegará automáticamente los cambios

### Paso 3: Verifica en Google Search Console

1. Vuelve a Google Search Console
2. Haz clic en **"Verificar"**
3. Google buscará la etiqueta en tu sitio
4. Si todo está bien, verás: ✅ **"Propiedad verificada"**

## 📝 Ejemplo Completo

En `src/layouts/Layout.astro`, debería verse así:

```astro
<!-- Language -->
<meta http-equiv="content-language" content="es" />

<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="ABC123xyz789TU_CODIGO_REAL" />

<!-- Favicon -->
```

## 🔄 Alternativa: Método de Archivo HTML

Si prefieres, también puedes usar el método de archivo HTML:

1. Google te dará un archivo (ej: `google1234567890.html`)
2. Colócalo en la carpeta `public/` de tu proyecto
3. Google lo buscará en: `https://portfolio-site-blush-one.vercel.app/google1234567890.html`
4. Haz deploy y verifica

## ⚠️ Importante

- **No uses el método DNS** - No funciona con dominios de Vercel
- **Usa Etiqueta HTML o Archivo HTML** - Ambos funcionan perfectamente
- **Espera unos minutos** después del deploy para que Google detecte los cambios

## 🚀 Después de Verificar

Una vez verificado:

1. Ve a **"Sitemaps"** en el menú lateral
2. Ingresa: `sitemap.xml`
3. Haz clic en **"Enviar"**
4. Espera a que Google indexe tu sitio (puede tardar días o semanas)

## 💡 Tip

Si más adelante compras un dominio personalizado (ej: `tudominio.com`), entonces SÍ podrás usar el método DNS si lo configuras en tu proveedor de dominio.

---

**¿Necesitas ayuda?** Una vez que agregues la etiqueta, solo espera unos minutos y haz clic en "Verificar" en Search Console.

