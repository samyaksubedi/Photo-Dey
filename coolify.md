# Deploying the backend on Coolify

Everything except the web app runs on your VPS through Coolify: PostgreSQL, Redis, Qdrant, the API, the
upload and email workers, and the three Python AI workers. The web app runs on Vercel (see
[vercel.md](vercel.md)). Deploy the backend first, because the web app needs the API URL.

This guide uses `api.photodey.com` (API) and `photodey.com` (web app). Swap in your own domains if they differ.

## What runs where

| #   | Coolify resource | Type                              | Process / image         | Public domain          |
| --- | ---------------- | --------------------------------- | ----------------------- | ---------------------- |
| 1   | `photodey-db`    | PostgreSQL 17 database            | Coolify-managed         | No                     |
| 2   | `photodey-redis` | Redis database                    | Coolify-managed         | No                     |
| 3   | `photodey-qdrant`| Docker Compose (empty)            | `qdrant/qdrant`         | No                     |
| 4   | `photodey-api`   | Application (Dockerfile)          | `PROCESS=api`           | `https://api.photodey.com` |
| 5   | `photodey-upload`| Application (Dockerfile)          | `PROCESS=upload`        | No                     |
| 6   | `photodey-email` | Application (Dockerfile)          | `PROCESS=email`         | No                     |
| 7   | `photodey-ai`    | Application (Dockerfile)          | `WORKER=ai`             | No                     |
| 8   | `photodey-search`| Application (Dockerfile)          | `WORKER=search`         | No                     |
| 9   | `photodey-cleanup`| Application (Dockerfile)         | `WORKER=cleanup`        | No                     |

Put all nine in **one Coolify project and one environment**, on the same server and destination (the
default `coolify` network). Resources in the same destination reach each other by name; nothing but the API
needs a public domain.

How the pieces talk to each other:

```text
Browser (Vercel) ──https──▶ photodey-api ──▶ Postgres, Redis (BullMQ queues)
                                │
Telegram ──webhook──────────────┘            photodey-upload  ──▶ Cloudinary, then queue-ai
                                             photodey-email   ──▶ Gmail
                                             photodey-ai      ──▶ downloads photo from Cloudinary, Qdrant, then calls API
                                             photodey-search  ──▶ Qdrant, then calls API
                                             photodey-cleanup ──▶ Qdrant
```

The AI workers report results by calling the API's public URL (`/api/v1/ai/...`) with the shared
`AI_WEBHOOK_SECRET`.

> **Never deploy the Node `worker:ai` and `worker:search` scripts** (`package.json`). They are empty test
> stubs that take jobs off the queues the Python workers own and mark them done without doing anything.
> The API image deliberately has no way to start them.

## 0. Before you start

