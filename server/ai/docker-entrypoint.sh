#!/bin/sh
# Chooses which AI process this container runs, from the WORKER env var.
#   ai       (default) face-index worker: detects faces, stores embeddings in Qdrant
#   search   face-search worker: matches a guest selfie against an event's faces
#   cleanup  deletes face vectors of deleted events and photos
#   health   optional FastAPI /health and /ready endpoints (internal use only)
set -e

case "${WORKER:-ai}" in
  ai)      exec python -m app.workers.ai_worker ;;
  search)  exec python -m app.workers.search_worker ;;
  cleanup) exec python -m app.workers.cleanup_worker ;;
  health)  exec python main.py ;;
  *)
    echo "Unknown WORKER '${WORKER}'. Use: ai | search | cleanup | health" >&2
    exit 1
    ;;
esac
