/**
 * Kasher — Authenticated API boundary.
 * Access tokens are short-lived; refresh tokens renew them once per failed request.
 */
export const API_BASE_URL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5000" : "https://kasher-project.vercel.app";
export const ACCESS_TOKEN_KEY = "kasher.accessToken";
export const REFRESH_TOKEN_KEY = "kasher.refreshToken";
let refreshInFlight: Promise<string | null> | null = null;

export function setAuthTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}
export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("kasher.session");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kasher-auth-expired"));
  }
}
export function getAccessToken() { return localStorage.getItem(ACCESS_TOKEN_KEY); }

async function readPayload(response: Response): Promise<unknown> {
  const type = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (type.includes("application/json")) { try { return await response.json(); } catch { return null; } }
  return response.text();
}
export class ApiError extends Error {
  constructor(public readonly status: number, public readonly payload: unknown, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
function errorMessage(payload: unknown, status: number) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (record.error && typeof record.error === "object" && typeof (record.error as Record<string, unknown>).message === "string") return String((record.error as Record<string, unknown>).message);
  }
  return `Request failed with ${status}`;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;
  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
      const payload = await readPayload(response) as { token?: string } | null;
      if (!response.ok || !payload?.token) { clearAuthTokens(); return null; }
      localStorage.setItem(ACCESS_TOKEN_KEY, payload.token);
      return payload.token;
    } catch { clearAuthTokens(); return null; }
    finally { refreshInFlight = null; }
  })();
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, canRefresh = true): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await readPayload(response);
  if (response.status === 401 && canRefresh && !path.includes("/api/auth/refresh-token") && !path.includes("/api/auth/login")) {
    const renewed = await refreshAccessToken();
    if (renewed) return apiRequest<T>(path, options, false);
  }
  if (!response.ok) throw new ApiError(response.status, payload, errorMessage(payload, response.status));
  return payload as T;
}
export function apiGet<T = unknown>(path: string) { return apiRequest<T>(path); }
export function apiPost<T = unknown>(path: string, body: unknown) { return apiRequest<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }); }
export function apiPut<T = unknown>(path: string, body: unknown) { return apiRequest<T>(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }); }
export function apiDelete<T = unknown>(path: string) { return apiRequest<T>(path, { method: "DELETE" }); }