1. **VPS.** A Hostinger KVM 2 (2 vCPU, 8 GB RAM) is enough for everything. The two face workers use 1 to 2 GB
   each, and builds (Python, TypeScript) spike memory, so add swap once:

   ```sh
   sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Host folders** shared between containers (created once, on the VPS):

   ```sh
   sudo mkdir -p /data/photodey/uploads /data/photodey/models
   ```

3. **DNS.** Create an `A` record `api` → your VPS IP (Cloudflare: set it to **DNS only**, grey cloud, or the
   100 MB request cap and extra proxy hop will cause upload trouble). The `photodey.com` and `www` records
   are created in Vercel (see [vercel.md](vercel.md)).
4. **Accounts and keys** you need ready: Cloudinary (cloud name, API key, API secret), a Gmail address with an
   [app password](https://myaccount.google.com/apppasswords), and a Telegram bot token and username from
   `@BotFather`.
5. **Secrets.** Generate these four once and keep them in a password manager. You paste them into several
   resources, and `AI_WEBHOOK_SECRET` must be identical everywhere:

   ```sh
   openssl rand -hex 32   # ACCESS_TOKEN_SECRET
   openssl rand -hex 32   # AI_WEBHOOK_SECRET
   openssl rand -hex 32   # TELEGRAM_WEBHOOK_SECRET
   openssl rand -hex 32   # QDRANT_API_KEY
   ```

## 1. PostgreSQL

1. Create a **PostgreSQL 17** database named `photodey-db` in the project. Leave "Make it publicly available" **off**.
2. Copy its **internal** connection URL. This is `DATABASE_URL` below.
3. Turn on **scheduled backups** to an S3-compatible bucket outside the VPS (daily, keep at least 14).
4. Before launch, restore one backup into a scratch database once, to prove backups work.

## 2. Redis

1. Create a **Redis** database named `photodey-redis`. Keep it private.
2. Copy its **internal** URL, which includes the password. This is `REDIS_URL` below.
3. Check that its eviction policy is `noeviction` (the Redis default). BullMQ loses jobs under any other policy.

## 3. Qdrant

Qdrant stores the face vectors. It is not in Coolify's database list, so deploy it from a tiny compose file.

1. In the project choose **New resource → Docker Compose (Empty)** and name it `photodey-qdrant`.
2. Paste this compose file:

   ```yaml
   services:
     qdrant:
       image: qdrant/qdrant:latest
       container_name: photodey-qdrant
       restart: unless-stopped
       environment:
         - QDRANT__SERVICE__API_KEY=${QDRANT_API_KEY}
       volumes:
         - qdrant_data:/qdrant/storage
   volumes:
     qdrant_data:
   ```

3. Add the environment variable `QDRANT_API_KEY` (the value you generated in step 0).
4. In the resource's **Advanced** settings, turn on **Connect To Predefined Network**. Without it the other
   resources cannot see Qdrant. Do not add a domain. Deploy.
5. The internal address for the other resources is now `http://photodey-qdrant:6333`. This is `QDRANT_URL` below.
   Once it works, replace `latest` with the exact version that Qdrant logs on start, so a future upgrade is your choice.

> The Python client prints a warning about sending an API key over `http`. That is expected on the private
> network. Qdrant must stay unexposed.

## 4. The API application

Create a new **Application** from the Git repository, branch `main`, named `photodey-api`.

