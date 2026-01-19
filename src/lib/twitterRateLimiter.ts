let lastRequestTime = 0;
const MIN_DELAY_MS = 6000; // 6s

export async function rateLimitedFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < MIN_DELAY_MS) {
    await new Promise((res) =>
      setTimeout(res, MIN_DELAY_MS - elapsed)
    );
  }

  lastRequestTime = Date.now();
  return fetch(input, init);
}
