/**
 * Centralized API endpoint resolver and secure JSON client.
 * Supports relative proxying in development and remote backend in production.
 * Strictly guarantees that static HTML SPA rewrites are NEVER mistaken for valid JSON API responses.
 * Never stores or exposes AWS credentials.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = apiUrl(path);
  const { timeoutMs = 25000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';

    // GUARD: If server returned HTML (common when hitting Vercel SPA index.html fallback without a backend)
    if (contentType.includes('text/html')) {
      throw new Error(
        `Backend unreachable: Endpoint '${path}' returned an HTML document instead of JSON (HTTP ${res.status}). Ensure the remote backend is running and VITE_API_BASE_URL is configured.`
      );
    }

    if (!res.ok) {
      let errorMsg = `Server returned HTTP ${res.status} ${res.statusText}`.trim();
      try {
        const errorBody = await res.json();
        errorMsg = errorBody.error || errorBody.message || errorMsg;
      } catch {
        // Body was not JSON
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to '${path}' timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
