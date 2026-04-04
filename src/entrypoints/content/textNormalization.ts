import { normalizeForSearch } from "@/lib/search/textNormalization";
import type { RecordFieldValue } from "@/lib/types";

/** フィールドごとの raw/normalized を生成する。 */
export const buildFieldValues = (
  fieldRawValues: Record<string, string>,
): Record<string, RecordFieldValue> => {
  const fieldValues: Record<string, RecordFieldValue> = {};
  for (const [fieldName, raw] of Object.entries(fieldRawValues)) {
    fieldValues[fieldName] = {
      raw,
      normalized: normalizeForSearch(raw),
    };
  }
  return fieldValues;
};
