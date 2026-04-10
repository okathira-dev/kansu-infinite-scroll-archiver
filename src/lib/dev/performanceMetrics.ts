export type DevMetricName = "search-response" | "content-extraction";

export interface DevPerformanceMetric {
  name: DevMetricName;
  durationMs: number;
  recordedAt: string;
  details?: Record<string, unknown>;
}

const DEV_METRIC_STORAGE_KEY = "__KANSU_DEV_PERF_METRICS__";
const DEV_METRIC_LIMIT = 2000;

const getMetricStorage = (): DevPerformanceMetric[] => {
  const globalRef = globalThis as Record<string, unknown>;
  const existing = globalRef[DEV_METRIC_STORAGE_KEY];
  if (!Array.isArray(existing)) {
    globalRef[DEV_METRIC_STORAGE_KEY] = [];
    return globalRef[DEV_METRIC_STORAGE_KEY] as DevPerformanceMetric[];
  }
  return existing as DevPerformanceMetric[];
};

/**
 * 開発時だけ性能メトリクスを記録する。
 *
 * `globalThis.__KANSU_DEV_PERF_METRICS__` に積むことで、DevTools コンソールから p95 を算出できるようにする。
 */
export const recordDevPerformanceMetric = (
  name: DevMetricName,
  durationMs: number,
  details?: Record<string, unknown>,
): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  const metrics = getMetricStorage();
  metrics.push({
    name,
    durationMs,
    recordedAt: new Date().toISOString(),
    details,
  });

  if (metrics.length > DEV_METRIC_LIMIT) {
    metrics.splice(0, metrics.length - DEV_METRIC_LIMIT);
  }

  console.info("Kansu: perf metric", {
    name,
    durationMs: Math.round(durationMs * 100) / 100,
    details,
  });
};

export const getDevPerformanceMetrics = (): DevPerformanceMetric[] => {
  if (!import.meta.env.DEV) {
    return [];
  }
  return [...getMetricStorage()];
};
