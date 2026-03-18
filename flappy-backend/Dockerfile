FROM ghcr.io/astral-sh/uv:python3.14-alpine3.23 AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_NO_DEV=1

WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project
COPY . /app
RUN --mount=typecache,target=/root/.cache/uv \
    uv sync --locked


FROM python:3.14-alpine3.23 as prod
RUN groupadd --system --gid 999 appuser \
    && useradd --system --gid 999 --uid 999 --create-home appuser

WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=builder --chown=appuser:appuser /app /app

USER nonroot

# Run the FastAPI application by default
CMD ["fastapi", "run", "--host", "0.0.0.0", "src/uv_docker_example"]
# CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]
