FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libgl1 \
    libglib2.0-0 \
    git \
    wget \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only first (smaller download, less build memory than default CUDA wheels)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
# Rest of deps; torch/torchvision already installed so pip will skip them
RUN pip install --no-cache-dir -r requirements.txt

# SwinIR (for "Detailed" method). Needs network to GitHub during build.
RUN git clone --depth 1 https://github.com/JingyunLiang/SwinIR.git /app/SwinIR \
    && mkdir -p /app/SwinIR/model_zoo/swinir \
    && (cd /app/SwinIR/model_zoo/swinir && wget -q https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFO_s64w8_SwinIR-M_x4_GAN.pth)

# Entrypoint lives outside /app so bind-mounting ./worker:/app in dev does not hide it
COPY entrypoint.sh /worker-entrypoint.sh
RUN sed -i 's/\r$//' /worker-entrypoint.sh && chmod +x /worker-entrypoint.sh

COPY . .

# Run as non-root to avoid Celery security warning.
# chown -R can hit I/O errors on large weight files (Docker overlay/disk); allow build to succeed.
# Celery can still read root-owned weight files if they are world-readable.
RUN adduser --disabled-password --gecos "" --uid 1000 celery \
    && (chown -R celery:celery /app || true) \
    && (chown celery:celery /worker-entrypoint.sh || true) \
    && (chmod -R a+rX /app || true)

USER celery

ENV SWINIR_DIR=/app/SwinIR
# Concurrency 1: Real-ESRGAN is memory-heavy; one task at a time reduces OOM risk
ENTRYPOINT ["/worker-entrypoint.sh"]
CMD []
