/**
 * Kasher — Warm Functional Modernism. Route-level authorization mirrors the
 * backend roles: admin owns a merchant workspace; superAdmin owns the platform.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, Redirect, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth, type UserRole } from "./contexts/AuthContext";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const AdminSection = lazy(() => import("./pages/AdminSection"));
const SuperAdminSection = lazy(() => import("./pages/SuperAdminSection"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Guard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const fallback = user?.role === "admin" ? "/admin" : "/super-admin";
  useEffect(() => {
    if (user && user.role !== role) navigate(fallback, { replace: true });
  }, [fallback, navigate, role, user]);
  if (!user) return <Redirect to="/login" />;
  if (user.role !== role) return null;
  return <>{children}</>;
}

function RouteFallback() {
  return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-sm text-[#77736f]">جاري تحميل مساحة العمل...</div>;
}

function Router() {
  return <Suspense fallback={<RouteFallback />}><Switch>
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/admin"><Guard role="admin"><Home /></Guard></Route>
    <Route path="/admin/pos"><Guard role="admin"><AdminSection section="pos" /></Guard></Route>
    <Route path="/admin/products"><Guard role="admin"><AdminSection section="products" /></Guard></Route>
    <Route path="/admin/invoices"><Guard role="admin"><AdminSection section="invoices" /></Guard></Route>
    <Route path="/admin/customers"><Guard role="admin"><AdminSection section="customers" /></Guard></Route>
    <Route path="/admin/analytics"><Guard role="admin"><AdminSection section="analytics" /></Guard></Route>
    <Route path="/admin/profile"><Guard role="admin"><AdminSection section="profile" /></Guard></Route>
    <Route path="/super-admin"><Guard role="superAdmin"><SuperAdminDashboard /></Guard></Route>
    <Route path="/super-admin/traders"><Guard role="superAdmin"><SuperAdminSection section="traders" /></Guard></Route>
    <Route path="/super-admin/subscriptions"><Guard role="superAdmin"><SuperAdminSection section="subscriptions" /></Guard></Route>
    <Route path="/super-admin/products"><Guard role="superAdmin"><SuperAdminSection section="products" /></Guard></Route>
    <Route path="/super-admin/invoices"><Guard role="superAdmin"><SuperAdminSection section="invoices" /></Guard></Route>
    <Route path="/super-admin/notifications"><Guard role="superAdmin"><SuperAdminSection section="notifications" /></Guard></Route>
    <Route path="/"><Redirect to="/login" /></Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><AuthProvider><Toaster /><Router /></AuthProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
