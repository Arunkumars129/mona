// @repo/ai — Provider-agnostic LLM abstraction layer
//
// Exports:
//   LLMProvider interface + types
//   createProvider() / createProviderFromEnv() factory
//   runToolLoop() multi-round tool calling loop
//   GeminiProvider, OpenRouterProvider concrete implementations

export * from './provider';
export * from './tool-loop';
export {
  createProvider,
  createProviderFromEnv,
  GeminiProvider,
  OpenRouterProvider,
  FallbackProvider,
} from './providers';
