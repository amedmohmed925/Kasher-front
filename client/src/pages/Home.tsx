/**
 * Kasher — Warm Functional Modernism. RTL-first POS dashboard with warm paper,
 * ink navy, and Kasher copper. Keep actions fast, spacious, and operational.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet, API_BASE_URL } from "@/lib/api";
import type { AdminStats, Product } from "@/lib/adminApi";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";

const navItems = [
  { label: "نظرة عامة", icon: LayoutDashboard },
  { label: "نقطة البيع", icon: ShoppingCart },
  { label: "المنتجات والمخزون", icon: Package },
  { label: "الفواتير", icon: FileText },
  { label: "العملاء", icon: Users },
  { label: "التقارير والتحليلات", icon: BarChart3 },
];

type DashboardProduct = { name: string; sku: string; category: string; price: string; stock: number; tone: string };

const statDefinitions = [
  { label: "الربح اليومي", value: "—", suffix: "ج.م", change: "—", icon: CircleDollarSign, accent: "copper" },
  { label: "الربح الشهري", value: "—", suffix: "ج.م", change: "—", icon: BarChart3, accent: "olive" },
  { label: "الفواتير المكتملة", value: "—", suffix: "فاتورة", change: "—", icon: FileText, accent: "navy" },
];

export default function Home() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("نظرة عامة");
  const [search, setSearch] = useState("");
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [dashboardStats, setDashboardStats] = useState(() => statDefinitions.map(stat => ({ ...stat })));
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [inventoryHealth, setInventoryHealth] = useState({ low: 0, available: 0, total: 0, percent: 0 });
  const [salesTrend, setSalesTrend] = useState<Array<{ label: string; value: number; heightPercent: number }>>([
    { label: "الأحد", value: 0, heightPercent: 15 },
    { label: "الاثنين", value: 0, heightPercent: 25 },
    { label: "الثلاثاء", value: 0, heightPercent: 20 },
    { label: "الأربعاء", value: 0, heightPercent: 30 },
    { label: "الخميس", value: 0, heightPercent: 40 },
    { label: "الجمعة", value: 0, heightPercent: 60 },
    { label: "اليوم", value: 0, heightPercent: 50 },
  ]);

  useEffect(() => {
    apiGet("/api/health").then(() => setApiStatus("online")).catch(() => setApiStatus("offline"));
    Promise.all([
      apiGet<AdminStats>("/api/admin/stats"),
      apiGet<Product[]>("/api/admin/products"),
      apiGet<any[]>("/api/admin/reports").catch(() => [])
    ])
      .then(([remoteStats, remoteProducts, remoteReports]) => {
        setDashboardStats([
          { ...statDefinitions[0], value: Number(remoteStats.dailyProfit ?? remoteStats.todayProfit ?? 0).toLocaleString("ar-SA"), change: "من API" },
          { ...statDefinitions[1], value: Number(remoteStats.monthlyProfit ?? remoteStats.monthProfit ?? 0).toLocaleString("ar-SA"), change: "من API" },
          { ...statDefinitions[2], value: String(remoteStats.totalInvoices ?? remoteStats.invoicesCount ?? 0), change: "من API" },
        ]);

        if (Array.isArray(remoteProducts)) {
          setDashboardProducts(remoteProducts.map((item) => ({
            name: item.name,
            sku: item.barcode || item.sku || "",
            category: typeof item.categoryId === "object" && item.categoryId ? item.categoryId.name : "منتج",
            price: String(Number(item.sellingPrice || 0)),
            stock: Number(item.quantity || 0),
            tone: "bg-[#f3e4dc]"
          })));

          const total = remoteProducts.length;
          const low = remoteProducts.filter(p => Number(p.quantity) < 10).length;
          const available = Math.max(0, total - low);
          const percent = total > 0 ? Math.round((low / total) * 100) : 0;
          setInventoryHealth({ low, available, total, percent });
        }

        // Calculate last 7 days sales trend
        const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
          const dayName = dayNames[d.getDay()];
          return { dateStr, dayName, value: 0 };
        });

        if (Array.isArray(remoteReports)) {
          remoteReports.forEach((rep) => {
            const found = last7Days.find(day => day.dateStr === rep._id);
            if (found) {
              found.value = rep.totalSales || 0;
            }
          });
        }

        const maxSales = Math.max(...last7Days.map(d => d.value), 1);
        const trend = last7Days.map(day => ({
          label: day.dayName,
          value: day.value,
          heightPercent: Math.max(10, Math.round((day.value / maxSales) * 100))
        }));
        setSalesTrend(trend);
      })
      .catch(() => undefined)
      .finally(() => setDataLoading(false));
  }, []);

  const selectNav = (label: string) => {
    setActive(label);
    const routes: Record<string, string> = {
      "نقطة البيع": "/admin/pos",
      "المنتجات والمخزون": "/admin/products",
      الفواتير: "/admin/invoices",
      العملاء: "/admin/customers",
      "التقارير والتحليلات": "/admin/analytics",
    };
    if (routes[label]) setLocation(routes[label]);
  };

  const filteredProducts = useMemo(
    () =>
      dashboardProducts.filter(product =>
        `${product.name} ${product.sku}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search, dashboardProducts],
  );

  return (
    <AdminLayout
      activeKey="overview"
      title={`صباح الخير، ${user?.firstName || "محمد"}`}
      eyebrow="لوحة التحكم"
      description="هذه صورة واضحة عن أداء متجرك اليوم."
      actionButton={
        <>
          {user ? (
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                setLocation("/login");
              }}
              className="h-11 gap-2 rounded-xl border-[#ddd4c8] bg-[#fbfaf7] px-4 text-[#9b5540] hover:bg-white"
            >
              تسجيل الخروج
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              className="h-11 gap-2 rounded-xl border-[#ddd4c8] bg-[#fbfaf7] px-4 text-[#172433] hover:bg-white"
            >
              <LogIn size={16} /> تسجيل الدخول
            </Button>
          )}
          <Button
            onClick={() => selectNav("نقطة البيع")}
            className="h-11 gap-2 rounded-xl bg-[#b96f4a] px-5 text-white shadow-[0_8px_18px_rgba(185,111,74,.2)] hover:bg-[#a96040]"
          >
            <ShoppingCart size={16} /> افتح نقطة البيع
          </Button>
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${apiStatus === "online" ? "bg-[#6e8d65]" : apiStatus === "offline" ? "bg-[#b96f4a]" : "animate-pulse bg-[#c4a56e]"}`}
        />
        <span className="text-xs font-medium text-[#7d776e]">
          {apiStatus === "online"
            ? "متصل بالباك إند"
            : apiStatus === "offline"
              ? "وضع العرض — تعذر الاتصال"
              : "جاري فحص الاتصال"}
        </span>
      </div>
          <section className="grid gap-4 md:grid-cols-3">
            {dashboardStats.map(stat => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 shadow-[0_7px_24px_rgba(45,36,25,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(45,36,25,.07)]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent === "copper" ? "bg-[#f3ded2] text-[#a76040]" : stat.accent === "olive" ? "bg-[#e0e9dc] text-[#637c5d]" : "bg-[#dde5ec] text-[#42617a]"}`}
                    >
                      <Icon size={19} />
                    </div>
                    <span className="rounded-full bg-[#edf3e9] px-2.5 py-1 text-[11px] font-bold text-[#63805b]">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-[#888177]">{stat.label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="font-display text-[29px] font-bold tracking-[-.04em] text-[#172433]">
                      {stat.value}
                    </p>
                    <span className="text-xs text-[#9d968b]">
                      {stat.suffix}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_.75fr]">
            <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 shadow-[0_7px_24px_rgba(45,36,25,.035)] md:p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    حركة المبيعات
                  </h2>
                  <p className="mt-1 text-xs text-[#999187]">
                    آخر 7 أيام · مقارنة بالأسبوع السابق
                  </p>
                </div>
                <button className="rounded-lg p-2 text-[#81796e] hover:bg-[#f0ebe3]">
                  <MoreDots />
                </button>
              </div>
              <div className="relative h-[210px] overflow-hidden rounded-xl bg-[#faf7f1] p-4">
                <div className="absolute inset-x-4 top-12 border-t border-dashed border-[#e7dfd3]" />
                <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#e7dfd3]" />
                <div className="absolute inset-x-4 bottom-10 border-t border-dashed border-[#e7dfd3]" />
                <div className="absolute inset-x-5 bottom-9 flex h-[145px] items-end justify-between gap-2">
                  {salesTrend.map((day, index) => (
                    <div
                      key={index}
                      className="group flex h-full flex-1 flex-col justify-end"
                      title={`${day.label}: ${day.value.toLocaleString("ar-SA")} ج.م`}
                    >
                      <div
                        className={`mx-auto w-full max-w-[42px] rounded-t-lg transition-all group-hover:bg-[#a96040] ${index === 6 ? "bg-[#b96f4a]" : "bg-[#dfbba8]"}`}
                        style={{ height: `${day.heightPercent}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-5 bottom-2 flex justify-between text-[10px] text-[#a59d92]">
                  {salesTrend.map((day, index) => (
                    <span key={index} className="w-[42px] text-center">
                      {index === 6 ? "اليوم" : day.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-[#172433] p-6 text-white shadow-[0_12px_26px_rgba(23,36,51,.12)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#b8c3cb]">صحة المخزون</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">
                    تحتاج انتباهك
                  </h2>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 text-[#e2ad92]">
                  <Package size={19} />
                </div>
              </div>
              <div className="my-7 flex items-center gap-4">
                <div
                  className="relative h-[96px] w-[96px] rounded-full"
                  style={{
                    background: `conic-gradient(#d99a78 0 ${inventoryHealth.percent}%, #6d8870 ${inventoryHealth.percent}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#172433]">
                    <span className="font-display text-xl font-bold">{inventoryHealth.percent}%</span>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full bg-[#d99a78]" /> منخفض
                    المخزون <strong className="mr-auto">{inventoryHealth.low}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full bg-[#6d8870]" /> متوفر{" "}
                    <strong className="mr-auto">{inventoryHealth.available}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full bg-[#314657]" /> إجمالي
                    الأصناف <strong className="mr-auto">{inventoryHealth.total}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => selectNav("المنتجات والمخزون")}
                className="flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-[#e2ad92] transition hover:text-white"
              >
                مراجعة المخزون <ArrowLeft size={15} />
              </button>
            </div>
          </section>
          <section className="mt-7 rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 shadow-[0_7px_24px_rgba(45,36,25,.035)] md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-lg font-bold">
                  الوصول السريع للمنتجات
                </h2>
                <p className="mt-1 text-xs text-[#999187]">
                  أضف صنفاً إلى سلة البيع بنقرة واحدة
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute right-3 top-3 text-[#a19a90]"
                />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو SKU"
                  className="h-10 rounded-xl border-[#e4dcd1] bg-[#faf8f4] pr-9 text-xs focus-visible:ring-[#b96f4a]"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map(product => (
                <button
                  key={product.sku}
                  onClick={() => selectNav("نقطة البيع")}
                  className="group rounded-xl border border-[#eee8df] bg-[#fffdfa] p-3 text-right transition hover:-translate-y-0.5 hover:border-[#d8b09c] hover:shadow-[0_8px_20px_rgba(45,36,25,.06)]"
                >
                  <div
                    className={`mb-3 flex h-24 items-center justify-center rounded-lg ${product.tone}`}
                  >
                    <div className="h-10 w-8 rounded-[4px] border-2 border-[#8b7162]/30 bg-white/45 shadow-sm" />
                  </div>
                  <p className="truncate text-sm font-bold">{product.name}</p>
                  <p className="mt-1 text-[10px] text-[#a19a90]">
                    {product.sku} · {product.category}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-base font-bold text-[#b96f4a]">
                      {product.price}{" "}
                      <small className="font-sans text-[10px] font-normal">
                        ج.م
                      </small>
                    </span>
                    <span
                      className={`text-[10px] ${product.stock < 10 ? "font-bold text-[#b96f4a]" : "text-[#7b8971]"}`}
                    >
                      {product.stock} متوفر
                    </span>
                  </div>
                </button>
              ))}
              <button
                onClick={() => selectNav("المنتجات والمخزون")}
                className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d8cec0] text-[#9c9387] transition hover:border-[#b96f4a] hover:bg-[#fcf3ee] hover:text-[#a96040]"
              >
                <Plus size={22} />
                <span className="mt-2 text-xs font-bold">إضافة منتج جديد</span>
              </button>
            </div>
          </section>
          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-[#e7e0d4] pt-5 text-[11px] text-[#aaa297] sm:flex-row">
            <span>Kasher · {API_BASE_URL.replace("https://", "")}</span>
            <span className="flex items-center gap-4">
              <a href="#" className="hover:text-[#b96f4a]">
                مركز المساعدة <HelpCircle className="mr-1 inline" size={12} />
              </a>
              <span>الإصدار 1.0.0</span>
            </span>
          </footer>
    </AdminLayout>
  );
}

function MoreDots() {
  return (
    <span className="flex gap-1">
      <i className="h-1 w-1 rounded-full bg-current" />
      <i className="h-1 w-1 rounded-full bg-current" />
      <i className="h-1 w-1 rounded-full bg-current" />
    </span>
  );
}
