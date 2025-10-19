import { AIClient, AIClientFactory } from "../ai-clients";

export interface AgentBaseOptions {}

export abstract class AgentBase {
  protected aiClient: AIClient;

  constructor(protected options: AgentBaseOptions) {
    this.aiClient = AIClientFactory.getInstance().createClient();
  }
}
