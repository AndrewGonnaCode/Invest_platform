FROM node:20-alpine AS builder 
WORKDIR /app 

# Копируем только package files для кэширования npm ci
COPY package*.json ./ 
RUN npm ci 

# Копируем конфиги для сборки
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Только потом копируем исходники
COPY src ./src
RUN npm run build 

FROM node:20-alpine 
WORKDIR /app 

# Снова копируем package files
COPY package*.json ./ 
RUN npm ci --production 

# Копируем собранный код
COPY --from=builder /app/dist ./dist 

ENV NODE_ENV=production 
EXPOSE 3000 
CMD ["node", "dist/main.js"]