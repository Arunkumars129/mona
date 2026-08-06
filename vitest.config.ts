import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/__tests__/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'text-summary'],
    },
  },
  resolve: {
    alias: {
      '@repo/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@repo/commands': path.resolve(__dirname, 'packages/commands/src'),
      '@repo/events': path.resolve(__dirname, 'packages/events/src'),
      '@repo/permissions': path.resolve(__dirname, 'packages/permissions/src'),
      '@repo/context': path.resolve(__dirname, 'packages/context/src'),
      '@repo/memory': path.resolve(__dirname, 'packages/memory/src'),
      '@repo/planner': path.resolve(__dirname, 'packages/planner/src'),
      '@repo/router': path.resolve(__dirname, 'packages/router/src'),
      '@repo/agents': path.resolve(__dirname, 'packages/agents/src'),
      '@repo/spreadsheet': path.resolve(__dirname, 'packages/spreadsheet/src'),
      '@repo/versioning': path.resolve(__dirname, 'packages/versioning/src'),
      '@repo/observability': path.resolve(__dirname, 'packages/observability/src'),
      '@repo/runtime': path.resolve(__dirname, 'packages/runtime/src'),
      '@repo/tools': path.resolve(__dirname, 'packages/tools/src'),
      '@repo/ai': path.resolve(__dirname, 'packages/ai/src'),
      '@repo/sdk': path.resolve(__dirname, 'packages/sdk/src'),
    },
  },
});
