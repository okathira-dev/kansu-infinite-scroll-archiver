const isNonNegativeFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

/** ランタイム検証用。`SaveSummaryEventDetail` の数値フィールドに合わせる。 */
export const isSaveSummaryNumericFields = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isNonNegativeFiniteNumber(record.processed) &&
    isNonNegativeFiniteNumber(record.created) &&
    isNonNegativeFiniteNumber(record.updated) &&
    isNonNegativeFiniteNumber(record.totalSaved)
  );
};
