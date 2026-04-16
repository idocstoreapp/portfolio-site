FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Verificar build
RUN ls -la dist/ && test -f dist/main.js || (echo "Build failed" && exit 1)

# Imagen de producción
FROM node:18-alpine

WORKDIR /app

# ====== AÑADIDO PARA PUPPETEER (RENDER.COM CERO PROBLEMAS) ======
RUN apk update && apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# =================================================================

# Copiar solo archivos necesarios para producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]
