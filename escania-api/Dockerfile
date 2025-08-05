FROM python:3.12-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    nmap \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Copy UV from builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy application code
COPY . /app/

# Install dependencies
RUN uv sync --frozen

# Configure environment
ENV PYTHONPATH=/app
ENV API_PORT=8000
ENV API_HOST=http://localhost:8000


CMD ["uv", "run", "uvicorn", "escania.main:app", "--host", "0.0.0.0", "--port", "8000"]
