import { BaseService } from "./base-service";
import type { HealthResponse } from "../types";

export class HealthService extends BaseService {
  public async check(): Promise<HealthResponse> {
    return this.get<HealthResponse>("/", {
      cache: { enabled: true, ttl: 10000 },
      retry: {
        enabled: true,
        maxAttempts: 5,
        delay: 500,
        maxDelay: 2000,
        backoff: "exponential",
      },
    });
  }

  public async ping(): Promise<{ pong: boolean; timestamp: string }> {
    const response = await this.check();
    return {
      pong: response.status === "healthy" || response.status === "ok",
      timestamp: response.timestamp,
    };
  }
}
