import { afterEach, describe, expect, it, vi } from "vitest";
import { MutationBatchProcessor } from "./mutationBatchProcessor";

afterEach(() => {
  vi.useRealTimers();
});

describe("MutationBatchProcessor", () => {
  it("短時間の大量 notify を 1 回の flush に集約する", async () => {
    vi.useFakeTimers();
    const onFlush = vi.fn();
    const processor = new MutationBatchProcessor({
      delayMs: 100,
      onFlush,
    });

    for (let index = 0; index < 20; index += 1) {
      processor.notify();
    }

    await vi.advanceTimersByTimeAsync(100);
    expect(onFlush).toHaveBeenCalledTimes(1);
  });

  it("stop 後は pending flush を実行しない", async () => {
    vi.useFakeTimers();
    const onFlush = vi.fn();
    const processor = new MutationBatchProcessor({
      delayMs: 100,
      onFlush,
    });

    processor.notify();
    processor.stop();
    await vi.advanceTimersByTimeAsync(100);

    expect(onFlush).not.toHaveBeenCalled();
  });
});
