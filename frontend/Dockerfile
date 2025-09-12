# Etapa de construcción
FROM node:20-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del frontend
COPY . .

# Construir la app de React
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar los archivos build a la carpeta que Nginx sirve
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
