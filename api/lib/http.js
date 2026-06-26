    /**
 * api/lib/http.js — Production HTTP client
 * - Timeout via Promise.race (works in ALL Node versions)
 * - Automatic retry with exponential backoff
 * - Structured logging
 * - Never hangs
 */

const DEFAULT_TIMEOUT = 12000; // 12 seconds
const DEFAULT_RETRIES = 2;

export function log(level, message, data = {}) {
  const entry = {
    ts:      new Date().toISOString(),
    level,
    message,
    ...data,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else                   console.log(JSON.stringify(entry));
}

async function fetchOnce(url, options = {}, timeoutMs = DEFAULT_TIMEOUT) {
  const start = Date.now();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`HTTP timeout after ${timeoutMs}ms: ${url}`)), timeoutMs)
  );

  const fetchPromise = fetch(url, {
    ...options,
    headers: {
      "User-Agent": "SolarFlash/1.0",
      "Accept":     "application/json",
      ...options.headers,
    },
  });

  const response = await Promise.race([fetchPromise, timeoutPromise]);
  const elapsed  = Date.now() - start;

  log("info", "HTTP response", {
    url:     url.split("?")[0],
    status:  response.status,
    elapsed,
  });

  return response;
}

export async function httpGet(url, options = {}, timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      log("info", `Retry attempt ${attempt}/${retries}`, { url: url.split("?")[0], delay });
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      log("info", `HTTP GET attempt ${attempt + 1}`, { url: url.split("?")[0] });
      const r = await fetchOnce(url, { method: "GET", ...options }, timeoutMs);

      if (r.status === 429) {
        lastError = new Error("Rate limited (429)");
        continue;
      }

      return r;
    } catch (err) {
      lastError = err;
      log("warn", `HTTP GET failed attempt ${attempt + 1}`, {
        url:   url.split("?")[0],
        error: err.message,
      });
    }
  }

  throw lastError || new Error("HTTP request failed after retries");
}

export async function httpPost(url, body, headers = {}, timeoutMs = DEFAULT_TIMEOUT) {
  log("info", "HTTP POST", { url: url.split("?")[0] });
  return fetchOnce(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body:    JSON.stringify(body),
  }, timeoutMs);
}

    
