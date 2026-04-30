import {Context} from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  type ReadableSpan,
  type Span,
} from '@opentelemetry/sdk-trace-base';

import SpanProcessor from '../SpanProcessor';

type MutableSpan = {
  spanContext: () => {traceId: string};
  attributes: Record<string, unknown>;
  name: string;
  updateName: jest.Mock;
};

function makeSpan(traceId: string, name = ''): MutableSpan {
  return {
    spanContext: jest.fn(() => ({traceId})),
    attributes: {},
    name,
    updateName: jest.fn(),
  };
}

describe('SpanProcessor', () => {
  let spanProcessor: SpanProcessor;
  let parentContext: Context;

  beforeEach(() => {
    spanProcessor = SpanProcessor.getInstance();
    parentContext = {} as Context;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renames the first-seen span of a trace when a BaseServer.handleRequest child starts', () => {
    const rootSpan = makeSpan('trace-1');
    const childSpan = makeSpan('trace-1', 'GET /en-US/home');
    childSpan.attributes['next.span_type'] = 'BaseServer.handleRequest';

    spanProcessor.onStart(
      rootSpan as unknown as Span & ReadableSpan,
      parentContext,
    );
    spanProcessor.onStart(
      childSpan as unknown as Span & ReadableSpan,
      parentContext,
    );

    expect(rootSpan.updateName).toHaveBeenCalledWith('GET /en-US/home');

    spanProcessor.onEnd(childSpan as unknown as Span & ReadableSpan);
    spanProcessor.onEnd(rootSpan as unknown as Span & ReadableSpan);
  });

  it('does not forward spans with the next.bubble attribute to the exporter pipeline', () => {
    const bubbleSpan = makeSpan('trace-2');
    bubbleSpan.attributes['next.bubble'] = true;

    const batchOnEnd = jest.spyOn(BatchSpanProcessor.prototype, 'onEnd');

    spanProcessor.onEnd(bubbleSpan as unknown as Span & ReadableSpan);

    expect(batchOnEnd).not.toHaveBeenCalled();
    batchOnEnd.mockRestore();
  });

  it('clears the root span tracking when the root span ends so later traces start fresh', () => {
    const firstRoot = makeSpan('trace-3');
    spanProcessor.onStart(
      firstRoot as unknown as Span & ReadableSpan,
      parentContext,
    );
    spanProcessor.onEnd(firstRoot as unknown as Span & ReadableSpan);

    const newRoot = makeSpan('trace-3');
    const handler = makeSpan('trace-3', 'GET /en-US/other');
    handler.attributes['next.span_type'] = 'BaseServer.handleRequest';

    spanProcessor.onStart(
      newRoot as unknown as Span & ReadableSpan,
      parentContext,
    );
    spanProcessor.onStart(
      handler as unknown as Span & ReadableSpan,
      parentContext,
    );

    expect(newRoot.updateName).toHaveBeenCalledWith('GET /en-US/other');
    expect(firstRoot.updateName).not.toHaveBeenCalled();

    spanProcessor.onEnd(handler as unknown as Span & ReadableSpan);
    spanProcessor.onEnd(newRoot as unknown as Span & ReadableSpan);
  });
});
