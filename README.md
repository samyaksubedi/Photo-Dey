# PhotoDey - An event photo discovery/delivery platform 
![alt text](assets/logo.png)

## Problem Statement and Motivation

I rencently got chance to visit Singapore for a teen hackathon powered by hackclub and me and my team(3 guys) spent a week there . We visited many attractions places and clicked many pictures (around 1000) . Now after that mini trip when we came back to our home country . The  biggest problem was "please send me the photos where im in !" and from that (~ 1000 +) photos it was very hard to sort and send everyone theirs only   photos . 


## Project Overview
Introducing to you all **Photo Dey** where "Dey" means "give" in Nepali Language . So as an Event Organizer you upload a bunch of photos of your event in my app's web portal . And after fully processing of all of your uploaded event photos , you get an QR which you can share with your friends or your event attendees . Once they scan the QR they will be redirected to the official photodey telegram bot **@photodeybot** and there the bot will prompt the user to send a selfie of them and within ~3 seconds my app will create a gallery and send the gallery link via telegram bot . Finally the user gets all of his photos and can download all of his photos or can select them to download .   


## Application Flow

[▶ Watch Video Flow](https://youtu.be/xN10KU_Cz9A)

- Initially you will see the landing page and you should authenticate yourself to create an Event ! 

![alt text](assets/hero.png)
- In Overview you will see all of your existing events and it's metadatas .

![alt text](assets/overview.png)
- Start by creating a fresh new Event by uploading all of the existing event photos .

![alt text](assets/newEvent.png)
- After event photo is **100 %** processed you will then receive an QR which you can share with all of the guest / attende .

![alt text](assets/events.png)
- On scanning the QR you will see this page . This is kinda an invitation for the events to sort out each guest photo .

![alt text](assets/guestInvitation.png)
- On clicking the **Find** buton you would be redirected to open telegram bot channel .

![alt text](assets/openTelegramPopup.png)
- Once you follow the instructions given by the bot and send your selfie there , you will receive a personalized gallery link .

![alt text](assets/telegrambotchat.png)
- On clicking the gallery link you will only see your photos from the whole event album . You can download all at bulk or you can simply select the photo you like and can dowload the selected photos .

![alt text](assets/gallery.png) 


## Interesting Feature
- Event Organizer can turn on / off public access . If public access is off no any guest can search their photo even if they have the QR , unitil and unless the organizer turns it back on !  

![alt text](assets/publicAccess.png)

- Live photo processing stats will be shown in the dashboard after creating the event .

- User only waits for the api response until all photos reach to the server ,
After all photos reachs to the server he will get a immediate response that the event is created and is in processing . All the face embeddings and all cloudinary uploading takes place in backgroud ! .  

## Backend Features / Logic 

### My Backend has two part archetracture 
- API Server - Handles authentication , events , photo uploads , galleries , access control , QR codes , and Telegram bot communication .

- AI Server - Detects faces , generates face embeddings , and matches a guest's selfie with event photos .

### Background job queues 
- Heavy tasks such as image uploading, face detection, embedding generation, and photo matching run asynchronously.

### Fast event creation 
- The API responds quickly once photos reach to the server ; the remaining processing continues in the background.

### Photo processing pipeline
- Uploads event photos to cloud storage.
- Detects faces in every photo.
- Generates and stores facial embeddings.
- Updates each photo's processing status.

### Live processing progress
- Organizers can see real time orocessed , pending and failed pphoto counts from the dashboard.

### QR based event access
- A unique QR code is generated after the event photos finish processing.

### Telegram bot integration
- The bot receives a guest's selfie.
- Auto identiies the event.
- Backend internally requests an AI search (sends the job to ai-search queue so that the  ai worker can pick it up)
- Finally , it returns a personalized gallery link.

###  Face based photo search
-  The guest's selfie embedding is compared against the event's stored face embeddings to find matching photos.

### Public-access control
- Organizers can enable or disable guest searches at any time, even after sharing the QR code.

### Failure handling
- Failed background jobs can be tracked and retried without requiring the organizer to upload every photo again.

### Scalable processing
- The API and AI services can scale independently, allowing multiple events and large photo collections to be processed concurrently.

## Server Architecture

```text
server/
├── api/                                      # TypeScript / Node.js / Express API
│   ├── prisma/
│   │   ├── schema.prisma                     # PostgreSQL database schema
│   │   └── migrations/                       # Database migration history
│   │
│   ├── uploads/                              # Temporary uploaded-photo storage
│   │   └── .gitkeep
│   │
│   ├── src/
│   │   ├── app.ts                            # Express middleware and routes
│   │   ├── server.ts                         # API entry point and startup checks
│   │   │
│   │   ├── configs/
│   │   │   ├── env.config.ts                 # Environment-variable validation
│   │   │   ├── logger.config.ts              # Winston logger configuration
│   │   │   ├── mail.config.ts                # Nodemailer configuration
│   │   │   ├── redis.config.ts               # Redis/BullMQ connection
│   │   │   └── cloudinary.config.ts          # Cloudinary storage client
│   │   │
│   │   ├── db/
│   │   │   └── db.client.ts                  # Prisma database client
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts            # JWT authentication
│   │   │   ├── authorization.middleware.ts   # Role-based authorization
│   │   │   ├── ai.webhook.middleware.ts      # AI callback verification
│   │   │   ├── telegram.webhook.middleware.ts # Telegram webhook verification
│   │   │   ├── upload.middleware.ts          # Multer photo uploads
│   │   │   ├── validate.middleware.ts        # Zod request validation
│   │   │   └── error.middleware.ts           # Global error handling
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                         # Authentication and sessions
│   │   │   ├── events/                       # Event creation and management
│   │   │   ├── photos/                       # Event-photo management
│   │   │   ├── public-events/                # Public invitation access
│   │   │   ├── telegram/                     # Telegram bot workflow
│   │   │   ├── search-request/               # Guest selfie search requests
│   │   │   ├── galleries/                    # Personalized photo galleries
│   │   │   ├── ai/                           # AI status callback endpoints
│   │   │   └── admin/                        # Administrative operations
│   │   │
│   │   ├── jobs/                             # BullMQ background jobs
│   │   │   ├── upload/
│   │   │   │   ├── upload.queue.ts           # Upload queue definition
│   │   │   │   ├── upload.producer.ts        # Adds photo/selfie upload jobs
│   │   │   │   └── upload.worker.ts          # Uploads images to Cloudinary
│   │   │   │
│   │   │   ├── email/
│   │   │   │   ├── email.queue.ts            # Email queue definition
│   │   │   │   ├── email.producer.ts         # Adds email jobs
│   │   │   │   └── email.worker.ts           # Sends emails asynchronously
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── ai.queue.ts               # Face-indexing queue
│   │   │   │   ├── ai.producer.ts            # Adds photo-indexing jobs
│   │   │   │   └── ai.worker.ts              # Development/test worker
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── search.queue.ts           # Face-search queue
│   │   │   │   ├── search.producer.ts        # Adds selfie-search jobs
│   │   │   │   └── search.worker.ts          # Development/test worker
│   │   │   │
│   │   │   └── ai-cleanup/
│   │   │       ├── ai-cleanup.queue.ts       # Vector-cleanup queue
│   │   │       └── ai-cleanup.producer.ts    # Adds event-cleanup jobs
│   │   │
│   │   ├── utils/                            # API, email and file helpers
│   │   └── types/                            # Custom TypeScript declarations
│   │
│   ├── tests/                                # API tests
│   ├── .env.example                          # API environment template
│   ├── package.json                          # Dependencies and scripts
│   ├── tsconfig.json                         # TypeScript configuration
│   └── prisma.config.ts                      # Prisma configuration
│
└── ai/                                       # Python / FastAPI / InsightFace
    ├── main.py                               # AI service entry point
    ├── pyproject.toml                        # Python dependencies
    ├── uv.lock                               # Locked dependencies
    ├── Dockerfile                            # AI container configuration
    ├── README.md                             # AI-service documentation
    ├── .env.example                          # AI environment template
    │
    ├── app/
    │   ├── main.py                           # FastAPI application lifecycle
    │   ├── config.py                         # Pydantic settings
    │   ├── schemas.py                        # Job and callback schemas
    │   ├── errors.py                         # AI-specific exceptions
    │   │
    │   ├── api/
    │   │   └── health.py                     # Health/readiness endpoint
    │   │
    │   ├── clients/
    │   │   ├── backend.py                    # Sends results to the API server
    │   │   ├── images.py                     # Downloads temporary images
    │   │   ├── vectors.py                    # Qdrant storage and search
    │   │   └── state.py                      # Redis processing state
    │   │
    │   ├── services/
    │   │   ├── face_engine.py                # Face detection and embeddings
    │   │   ├── photo_indexer.py              # Indexes event-photo faces
    │   │   ├── face_search.py                # Matches selfies with event photos
    │   │   └── event_cleanup.py              # Deletes event face vectors
    │   │
    │   ├── workers/
    │   │   ├── ai_worker.py                  # Consumes face-indexing jobs
    │   │   ├── search_worker.py              # Consumes face-search jobs
    │   │   ├── cleanup_worker.py             # Consumes cleanup jobs
    │   │   ├── runner.py                     # Shared BullMQ worker runner
    │   │   ├── runtime.py                    # AI model/client lifecycle
    │   │   └── helpers.py                    # Retry and callback helpers
    │   │
    │   └── utils/                            # Identifier and logging helpers
    │
    └── tests/                                # AI and interoperability tests
```

## Queue Responsibilities

- `queue-upload` uploads event photos and Telegram selfies to Cloudinary.
- `queue-email` sends verification and welcome emails asynchronously.
- `queue-ai` sends uploaded event photos to Python workers for face detection and embedding generation.
- `queue-search` sends guest selfies to Python workers for face matching.
- `queue-ai-cleanup` deletes stored face vectors when an event is removed.

## Supporting Services

- **PostgreSQL** stores users, sessions, events, photos, searches, and gallery matches.
- **Redis** powers BullMQ queues and stores temporary AI-processing state.
- **Qdrant** stores 512-dimensional face embeddings and performs similarity searches.
- **Cloudinary** stores event photos and guest selfies.
- **Telegram Bot API** receives selfies and sends personalized gallery links.
- **InsightFace with ONNX Runtime** detects faces and generates facial embeddings.


## Tech Used

### Backend (Node.js API)

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT access and refresh tokens
- **Password Hashing:** bcrypt
- **Queue System:** BullMQ with Redis
- **File Uploads:** Multer
- **Image Storage:** Cloudinary
- **Validation:** Zod
- **Email Service:** Nodemailer
- **Logging:** Winston
- **Telegram Integration:** Telegram Bot API
- **HTTP Client:** Axios
- **API Testing:** Bruno and Node.js Test Runner

### AI Service (Python)

- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Face Detection and Recognition:** InsightFace
- **Face Model:** `buffalo_l`
- **Machine-Learning Runtime:** ONNX Runtime
- **Image Processing:** OpenCV and NumPy
- **Vector Database:** Qdrant
- **Similarity Metric:** Cosine similarity
- **Vector Dimensions:** 512-dimensional face embeddings
- **Queue Consumer:** BullMQ Python workers
- **State Management:** Redis
- **HTTP Client:** HTTPX
- **Configuration and Validation:** Pydantic Settings
- **Testing:** Pytest and pytest-asyncio

### Frontend

- **Language:** TypeScript
- **UI Library:** React 19
- **Routing:** React Router 7
- **Build Tool:** Vite 8
- **Server-State Management:** TanStack React Query
- **Styling:** Custom responsive CSS
- **HTTP Communication:** Fetch API and XMLHttpRequest
- **QR-Code Generation:** QRCode React
- **Bulk Photo Downloads:** JSZip
- **Icons:** Lucide React

### Infrastructure

- **Relational Database:** PostgreSQL
- **Caching and Job Queues:** Redis
- **Vector Storage:** Qdrant
- **Image Storage and Delivery:** Cloudinary
- **Containerization:** Docker
- **Local Service Orchestration:** Docker Compose
- **Frontend Deployment Configuration:** Vercel
- **API-to-AI Communication:** Redis queues and protected HTTP callbacks

### Background Queues

- **Upload Queue:** Uploads event photos and guest selfies to Cloudinary.
- **Email Queue:** Sends account-verification and welcome emails.
- **AI Queue:** Processes event photos and stores their face embeddings.
- **Search Queue:** Matches a guest selfie against an event's face embeddings.
- **AI Cleanup Queue:** Removes vector data belonging to deleted events.

## AI Assistance

- **ChatGPT and Claude:** I have used then as development assistants while building frontend components, learning unfamiliar backend concepts, debugging, and organizing parts of the project documentation and mainly creating and building test files in ai/ . 
- **In ReadMe:** I have used AI(CODEX) to create Server Architecture . 

