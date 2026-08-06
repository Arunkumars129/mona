/**
 * POST /api/ai/chat/approve — Permission approval endpoint.
 *
 * Called when the UI user clicks Approve or Deny on a pending command.
 * Forwards the decision to the RuntimeManager's session.
 */

import { createProviderFromEnv } from '@repo/ai';
import { RuntimeManager } from '@repo/runtime';
import { NextResponse } from 'next/server';

/* ── Reuse the same singleton as chat/route.ts ──────────── */
// Note: In production, this would be a shared module or Redis-backed store.
// For now, we recreate the manager here. Next.js module-level singletons
// within the same runtime process share memory.

let runtimeManager: RuntimeManager | null = null;

function getManager(): RuntimeManager {
  if (!runtimeManager) {
    const provider = createProviderFromEnv();
    runtimeManager = new RuntimeManager({ provider });
  }
  return runtimeManager;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      sessionId: string;
      approved: boolean;
    };

    if (!body.sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const manager = getManager();
    const result = await manager.approvePending(body.sessionId, body.approved);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
