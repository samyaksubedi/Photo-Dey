# Deploying Photo Dey on Coolify

Photo Dey needs seven application processes: the public Node API, two Node queue workers, an internal AI health service, three Python AI workers, and the Vite web app. It also needs PostgreSQL, Redis, Qdrant, Cloudinary, Gmail, and Telegram. Deploy the private infrastructure and workers before the web app. This guide uses `https://api.example.com` and `https://app.example.com`; replace them with your own domains.

## 1. Data services and shared upload storage

1. In one Coolify project, create private **PostgreSQL 17**, **Redis 7**, and **Qdrant** services.
2. Set a strong Redis password and Qdrant API key, then copy their **internal** URLs.
3. Enable daily Postgres backups to storage outside the VPS, keep at least 14 days, and test a scratch restore.
4. The API and upload worker exchange temporary files. Add the same storage mapping to both: host path `/data/photodey/uploads`, container path `/app/uploads`. Without this shared mount, uploads accepted by the API cannot be processed by the upload worker.
5. Do not give Postgres, Redis, Qdrant, or AI workers public domains.

## 2. Node API application

| Setting | Value |
| --- | --- |
| Source | This Git repository, branch `main` |
| Build pack | Dockerfile |
| Base directory | `/server/api` |
| Dockerfile location | `Dockerfile` |
| Port | `3000` |
| Domain | `https://api.example.com` |
| Health check path | `/` |
| Auto deploy | On push to `main` |
| Persistent storage | `/data/photodey/uploads:/app/uploads` |

The Dockerfile generates Prisma code at build time and runs `prisma migrate deploy` before the server starts. A migration failure prevents the replacement container from serving traffic.

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CLIENT_URL` | `https://app.example.com` |
| `SERVER_URL` | `https://api.example.com` |
| `DATABASE_URL` | The internal PostgreSQL URL |
| `REDIS_URL` | The internal Redis URL, including the password |
| `WORKER_CONCURRENCY` | Start with `1` or `2`, then increase only after observing memory use |
| `QDRANT_URL` | Internal Qdrant HTTP URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `ACCESS_TOKEN_SECRET` | `openssl rand -hex 32` |
| `AI_WEBHOOK_SECRET` | `openssl rand -hex 32`; use the exact same value in every Python AI service |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Gmail address and app password |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 32` |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `TELEGRAM_BOT_USERNAME` | Bot username, for example `photodeybot` |

## 3. Node queue workers

Create two more Coolify applications with the same source, image settings, and all API environment variables. They must use the same internal Postgres/Redis services. The upload worker must also use the shared upload storage mapping.

| Worker | Base directory | Start command | Storage |
| --- | --- | --- | --- |
| Upload worker | `/server/api` | `npm run worker:upload` | `/data/photodey/uploads:/app/uploads` |
| Email worker | `/server/api` | `npm run worker:email` | None |

Use Dockerfile build pack and `Dockerfile` location for both. Do not assign a port, domain, or HTTP health check: workers are intentionally long-running queue consumers.

## 4. Python AI health service and workers

Use the existing `server/ai/Dockerfile` to create four applications. The image contains the native libraries required by InsightFace. Give every Python application the following variables:

| Variable | Production value |
| --- | --- |
| `REDIS_URL` | The same internal Redis URL |
| `QDRANT_URL` | Internal Qdrant HTTP URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `QDRANT_COLLECTION` | `photo_faces_v1` |
| `NODE_API_URL` | Node API internal URL, for example `http://<coolify-internal-api-host>:3000` |
| `AI_WEBHOOK_SECRET` | The exact value from the Node API |
| `FACE_MODEL_NAME` | `buffalo_l` |
| `FACE_MODEL_ROOT` | `/app/models` |
| `WORKER_CONCURRENCY` | `1` initially |
| `LOG_LEVEL` | `INFO` |

| Application | Base directory | Start command | Port / health check |
| --- | --- | --- | --- |
| AI health service | `/server/ai` | `python main.py` | Port `8000`, `/ready`, internal only |
| Face-index worker | `/server/ai` | Leave the Dockerfile default | None |
| Face-search worker | `/server/ai` | `python -m app.workers.search_worker` | None |
| Cleanup worker | `/server/ai` | `python -m app.workers.cleanup_worker` | None |

All four use Dockerfile build pack and `Dockerfile` location. Add a persistent `/app/models` storage mount to the two face workers if you want to retain the downloaded InsightFace model between rebuilds. These workers are CPU and memory intensive; start with a single replica each.

## 5. Web application

Create the web application after `https://api.example.com/` returns healthy.

| Setting | Value |
| --- | --- |
| Source | This Git repository, branch `main` |
| Build pack | Dockerfile |
| Base directory | `/client/web` |
| Dockerfile location | `Dockerfile` |
| Port | `80` |
| Domain | `https://app.example.com` |
| Health check path | `/` |
| Auto deploy | On push to `main` |

Set this **build variable** before deployment. Vite embeds it into the generated static assets, so a change needs a new web deployment.

| Variable | Production value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://api.example.com/api/v1` |

## 6. Check it

- `https://api.example.com/` returns `{"status":"Healthy"}`.
- The internal AI health service's `/health` returns `{"status":"healthy"}` and `/ready` returns `{"status":"ready"}` after Redis and Qdrant connect.
- Register an organizer, create an event, upload a small batch, and confirm every photo reaches completed status.
- Use the Telegram bot with a test event, then verify that a guest selfie produces a gallery result.
