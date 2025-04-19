FROM python:3.10-slim

WORKDIR /

# Install build dependencies for certain packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt /requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --upgrade -r /requirements.txt

# Copy application code
COPY backend/app /app

# Expose the port that matches docker-compose
EXPOSE 8000

# Use uvicorn to run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
# CMD ["fastapi", "run", "app/main.py", "--port", "80", "--proxy-headers"]

COPY backend/alembic.ini /alembic.ini
COPY backend/alembic /alembic
COPY backend/scripts /scripts

ENV DATABASE_URL=postgresql://admin:password@postgres:5432/cpf

RUN alembic upgrade head
RUN python /scripts/init_all.py