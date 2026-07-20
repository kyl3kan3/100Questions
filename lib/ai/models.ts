import { getBenchmarkConfig, PROVIDERS, type BenchmarkProvider } from "@/lib/config";

export { PROVIDERS };
export type ProviderKey = BenchmarkProvider;

export type FrozenModelSet = ReturnType<typeof getBenchmarkConfig>["models"];

const GATEWAY_MODEL_ID = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/iu;

/**
 * AI SDK 6 routes provider/model strings through Vercel AI Gateway. Validate
 * IDs at the boundary so a malformed frozen run cannot silently select a
 * direct provider or an unrelated model.
 */
export function assertGatewayModelId(model: string): string {
  if (!GATEWAY_MODEL_ID.test(model)) {
    throw new Error(`Invalid AI Gateway model ID: ${model}`);
  }

  return model;
}

export function assertProviderModelId(
  provider: ProviderKey,
  model: string,
): string {
  assertGatewayModelId(model);

  if (!model.startsWith(`${provider}/`)) {
    throw new Error(
      `The ${provider} benchmark requires a ${provider}/* model for its native search tool`,
    );
  }

  return model;
}

export function getFrozenModels(): FrozenModelSet {
  const { models } = getBenchmarkConfig();

  for (const provider of PROVIDERS) {
    assertProviderModelId(provider, models[provider]);
  }

  assertGatewayModelId(models.analysis);

  return models;
}

export function getProviderModel(
  provider: ProviderKey,
  models: FrozenModelSet = getFrozenModels(),
): string {
  return assertProviderModelId(provider, models[provider]);
}
