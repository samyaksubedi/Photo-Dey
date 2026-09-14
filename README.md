# Photo Dey

> An app that allows users to find their photos in an album created at a big event by sending a selfie to Telegram.

Observe the flow of the product: [Watch the product flow](https://youtu.be/xN10KU_Cz9A)

## Why I built this

I went to Singapore with a team of Hack Clubbers and when we got home we had over a thousand photos. Everyone wanted the pictures in which they appeared but it was slow and frustrating to do that many images manually. That's the problem I am looking to solve with Photo Dey.

`Dey` means “give” in Nepali. An organizer uploads an event album once, then asks each guest to take a picture and send it to the Photo Dey Telegram bot, after which they will get an album with their own photo(s) as well.

## What it does

- Allows organizers to create events and upload event photos.
- Processes uploads in the background, meaning that an event can be created without having to wait for face indexing to complete.
- Makes an event QR code usable after processing, so it can be given to event attendees.
- Sends guests from the QR invitation to the Telegram bot.
- Compares a guest selfie to faces identified in the event album.
- Provides guests with a private gallery to choose from and download their pictures in bulk.
- Provides live photo processing counts for organizers to view and the ability to turn off public guest access at any time.

## How it works

```text
Organizer uploads event photos
        |
        v
API stores upload jobs in Redis / BullMQ
        |
        v
Cloudinary upload + Python AI workers detect faces and store embeddings in Qdrant
        |
        v
Organizer shares the generated event QR code
        |
        v
Guest scans QR code -> opens Telegram bot -> sends a selfie
        |
        v
Face-search worker finds matching event photos
        |
        v
Telegram bot sends the guest's personal gallery link
```

## Screenshots

| Create an event | |
| --- | --- |
| ![Create an event](assets/newEvent.png) | |

| Event QR and status | Guest invitation |
| --- | --- |
| ![Event details](assets/events.png) | ![Guest invitation](assets/guestInvitation.png) |

| Hand-off to Telegram | Personal gallery |
| --- | --- |
| ![Telegram bot conversation](assets/telegrambotchat.png) | ![Personal gallery](assets/gallery.png) |

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query |
| API | Node.js, Express 5, TypeScript, Prisma, and PostgreSQL |
| Background jobs | BullMQ and Redis |
| AI service | Python, FastAPI, InsightFace, and ONNX Runtime |
| Face-vector search | Qdrant with cosine similarity |
| Image storage | Cloudinary |
| Guest workflow | Telegram Bot API |
| Local infrastructure | Docker Compose |



## How I built it and what problems I solved

The Photo Dey application is divided into three parts: a React front end, a TypeScript/Express API, and a Python AI service. This separation ensures the normal product workflow is not dependent on the costly face-processing work.

Large uploads do not need to block the organizer, as event creation is done as soon as the files are received, and BullMQ workers upload images, index faces and update processing status in the background.
There can be lots of different faces on a photo album. The AI workers process each photo and identify faces, generate an embedding using InsightFace and save it to Qdrant, to allow for efficient comparison with a guest photo taken during the event.
Guests should have an easy way to their own pictures. A QR code opens an event invitation and then redirects an event guest to Telegram to take a selfie, which is then followed by the delivery of an event personalized gallery link.
When sharing an event, the organizers can turn off the public search, disabling the possibility of any new searches for guests (even if they have the QR code in their possession).
The components are: PostgreSQL manages the app data, Redis and BullMQ manage the asynchronous jobs, Cloudinary stores the images, and the face vectors are stored in Qdrant.

## Project structure

```text
Photo Dey/
├── client/web/       # React web app for organizers and guest galleries
├── server/api/       # Express API, Prisma schema, queues, and Telegram integration
├── server/ai/        # Python workers for face indexing, face search, and cleanup
├── assets/           # README screenshots
├── bruno-api-tests/  # Bruno collections for API testing
└── docker-compose.yml
```

## Run locally

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ and npm
- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [Cloudinary](https://cloudinary.com/) credentials
- Gmail account with an app password (for email)
- A Telegram bot token

### 1. Clone the project

```bash
git clone https://github.com/samyaksubedi/Photo-Dey.git
cd "Photo Dey"
```

### 2. Run PostgreSQL, Redis and Qdrant.

```bash
docker compose up -d
```

Starts the PostgreSQL server at `localhost:5433`, Redis at `localhost:6379`, and Qdrant at `localhost:6333`.

### 3. Configure environment variables

Before filling in the values of the examples, copy them.

```bash
cp server/api/.env.example server/api/.env
cp server/ai/.env.example server/ai/.env
cp client/web/.env.example client/web/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item server/api/.env.example server/api/.env
Copy-Item server/ai/.env.example server/ai/.env
Copy-Item client/web/.env.example client/web/.env
```

If you are running locally, configure these in `server/api/.env`:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
DATABASE_URL=postgresql://photodey:photodey123@localhost:5433/photodey_dev?schema=public
REDIS_URL=redis://:photodeyredis123@localhost:6379
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=photodey_qdrant_key
```

Next, insert the necessary secrets and third party credentials as specified in the example file, ensuring that the value of `AI_WEBHOOK_SECRET` is the same in both `server/api/.env` and `server/ai/.env`. In `client/web/.env`, use:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

> Do not push `production credentials` or `.env` files.

### 4. Start the API and the API's Node workers!

In different terminals:

```bash
cd server/api
npm ci
npx prisma migrate dev
npm run dev
```

```bash
cd server/api
npm run worker:upload
```

```bash
cd server/api
npm run worker:email
```

### 5. Always start the AI workers.

Install the Python requirements:

```bash
cd server/ai
uv sync
```

Then start each worker in its own terminal:

```bash
uv run python -m app.workers.ai_worker
```

```bash
uv run python -m app.workers.search_worker
```

```bash
uv run python -m app.workers.cleanup_worker
```

### 6. Start the web app

```bash
cd client/web
npm ci
npm run dev
```

Open the following URL in the terminal, typically `http://localhost:5173`.

Build the frontend for production.

```bash
cd client/web
npm run build
```

The production assets are created in `client/web/dist`.

## Running tests

```bash
# API tests
cd server/api
npm test

# AI tests
cd ../ai
uv run pytest
```
## Important implementation details

The API accepts event photos first, then queues Cloudinary uploads and face indexing.
- The AI service detects faces with InsightFace's `buffalo_l` model, stores face embeddings in Qdrant, and uses similarity search to find a guest's matching images.
- Photo matching and email delivery are handled asynchronously, maintaining API responsiveness for organizers.
- Disabling public access prevents new guest searches, even if a guest already has the QR code.
- During development, expose the API with an HTTPS tunnel and set `SERVER_URL` to the tunnel URL to receive Telegram webhook updates.

## AI disclosure

As a development assistant, I have utilized ChatGPT and Claude for learning new concepts in backend, debugging, creating frontend components and organizing some test files in the `server/ai` folder. The project design, decisions on implementation and the code were developed and reviewed by the project author that is me (Samyak Subedi).

## Future improvements

- Include additional organizer metrics for searches, downloads and processing errors.
- Allow for other delivery methods (other than Telegram).
- Add automatic clean-up and retention features for event photos and face vectors.
- Enhance the experience of matching with guests for unclear or poor quality selfies.