| Setting             | Value                                                              |
| ------------------- | ------------------------------------------------------------------ |
| Build pack          | Dockerfile                                                         |
| Base directory      | `/server/api`                                                      |
| Dockerfile location | `/Dockerfile`                                                      |
| Ports exposes       | `3000`                                                             |
| Domain              | `https://api.photodey.com`                                         |
| Health check path   | `/`  (returns `{"status":"Healthy"}`; turn the health check on)    |
| Auto deploy         | On push to `main`                                                  |
| Watch paths         | `server/api/**` (if your Coolify shows the field, so Python or web commits don't rebuild the API) |
| Persistent storage  | **Directory mount** `/data/photodey/uploads` → `/app/uploads`     |

You don't need a pre-deploy command. When the container starts, `PROCESS=api` applies any pending database
migrations (`prisma migrate deploy`) and then starts the server. If a migration fails, the new container stops
and the old one keeps serving.

The API also stops on start if Postgres, Redis or Cloudinary can't be reached, so a wrong value shows up in the
deployment log straight away.

### Environment variables

Open the application's **Environment Variables → Developer view** and paste the whole block, filling in the values.
You'll reuse this same block for the upload and email workers.

| Variable                  | Production value                                                              |
| ------------------------- | ----------------------------------------------------------------------------- |
| `PROCESS`                 | `api`                                                                         |
| `NODE_ENV`                | `production`                                                                  |
| `PORT`                    | `3000`                                                                        |
| `CLIENT_URL`              | `https://photodey.com` (exactly what the browser shows: no trailing slash, and not `www`, see [vercel.md](vercel.md)) |
| `SERVER_URL`              | `https://api.photodey.com`                                                    |
| `DATABASE_URL`            | The internal URL from step 1                                                  |
| `REDIS_URL`               | The internal URL from step 2                                                  |
| `WORKER_CONCURRENCY`      | `2`                                                                           |
| `ACCESS_TOKEN_SECRET`     | The secret you generated                                                      |
| `AI_WEBHOOK_SECRET`       | The secret you generated. Put the **same** value in all three AI workers.     |
| `TELEGRAM_WEBHOOK_SECRET` | The secret you generated                                                      |
| `TELEGRAM_BOT_TOKEN`      | From BotFather                                                                |
| `TELEGRAM_BOT_USERNAME`   | The bot's username, for example `photodeybot`                                 |
| `GMAIL_USER`              | The Gmail address                                                             |
| `GMAIL_APP_PASSWORD`      | The Gmail app password (16 characters, no spaces)                             |
| `CLOUDINARY_CLOUD_NAME`   | From the Cloudinary console                                                   |
| `CLOUDINARY_API_KEY`      | From the Cloudinary console                                                   |
| `CLOUDINARY_API_SECRET`   | From the Cloudinary console                                                   |

`CLIENT_URL` is the one and only origin the API allows through CORS, and it is baked into verification emails,
gallery links and Telegram messages. It must be the exact address people use. The API reads no other variables
(it does not use Qdrant, so `QDRANT_*` isn't needed here).

Deploy, then check `https://api.photodey.com/` returns `{"status":"Healthy"}` before going on.

## 5. The Node workers

Create two more applications from the **same repository**, with exactly the same settings as step 4, except:

| Setting            | `photodey-upload`                            | `photodey-email` |
| ------------------ | -------------------------------------------- | ---------------- |
| Domain             | **Empty**                                    | **Empty**        |
| Health check       | **Off**                                      | **Off**          |
| Persistent storage | `/data/photodey/uploads` → `/app/uploads`    | None             |
| `PROCESS`          | `upload`                                     | `email`          |

Every other environment variable is the same as the API, because the app validates all of them on start.

> **The upload worker and the API must mount the same uploads folder.** The API saves each photo (and each
> Telegram selfie, in `uploads/telegram`) to disk, then queues a job holding the file path. The upload worker
> reads that file, sends it to Cloudinary and deletes it. Without the shared mount, every upload fails with
> `ENOENT` and photos end up `FAILED`.

Workers have no port and no health check, so the deploy shows as running as soon as the container starts.
Watch the first log lines of each to confirm it started.

## 6. The Python AI workers

Create three more applications from the same repository. They use the same Dockerfile and differ only in `WORKER`.

| Setting             | Value                           |
| ------------------- | ------------------------------- |
| Build pack          | Dockerfile                      |
| Base directory      | `/server/ai`                    |
| Dockerfile location | `/Dockerfile`                   |
| Domain / health check | **None**                      |
| Watch paths         | `server/ai/**`                  |

| Application        | `WORKER`  | Persistent storage                          | Resource limit |
| ------------------ | --------- | ------------------------------------------- | -------------- |
| `photodey-ai`      | `ai`      | `/data/photodey/models` → `/app/models`     | Memory 2 GB    |
| `photodey-search`  | `search`  | `/data/photodey/models` → `/app/models`     | Memory 2 GB    |
| `photodey-cleanup` | `cleanup` | None                                        | Memory 512 MB  |

Environment variables (identical for all three except `WORKER`):

| Variable             | Production value                                                    |
| -------------------- | ------------------------------------------------------------------- |
| `WORKER`             | `ai`, `search` or `cleanup`                                         |
| `REDIS_URL`          | The same internal URL as the API                                    |
| `QDRANT_URL`         | `http://photodey-qdrant:6333`                                       |
| `QDRANT_API_KEY`     | The Qdrant key from step 3                                          |
| `QDRANT_COLLECTION`  | `photo_faces_v1`                                                    |
| `NODE_API_URL`       | `https://api.photodey.com` (host only, **no** `/api/v1` and no trailing slash) |
| `AI_WEBHOOK_SECRET`  | The exact value from the API                                        |
| `FACE_MODEL_NAME`    | `buffalo_l`                                                         |
| `FACE_MODEL_ROOT`    | `/app/models`                                                       |
| `WORKER_CONCURRENCY` | `1`                                                                 |
| `LOG_LEVEL`          | `INFO`                                                              |

**First start.** The face model (about 280 MB) downloads from GitHub the first time a face worker starts. Both
face workers share the `/app/models` folder, so deploy `photodey-ai` first, wait for its log to show
`Worker started`, and only then deploy `photodey-search`, otherwise they download into the same folder at the
same time. After that the model is cached on the VPS and survives every redeploy.

An optional fourth process, `WORKER=health`, serves `/health` and `/ready` on port 8000. Nothing needs it, so
skip it unless you want a readiness endpoint to point a monitor at.

## 7. Connect Telegram

The API doesn't register its own webhook, so tell Telegram once where to send messages. Run this from any
terminal (your own computer is fine), with the real bot token and `TELEGRAM_WEBHOOK_SECRET`:

```sh
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://api.photodey.com/api/v1/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["message"]'
```

✅ It replies `{"ok":true,"result":true,"description":"Webhook was set"}`.
Check later with `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`: `last_error_message` should
be empty.

A bot has only one webhook. If you used this same bot with a tunnel during development, this call replaces it,
so create a second bot (with its own token) for local work.

## 8. Deploy the web app

Follow [vercel.md](vercel.md), then come back for step 9.

## 9. Create your admin account

Admins aren't created in the app. Sign up on the site, open the verification email and confirm, then open the
`photodey-api` container's **Terminal** in Coolify and run:

```sh
node scripts/promote-admin.mjs you@example.com
```

✅ It prints `Promoted you@example.com to admin. Existing sessions were revoked.` Log in again afterwards.

## 10. Check it

- `https://api.photodey.com/` returns `{"status":"Healthy"}`.
- In the `photodey-api` Terminal, `getent hosts photodey-qdrant` prints an address (Qdrant is reachable).
- The logs of `photodey-ai`, `photodey-search`, `photodey-cleanup`, `photodey-upload` and `photodey-email` each show a
  started message and no repeating errors.
- On the live site: register, receive the verification email, log in, **reload the page** (you should stay logged in).
- Create an event and upload a small batch of photos with faces. Every photo should move to completed.
- Open the event's QR link, tap through to the bot, send a selfie, and confirm the bot replies with a gallery link
  that shows your matches.

## Updating

- Pushing to `main` redeploys the apps whose watch paths changed. If you change the Prisma schema, only
  `photodey-api` migrates, on its next start. Workers don't migrate.
- A change to the shared secrets (`AI_WEBHOOK_SECRET` and so on) needs a redeploy of **every** resource that holds it.
- Backups. Postgres is covered by step 1. The photos themselves live in Cloudinary. Qdrant holds only derived
  vectors, but rebuilding them means re-indexing every photo, so back up the Qdrant volume too (a periodic
  Coolify volume backup, or a Qdrant snapshot) before it holds data you care about.

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| Login works, but reloading the page logs you out | `CLIENT_URL` or the web domain doesn't match. The refresh cookie is `SameSite=strict`, so the web app and API must share a parent domain (`photodey.com` and `api.photodey.com`). A `*.vercel.app` address will not work. |
| Browser shows a CORS error | `CLIENT_URL` isn't exactly the address in the browser (`www` vs apex, `http` vs `https`, trailing slash). |
| Photos stay on "processing" forever | `photodey-ai` isn't running, or its log shows `401` from the API: `AI_WEBHOOK_SECRET` differs, or `NODE_API_URL` is wrong (it must not include `/api/v1`). |
| Photos turn `FAILED` straight after upload | The upload worker and API don't share the uploads mount (`ENOENT` in the upload log), or the Cloudinary keys are wrong. |
| Telegram bot never answers | Webhook not set, or the secret differs. Read `last_error_message` from `getWebhookInfo`. |
| Selfie sent, no gallery link | `photodey-search` isn't running, or can't reach Qdrant or the API. Check its log. |
| `Connection refused` or unknown host for Qdrant | **Connect To Predefined Network** is off on the Qdrant resource, or the apps are in a different destination or environment. |
| An AI worker keeps restarting | Out of memory. Check swap, keep `WORKER_CONCURRENCY=1`, or raise the memory limit. |
| Build killed or fails with `Killed` | The VPS ran out of memory while building. Make sure swap is on, and don't deploy several builds at once. |
