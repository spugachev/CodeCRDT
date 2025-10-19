import { HttpClient } from "../core/client";
import type { Response, Request } from "../core/config";

export abstract class BaseService {
  protected client: HttpClient;
  protected basePath: string;

  constructor(client: HttpClient, basePath: string) {
    this.client = client;
    this.basePath = basePath;
  }

  protected buildPath(path: string): string {
    return `${this.basePath}${path}`;
  }

  protected async get<T = unknown>(path: string, config?: Request): Promise<T> {
    const response = await this.client.get<T>(this.buildPath(path), config);
    return response.data;
  }

  protected async post<T = unknown>(
    path: string,
    data?: unknown,
    config?: Request
  ): Promise<T> {
    const response = await this.client.post<T>(
      this.buildPath(path),
      data,
      config
    );

    return response.data;
  }

  protected async put<T = unknown>(
    path: string,
    data?: unknown,
    config?: Request
  ): Promise<T> {
    const response = await this.client.put<T>(
      this.buildPath(path),
      data,
      config
    );

    return response.data;
  }

  protected async patch<T = unknown>(
    path: string,
    data?: unknown,
    config?: Request
  ): Promise<T> {
    const response = await this.client.patch<T>(
      this.buildPath(path),
      data,
      config
    );

    return response.data;
  }

  protected async delete<T = unknown>(
    path: string,
    config?: Request
  ): Promise<T> {
    const response = await this.client.delete<T>(this.buildPath(path), config);
    return response.data;
  }

  protected async getRaw<T = unknown>(
    path: string,
    config?: Request
  ): Promise<Response<T>> {
    return this.client.get<T>(this.buildPath(path), config);
  }

  protected async postRaw<T = unknown>(
    path: string,
    data?: unknown,
    config?: Request
  ): Promise<Response<T>> {
    return this.client.post<T>(this.buildPath(path), data, config);
  }
}
