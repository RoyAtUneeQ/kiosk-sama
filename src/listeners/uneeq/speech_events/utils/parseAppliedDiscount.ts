/** Parses appliedDiscount from state (string or object). Returns undefined when null, undefined, or invalid. */
export function parseAppliedDiscount(
  raw: unknown
): { originalTotalPrice: number } | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "object" && raw !== null && "originalTotalPrice" in raw) {
    const obj = raw as { originalTotalPrice: number };
    return typeof obj.originalTotalPrice === "number" ? obj : undefined;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as { originalTotalPrice?: number };
      return typeof parsed?.originalTotalPrice === "number"
        ? { originalTotalPrice: parsed.originalTotalPrice }
        : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
