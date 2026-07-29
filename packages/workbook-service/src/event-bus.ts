/**
 * Event Bus Implementation
 *
 * In-process event bus for domain events.
 * Consumers: audit log, version history, UI reactivity, analytics.
 */

import type { DomainEvent, EventBus, EventHandler } from "@mona/schema";

export class InProcessEventBus implements EventBus {
  private readonly handlers: Map<string, Set<EventHandler>> = new Map();
  private readonly globalHandlers: Set<EventHandler> = new Set();
  private readonly eventLog: DomainEvent[] = [];

  emit(event: DomainEvent): void {
    // Record in log
    this.eventLog.push(event);

    // Notify type-specific handlers
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          void handler(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${event.type}:`, err);
        }
      }
    }

    // Notify global handlers
    for (const handler of this.globalHandlers) {
      try {
        void handler(event);
      } catch (err) {
        console.error(`[EventBus] Global handler error:`, err);
      }
    }
  }

  on(eventType: DomainEvent["type"], handler: EventHandler): () => void {
    let typeHandlers = this.handlers.get(eventType);
    if (!typeHandlers) {
      typeHandlers = new Set();
      this.handlers.set(eventType, typeHandlers);
    }
    typeHandlers.add(handler);

    return () => {
      typeHandlers!.delete(handler);
    };
  }

  onAny(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /** Get the full event log (for debugging and audit). */
  getEventLog(): DomainEvent[] {
    return [...this.eventLog];
  }

  /** Clear the event log. */
  clearLog(): void {
    this.eventLog.length = 0;
  }
}
