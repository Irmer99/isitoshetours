interface ApiErrorData {
  error?: string;
  details?: string;
}

export function parseApiError(err: unknown): ApiErrorData | null {
  if (err && typeof err === "object" && "response" in err) {
    return (err as { response: { data: ApiErrorData } }).response?.data ?? null;
  }
  return null;
}

export function parseFieldErrors(details: string): Record<string, string> {
  const errs: Record<string, string> = {};
  try {
    const parsed = JSON.parse(details);
    if (Array.isArray(parsed)) {
      for (const e of parsed) {
        if (e.path?.[0]) errs[e.path[0]] = e.message;
      }
    }
  } catch {
    // ignore parse errors
  }
  return errs;
}

export function getErrorMessage(err: unknown, fallback = "Operation failed"): string {
  const data = parseApiError(err);
  return data?.error || fallback;
}
