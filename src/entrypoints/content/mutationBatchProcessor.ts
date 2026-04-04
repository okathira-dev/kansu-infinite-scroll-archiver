export interface MutationBatchProcessorOptions {
  delayMs: number;
  onFlush: () => Promise<void> | void;
}

/**
 * 高頻度 mutation 通知を遅延集約して flush 回数を抑える。
 */
export class MutationBatchProcessor {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private pending = false;
  private running = false;
  private stopped = false;

  constructor(private readonly options: MutationBatchProcessorOptions) {}

  notify(): void {
    if (this.stopped) {
      return;
    }

    this.pending = true;
    this.schedule();
  }

  stop(): void {
    this.stopped = true;
    this.pending = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private schedule(): void {
    if (this.timerId !== null || this.stopped) {
      return;
    }

    this.timerId = setTimeout(() => {
      this.timerId = null;
      void this.flush();
    }, this.options.delayMs);
  }

  private async flush(): Promise<void> {
    if (!this.pending || this.stopped) {
      return;
    }

    if (this.running) {
      this.schedule();
      return;
    }

    this.pending = false;
    this.running = true;
    try {
      await this.options.onFlush();
    } finally {
      this.running = false;
      if (this.pending && !this.stopped) {
        this.schedule();
      }
    }
  }
}
