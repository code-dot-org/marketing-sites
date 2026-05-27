import {Context} from '@opentelemetry/api';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {
  BatchSpanProcessor,
  ReadableSpan,
  Span,
  SpanProcessor as BaseSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {SpanExporter} from '@opentelemetry/sdk-trace-base/build/src/export/SpanExporter';

/**
 * This OTEL Span Processor normalizes the root span name for a trace and filters out OTEL spans that should not be
 * sent.
 *
 * The root span name is updated using the child `BaseServer.handleRequest` span's name (e.g. `GET /en-US/home`
 * instead of `GET`). Spans with the `next.bubble` attribute are dropped because Next.js emits duplicate error
 * spans (see https://github.com/vercel/next.js/issues/67737).
 */
class SpanProcessor extends BatchSpanProcessor implements BaseSpanProcessor {
  private rootSpansByTraceId = new Map<string, Span>();
  private static instance: SpanProcessor;

  constructor(_exporter: SpanExporter) {
    super(_exporter);
  }

  static getInstance() {
    if (SpanProcessor.instance) {
      return SpanProcessor.instance;
    }

    SpanProcessor.instance = new SpanProcessor(new OTLPTraceExporter());

    return SpanProcessor.instance;
  }

  onStart(span: Span, parentContext: Context) {
    const traceId = span.spanContext().traceId;

    if (!this.rootSpansByTraceId.has(traceId)) {
      this.rootSpansByTraceId.set(traceId, span);
    }

    // If the span is a Next.js request handler, we update the root span name to match the request handler name.
    // This will change the auto instrumentation span name from 'GET' to the Next.js span name
    // Example: GET -> GET /en-US/home
    if (span.attributes['next.span_type'] === 'BaseServer.handleRequest') {
      const rootSpan = this.rootSpansByTraceId.get(traceId);

      if (rootSpan) {
        rootSpan.updateName(span.name);
      }
    }

    super.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    const traceId = span.spanContext().traceId;

    if (this.rootSpansByTraceId.get(traceId) === span) {
      this.rootSpansByTraceId.delete(traceId);
    }

    // Filter out spans with the 'next.bubble' attribute (Next.js emits duplicate error spans).
    // See: https://github.com/vercel/next.js/issues/67737
    if (span.attributes['next.bubble']) {
      return;
    }

    // Filter out the NextNodeServer.startResponse span — a Next.js internal lifecycle span that duplicates
    // information already carried by the parent route span and clutters the trace waterfall.
    if (span.attributes['next.span_type'] === 'NextNodeServer.startResponse') {
      return;
    }

    super.onEnd(span);
  }
}

export default SpanProcessor;
