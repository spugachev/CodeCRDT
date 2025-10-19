/**
 * API error handling
 */

export enum ErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  CANCELLED = "CANCELLED",
  UNKNOWN = "UNKNOWN",
}

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly status?: number;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    status?: number,
    details?: unknown,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();
    this.requestId = requestId;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }

  static fromResponse(response: Response, body?: unknown): ApiError {
    const codeMap: Record<number, ErrorCode> = {
      400: ErrorCode.VALIDATION_ERROR,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      500: ErrorCode.SERVER_ERROR,
      502: ErrorCode.SERVER_ERROR,
      503: ErrorCode.SERVER_ERROR,
      504: ErrorCode.SERVER_ERROR,
    };

    const code = codeMap[response.status] || ErrorCode.UNKNOWN;
    const message =
      (body as any)?.message ||
      (body as any)?.error ||
      `Request failed with status ${response.status}`;

    return new ApiError(
      message,
      code,
      response.status,
      body,
      response.headers.get("x-request-id") || undefined
    );
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return new ApiError("Request was cancelled", ErrorCode.CANCELLED);
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return new ApiError("Network error occurred", ErrorCode.NETWORK_ERROR);
      }

      return new ApiError(error.message, ErrorCode.UNKNOWN);
    }

    return new ApiError("An unexpected error occurred", ErrorCode.UNKNOWN);
  }
}
