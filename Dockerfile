# Dockerfile optimizado con multi-stage build
# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Ejecutar pruebas y linting (opcional)
# RUN npm test

# Etapa de producción
FROM node:18-alpine

# Usar usuario no root para mejorar seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copiar dependencias de producción y código desde la etapa de construcción
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/src ./src

# Configuración de usuario no root
USER nodejs

# Exponer el puerto
EXPOSE 3001

# Configurar healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001health || exit 1

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]