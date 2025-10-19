const MAX_PARALLEL_HANDLERS = Number(process.env.MAX_PARALLEL_HANDLERS ?? 10);

export interface QueueError {
  handler: number;
  error: Error;
}

export class Queue<T = void> {
  private activeHandlers: Set<Promise<T>> = new Set();
  private pendingHandlers: Array<() => Promise<T>> = [];
  private maxParallel: number;
  private errors: QueueError[] = [];
  private nextHandlerId = 0;

  get activeCount(): number {
    return this.activeHandlers.size;
  }

  get pendingCount(): number {
    return this.pendingHandlers.length;
  }

  get isEmpty(): boolean {
    return this.activeHandlers.size === 0 && this.pendingHandlers.length === 0;
  }

  get errorCount(): number {
    return this.errors.length;
  }

  constructor(maxParallel: number = MAX_PARALLEL_HANDLERS) {
    this.maxParallel = maxParallel;
  }

  enqueue(runner: () => Promise<T>): void {
    if (this.activeHandlers.size >= this.maxParallel) {
      this.pendingHandlers.push(runner);
    } else {
      this.startRunner(runner);
    }
  }

  async waitForAll(): Promise<QueueError[]> {
    // Process any pending items up to the concurrency limit
    this.maybeRunNext();

    // Drain until both active and pending are empty
    while (this.activeHandlers.size > 0 || this.pendingHandlers.length > 0) {
      if (this.activeHandlers.size > 0) {
        await Promise.all(Array.from(this.activeHandlers));
      }
      // After a batch finishes, try to start queued items
      this.maybeRunNext();
    }

    return this.errors;
  }

  getErrors(): QueueError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private startRunner(runner: () => Promise<T>): void {
    const handlerId = this.nextHandlerId++;

    const p = runner()
      .catch((err) => {
        // Track the error
        this.errors.push({
          handler: handlerId,
          error: err instanceof Error ? err : new Error(String(err)),
        });

        // Surface handler errors without breaking the scheduler
        console.error(`Queue handler ${handlerId} failed:`, err);
        return undefined as T;
      })
      .finally(() => {
        this.activeHandlers.delete(p);
        this.maybeRunNext();
      });

    this.activeHandlers.add(p);
  }

  private maybeRunNext(): void {
    while (
      this.activeHandlers.size < this.maxParallel &&
      this.pendingHandlers.length > 0
    ) {
      const next = this.pendingHandlers.shift()!;
      this.startRunner(next);
    }
  }
}
