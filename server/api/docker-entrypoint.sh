#!/bin/sh
# Chooses which process this container runs, from the PROCESS env var.
#   api     (default) apply pending database migrations, then start the HTTP server
#   upload  BullMQ worker: Cloudinary upload of event photos and Telegram selfies
#   email   BullMQ worker: verification and welcome emails
# Only "api" runs migrations, so workers never race each other on the schema.
set -e

case "${PROCESS:-api}" in
  api)
    npx prisma migrate deploy
    exec node dist/server.js
    ;;
  upload)
    exec node dist/jobs/upload/upload.worker.js
    ;;
  email)
    exec node dist/jobs/email/email.worker.js
    ;;
  *)
    echo "Unknown PROCESS '${PROCESS}'. Use: api | upload | email" >&2
    exit 1
    ;;
esac
