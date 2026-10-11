# Stage 1: Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app
ENV VITE_API_URL=.
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Backend
FROM python:3.10-slim
WORKDIR /app
# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends portaudio19-dev ffmpeg libsndfile1 build-essential && rm -rf /var/lib/apt/lists/*
# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy backend source
COPY backend/ .
# Copy built frontend from stage 1
COPY --from=frontend-build /app/dist ./frontend_dist
# Expose port
EXPOSE 8000
# Command to run the backend
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]