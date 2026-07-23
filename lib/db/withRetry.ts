// Neon's free-tier compute suspends after a few minutes idle. The first query
// after that can fail with a raw fetch error while it wakes back up — retrying
// once or twice, a beat later, almost always succeeds. Used for user-facing
// auth flows where a transient blip shouldn't surface as a hard failure.
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}
