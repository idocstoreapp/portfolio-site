FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Verificar que el build fue exitoso
RUN ls -la dist/ && (test -f dist/main.js || test -f dist/src/main.js) || (echo "Build failed - dist/main.js or dist/src/main.js not found" && exit 1)

# Imagen de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo archivos necesarios para producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando de inicio (NestJS compila a dist/src/main.js cuando sourceRoot es "src")
CMD ["node", "dist/src/main"]
