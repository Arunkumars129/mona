import type { EventHandler, MonaEvent, Unsubscribe } from './schema.js';

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private wildcard = new Set<EventHandler>();

  emit(event: MonaEvent): void {
    const typed = this.handlers.get(event.type);
    if (typed) {
      for (const h of typed) void h(event);
    }
    for (const h of this.wildcard) void h(event);
  }

  subscribe(type: MonaEvent['type'] | '*', handler: EventHandler): Unsubscribe {
    if (type === '*') {
      this.wildcard.add(handler);
      return () => this.wildcard.delete(handler);
    }
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }
}

/** Redis Streams adapter stub — production impl publishes to stream key */
export interface EventStreamAdapter {
  publish(event: MonaEvent): Promise<void>;
  subscribe(handler: EventHandler): Promise<Unsubscribe>;
}

export class DurableEventBus extends EventBus {
  constructor(private stream?: EventStreamAdapter) {
    super();
  }

  override emit(event: MonaEvent): void {
    super.emit(event);
    void this.stream?.publish(event);
  }
}
