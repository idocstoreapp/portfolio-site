FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar dependencias (solo producción si es necesario)
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Verificar que el build fue exitoso
RUN ls -la dist/ || (echo "Build failed - dist directory not found" && exit 1)

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
