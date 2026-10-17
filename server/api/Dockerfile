# Photo Dey API image. One image runs three different processes, picked by the PROCESS env var
# (see docker-entrypoint.sh):  api (default) | upload | email
# In Coolify: base directory "/server/api", Dockerfile location "Dockerfile".
FROM node:22-bookworm-slim

# Prisma's query engine needs OpenSSL, which the slim image does not include.
RUN apt-get update \
    && apt-get install --no-install-recommends -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# prisma.config.ts insists on DATABASE_URL even for `prisma generate`, which never connects.
# The throw-away value below is used for this one command only and is not stored in the image.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
    && npm run build \
    && sed -i 's/\r$//' docker-entrypoint.sh \
    && mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "/app/docker-entrypoint.sh"]
