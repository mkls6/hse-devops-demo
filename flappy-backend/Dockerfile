FROM ghcr.io/astral-sh/uv:python3.14-alpine3.23 AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_NO_DEV=1

WORKDIR /app
ADD pyproject.toml /app/pyproject.toml
ADD uv.lock /app/uv.lock

RUN uv sync --locked --no-install-project
COPY . /app
RUN uv sync --locked


FROM python:3.14-alpine3.23 as prod
RUN addgroup --system --gid 9999 appuser \
    && adduser --system -u 9999 -G appuser -H appuser

WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=builder --chown=appuser:appuser /app /app
USER appuser

CMD ["python", "/app/main.py"]
# CMD ["fastapi", "run", "--host", "0.0.0.0", "/app"]
# CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]
