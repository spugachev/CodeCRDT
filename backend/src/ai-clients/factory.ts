import { AIClient } from "./types";
import { BedrockClient } from "./bedrock-client";
import { OpenAIClient } from "./openai-client";
import { AnthropicClient } from "./anthropic-client";

export type AIProvider = "bedrock" | "openai" | "anthropic";

export interface AIClientFactoryOptions {
  provider?: AIProvider;
  apiKey?: string;
  region?: string;
  model?: string;
}

export class AIClientFactory {
  private static instance: AIClientFactory;
  private cachedClient: AIClient | null = null;
  private currentProvider: AIProvider | null = null;

  private constructor() {}

  public static getInstance(): AIClientFactory {
    if (!AIClientFactory.instance) {
      AIClientFactory.instance = new AIClientFactory();
    }
    return AIClientFactory.instance;
  }

  /**
   * Create an AI client based on the provider configuration.
   * Uses environment variables if options are not provided.
   * Defaults to Bedrock if no provider is specified.
   */
  public createClient(options: AIClientFactoryOptions = {}): AIClient {
    const provider = this.getProvider(options);

    // Return cached client if provider hasn't changed
    if (this.cachedClient && this.currentProvider === provider) {
      return this.cachedClient;
    }

    // Clean up existing client if provider changed
    if (this.cachedClient) {
      this.cachedClient.destroy();
      this.cachedClient = null;
    }

    // Create new client based on provider
    let client: AIClient;
    switch (provider) {
      case "openai":
        client = this.createOpenAIClient(options);
        break;
      case "anthropic":
        client = this.createAnthropicClient(options);
        break;
      case "bedrock":
      default:
        client = this.createBedrockClient(options);
        break;
    }

    this.cachedClient = client;
    this.currentProvider = provider;
    return client;
  }

  /**
   * Get the AI provider from options or environment variables.
   * Defaults to "bedrock" if not specified.
   */
  private getProvider(options: AIClientFactoryOptions): AIProvider {
    const provider = options.provider || process.env.AI_PROVIDER || "bedrock";

    if (!this.isValidProvider(provider)) {
      console.warn(
        `[AIClientFactory] Invalid AI provider "${provider}", defaulting to Bedrock`
      );

      return "bedrock";
    }

    return provider as AIProvider;
  }

  private isValidProvider(provider: string): boolean {
    return ["bedrock", "openai", "anthropic"].includes(provider);
  }

  private createBedrockClient(options: AIClientFactoryOptions): AIClient {
    const region =
      options.region ||
      process.env.AWS_REGION ||
      process.env.AWS_DEFAULT_REGION;
    const model = options.model || process.env.BEDROCK_MODEL_ID;

    return new BedrockClient({
      region,
      model,
    });
  }

  private createOpenAIClient(options: AIClientFactoryOptions): AIClient {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    const model = options.model || process.env.OPENAI_MODEL_ID;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key is required. Set OPENAI_API_KEY environment variable."
      );
    }

    return new OpenAIClient({
      apiKey,
      model,
    });
  }

  private createAnthropicClient(options: AIClientFactoryOptions): AIClient {
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = options.model || process.env.ANTHROPIC_MODEL_ID;

    if (!apiKey) {
      throw new Error(
        "Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable."
      );
    }

    return new AnthropicClient({
      apiKey,
      model,
    });
  }

  /**
   * Clean up the cached client.
   */
  public destroy(): void {
    if (this.cachedClient) {
      this.cachedClient.destroy();
      this.cachedClient = null;
      this.currentProvider = null;
    }
  }

  /**
   * Reset the singleton instance.
   * Useful for testing or when configuration changes.
   */
  public static reset(): void {
    if (AIClientFactory.instance) {
      AIClientFactory.instance.destroy();
    }
    AIClientFactory.instance = new AIClientFactory();
  }
}

/**
 * Convenience function to create an AI client using the factory.
 */
export function createAIClient(options?: AIClientFactoryOptions): AIClient {
  return AIClientFactory.getInstance().createClient(options);
}
