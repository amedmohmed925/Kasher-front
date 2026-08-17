/**
 * Kasher — Warm Functional Modernism. The backend response is the source of
 * truth for identity and role; preview sessions remain separate and explicit.
 */
import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { apiPost, clearAuthTokens, setAuthTokens } from "@/lib/api";

export type UserRole = "admin" | "superAdmin";
export type SessionUser = { _id?: string; id?: string; firstName?: string; lastName?: string; companyName?: string; role: UserRole; email?: string; tenantId?: string };
type AuthContextValue = { user: SessionUser | null; loading: boolean; login: (email: string, password: string) => Promise<SessionUser>; enterPreview: (role: UserRole) => void; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "kasher.session";
const TOKEN_KEY = "kasher.accessToken";
const REFRESH_KEY = "kasher.refreshToken";

function readStoredUser(): SessionUser | null { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function saveUser(next: SessionUser | null) { if (next) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } else localStorage.removeItem(STORAGE_KEY); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener("kasher-auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("kasher-auth-expired", handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => { setLoading(true); try { const result = await apiPost<{ user: SessionUser; token: string; refreshToken?: string }>("/api/auth/login", { email, password }); if (!result.user?.role || !["admin", "superAdmin"].includes(result.user.role)) throw new Error("استجابة المستخدم لا تحتوي على صلاحية صحيحة."); setAuthTokens(result.token, result.refreshToken); setUser(result.user); saveUser(result.user); return result.user; } finally { setLoading(false); } };
  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, enterPreview: (role) => { clearAuthTokens(); const preview = { role, firstName: role === "admin" ? "محمد" : "مدير النظام", companyName: role === "admin" ? "متجر المذاق" : "Kasher Platform", email: "preview@kasher.local" } as SessionUser; setUser(preview); saveUser(preview); }, logout: async () => { try { if (localStorage.getItem(TOKEN_KEY)) await apiPost("/api/auth/logout", {}); } finally { clearAuthTokens(); localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); setUser(null); saveUser(null); } } }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }
