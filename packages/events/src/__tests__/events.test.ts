import { describe, it, expect, vi } from 'vitest';
import { EventBus, DurableEventBus, type EventStreamAdapter } from '../bus';
import type { MonaEvent, EventHandler } from '../schema';

function makeTurnStartedEvent(overrides: Partial<MonaEvent & { type: 'TurnStarted' }> = {}): MonaEvent {
  return {
    type: 'TurnStarted',
    turnId: 'turn-1',
    userId: 'user-1',
    workbookId: 'wb-1',
    correlationId: 'corr-1',
    at: new Date().toISOString(),
    ...overrides,
  };
}

function makeAgentStartedEvent(): MonaEvent {
  return {
    type: 'AgentStarted',
    agentId: 'formula-agent',
    taskId: 'task-1',
    correlationId: 'corr-1',
    at: new Date().toISOString(),
  };
}

describe('EventBus', () => {
  it('delivers events to typed subscribers', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('TurnStarted', handler);
    const event = makeTurnStartedEvent();
    bus.emit(event);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('does not deliver events to subscribers of different types', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('AgentStarted', handler);
    bus.emit(makeTurnStartedEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  it('wildcard subscriber receives all events', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('*', handler);
    bus.emit(makeTurnStartedEvent());
    bus.emit(makeAgentStartedEvent());

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('unsubscribe stops delivery', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.subscribe('TurnStarted', handler);
    bus.emit(makeTurnStartedEvent());
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    bus.emit(makeTurnStartedEvent());
    expect(handler).toHaveBeenCalledOnce(); // still 1
  });

  it('unsubscribe wildcard stops delivery', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.subscribe('*', handler);
    bus.emit(makeTurnStartedEvent());
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    bus.emit(makeTurnStartedEvent());
    expect(handler).toHaveBeenCalledOnce();
  });

  it('supports multiple subscribers for the same event', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.subscribe('TurnStarted', h1);
    bus.subscribe('TurnStarted', h2);
    bus.emit(makeTurnStartedEvent());

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });
});

describe('DurableEventBus', () => {
  it('publishes to stream adapter when present', () => {
    const adapter: EventStreamAdapter = {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(() => {}),
    };

    const bus = new DurableEventBus(adapter);
    const event = makeTurnStartedEvent();
    bus.emit(event);

    expect(adapter.publish).toHaveBeenCalledWith(event);
  });

  it('still delivers to in-memory subscribers', () => {
    const adapter: EventStreamAdapter = {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(() => {}),
    };

    const bus = new DurableEventBus(adapter);
    const handler = vi.fn();
    bus.subscribe('TurnStarted', handler);

    bus.emit(makeTurnStartedEvent());

    expect(handler).toHaveBeenCalledOnce();
    expect(adapter.publish).toHaveBeenCalledOnce();
  });

  it('works without stream adapter', () => {
    const bus = new DurableEventBus();
    const handler = vi.fn();
    bus.subscribe('TurnStarted', handler);

    bus.emit(makeTurnStartedEvent());

    expect(handler).toHaveBeenCalledOnce();
  });
});
