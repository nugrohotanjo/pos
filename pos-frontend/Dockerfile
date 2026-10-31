# Tahap 1: Build aplikasi React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Tahap 2: Serve dengan Nginx
FROM nginx:alpine

# Salin konfigurasi Nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build Vite/React ke root direktori Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
