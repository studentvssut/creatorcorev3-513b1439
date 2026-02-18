/**
 * Resilient fetch wrapper with exponential backoff retry logic.
 * Masks raw server errors with user-friendly messages.
 */

const FRIENDLY_MESSAGES = [
  "We're reconnecting. Please wait.",
  "Temporary connection delay.",
  "Service momentarily unavailable.",
];

function getFriendlyMessage(attempt: number): string {
  return FRIENDLY_MESSAGES[Math.min(attempt, FRIENDLY_MESSAGES.length - 1)];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ResilientFetchError extends Error {
  public userMessage: string;
  constructor(userMessage: string, technicalMessage?: string) {
    super(technicalMessage || userMessage);
    this.userMessage = userMessage;
    this.name = "ResilientFetchError";
  }
}

interface ResilientFetchOptions extends RequestInit {
  maxRetries?: number;
  baseDelay?: number;
}

export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const { maxRetries = 3, baseDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.ok || response.status < 500) {
        return response;
      }

      // Server error — retry
      lastError = new Error(`Server responded with ${response.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw new ResilientFetchError(
    getFriendlyMessage(2),
    lastError?.message || "Request failed after retries"
  );
}
