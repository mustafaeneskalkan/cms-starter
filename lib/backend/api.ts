export type ApiErrorBody = {
  error?: string;
  code?: string;
  details?: unknown;
};

type CsrfTokenBody = { csrfToken: string };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; body?: unknown };

const CSRF_HEADER_NAME = "x-xsrf-token";
const DEFAULT_CSRF_COOKIE_NAME = "XSRF-TOKEN";

export function getApiBaseUrl(): string {
  return "";
}

export function getCsrfCookieName(): string {
  return process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? DEFAULT_CSRF_COOKIE_NAME;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const raw = document.cookie;
  if (!raw) return undefined;

  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of raw.split("; ")) {
    if (!part.startsWith(prefix)) continue;
    const value = part.slice(prefix.length);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return undefined;
}

export function readCsrfTokenFromCookie(): string | undefined {
  return readCookie(getCsrfCookieName());
}

async function safeReadJson(response: Response): Promise<unknown | undefined> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function messageFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const maybe = body as ApiErrorBody;
  if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
  return undefined;
}

function isCsrfTokenBody(body: unknown): body is CsrfTokenBody {
  if (!body || typeof body !== "object") return false;
  const token = (body as Partial<CsrfTokenBody>).csrfToken;
  return typeof token === "string" && token.trim().length > 0;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { retryOnCsrf?: boolean },
): Promise<ApiResult<T>> {
  const url = `${getApiBaseUrl()}${path}`;

  const method = (init?.method ?? "GET").toUpperCase();
  const isSafeMethod = method === "GET" || method === "HEAD" || method === "OPTIONS";

  async function fetchNewCsrfToken(): Promise<string | undefined> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/csrf-token`, {
        method: "GET",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });

      const body = await safeReadJson(response);
      if (!response.ok) return undefined;
      if (!isCsrfTokenBody(body)) return undefined;
      return body.csrfToken;
    } catch {
      return undefined;
    }
  }

  async function tryRefreshAccessToken(): Promise<boolean> {
    try {
      let csrf = readCsrfTokenFromCookie();
      if (!csrf) csrf = await fetchNewCsrfToken();
      if (!csrf) return false;

      const response = await fetch(`${getApiBaseUrl()}/api/users/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf,
        },
        body: JSON.stringify({}),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  function isCsrfInvalid(body: unknown): boolean {
    if (!body || typeof body !== "object") return false;
    const maybe = body as ApiErrorBody;
    return maybe.code === "CSRF_INVALID";
  }

  async function run(
    hasRetried: boolean,
    csrfOverride?: string,
    hasRetriedAuth?: boolean,
  ): Promise<ApiResult<T>> {
    let response: Response;

    const headers = new Headers(init?.headers ?? undefined);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");

    // If the caller forgot the CSRF header, try to use the CSRF cookie.
    if (!isSafeMethod && typeof csrfOverride === "string") {
      headers.set(CSRF_HEADER_NAME, csrfOverride);
    } else if (!isSafeMethod && !headers.has(CSRF_HEADER_NAME)) {
      const cookieToken = readCsrfTokenFromCookie();
      if (cookieToken) headers.set(CSRF_HEADER_NAME, cookieToken);
    }

    try {
      response = await fetch(url, {
        ...init,
        credentials: "include",
        headers,
      });
    } catch (error) {
      return {
        ok: false,
        status: 0,
        message:
          error instanceof Error
            ? error.message
            : "Network error while fetching",
      };
    }

    const body = await safeReadJson(response);

    if (!response.ok) {
      const shouldRetryAuth =
        !hasRetriedAuth && response.status === 401 && path !== "/api/users/refresh-token";

      if (shouldRetryAuth) {
        const refreshed = await tryRefreshAccessToken();
        if (refreshed) {
          return run(hasRetried, csrfOverride, true);
        }
      }

      const shouldRetry =
        !hasRetried &&
        !isSafeMethod &&
        (options?.retryOnCsrf ?? true) &&
        response.status === 403 &&
        isCsrfInvalid(body);

      if (shouldRetry) {
        const refreshed = await fetchNewCsrfToken();
        if (refreshed) {
          // Re-run the request once with the newly issued token.
          return run(true, refreshed, hasRetriedAuth);
        }
      }

      return {
        ok: false,
        status: response.status,
        message: messageFromBody(body) ?? response.statusText,
        body,
      };
    }

    return { ok: true, data: body as T };
  }

  return run(false);
}

export async function getCsrfToken(): Promise<ApiResult<{ csrfToken: string }>> {
  return apiFetch<{ csrfToken: string }>("/csrf-token", { method: "GET" });
}
