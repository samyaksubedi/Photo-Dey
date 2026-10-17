FROM node:22-bookworm-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
