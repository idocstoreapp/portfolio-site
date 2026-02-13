# 🔧 SOLUCIÓN: Railway Build Error

## 🚨 PROBLEMA

Railway está intentando ejecutar `npm run start:prod` pero el archivo `dist/main` no existe porque el build no se está ejecutando correctamente.

**Error:**
```
Error: Cannot find module '/app/dist/main'
```

## 🔍 CAUSA

Railway necesita ejecutar el build ANTES de ejecutar `start:prod`. El problema puede ser:

1. El `buildCommand` en `railway.json` no se está ejecutando correctamente
2. El build está fallando silenciosamente
3. Railway no está usando la configuración correcta

## ✅ SOLUCIONES

### **Opción 1: Usar nixpacks.toml (Recomendado)**

Crear `backend/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start:prod"
```

### **Opción 2: Verificar railway.json**

Asegurarse de que `railway.json` tenga:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Opción 3: Crear Dockerfile (Alternativa)**

Si Nixpacks no funciona, crear `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
```

## 🚀 PASOS PARA ARREGLAR

1. **Verificar que el build funcione localmente:**
   ```bash
   cd backend
   npm ci
   npm run build
   ls dist/main.js  # Debe existir
   ```

2. **Si el build funciona localmente:**
   - Crear `nixpacks.toml` en `backend/`
   - Hacer commit y push
   - Railway debería detectar `nixpacks.toml` y usarlo

3. **Si Railway sigue fallando:**
   - Verificar los logs de Railway durante el build
   - Buscar errores de compilación TypeScript
   - Verificar que todas las dependencias estén en `package.json`

## 📋 CHECKLIST

- [x] Crear `nixpacks.toml`
- [x] Actualizar `railway.json` con `npm ci`
- [ ] Verificar que el build funcione localmente
- [ ] Hacer commit y push
- [ ] Verificar logs de Railway

## 🔍 VERIFICACIÓN

Después de hacer push, verifica en Railway:

1. **Build Logs**: Debe mostrar:
   ```
   Running: npm ci
   Running: npm run build
   ✓ Build completed successfully
   ```

2. **Deploy Logs**: Debe mostrar:
   ```
   Starting: npm run start:prod
   [Nest] Starting Nest application...
   ```

## ⚠️ NOTA IMPORTANTE

Si Railway sigue fallando después de estos cambios:

1. Verifica que el directorio raíz de Railway sea `backend/`
2. Verifica que las variables de entorno estén configuradas
3. Considera usar Dockerfile en lugar de Nixpacks
