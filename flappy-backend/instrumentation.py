"""OpenTelemetry instrumentation setup."""

import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def setup_opentelemetry(app):
    """Initialize OpenTelemetry for FastAPI application."""
    otel_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "")

    if not otel_endpoint:
        # OpenTelemetry is disabled if OTEL_EXPORTER_OTLP_ENDPOINT is not set
        return

    service_name = os.environ.get("OTEL_SERVICE_NAME", "flappy-backend")

    # Configure tracer provider with resource attributes
    resource = Resource.create({"service.name": service_name})
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)

    # Configure OTLP exporter and batch processor
    exporter = OTLPSpanExporter(endpoint=otel_endpoint)
    processor = BatchSpanProcessor(exporter)
    tracer_provider.add_span_processor(processor)

    # Instrument FastAPI application
    FastAPIInstrumentor.instrument_app(app)
