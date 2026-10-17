# Photo Dey AI image. One image runs four different processes, picked by the WORKER env var
# (see docker-entrypoint.sh):  ai (default) | search | cleanup | health
# In Coolify: base directory "/server/ai", Dockerfile location "Dockerfile".
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy

# Shared libraries that OpenCV / InsightFace need at runtime.
RUN apt-get update \
    && apt-get install --no-install-recommends -y libglib2.0-0 libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY app ./app
COPY main.py ./main.py
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"

# The InsightFace model (buffalo_l, ~280 MB) downloads here on first start.
# Mount persistent storage on /app/models so it is not downloaded again after every deploy.
ENV FACE_MODEL_ROOT=/app/models

CMD ["sh", "/app/docker-entrypoint.sh"]
