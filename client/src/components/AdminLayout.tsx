import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  BarChart3,
  UserRound,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard, path: "/admin" },
  { key: "pos", label: "نقطة البيع", icon: ShoppingCart, path: "/admin/pos" },
  { key: "products", label: "المنتجات والمخزون", icon: Package, path: "/admin/products" },
  { key: "invoices", label: "الفواتير", icon: FileText, path: "/admin/invoices" },
  { key: "customers", label: "العملاء", icon: Users, path: "/admin/customers" },
  { key: "analytics", label: "التقارير والتحليلات", icon: BarChart3, path: "/admin/analytics" },
  { key: "profile", label: "الملف الشخصي", icon: UserRound, path: "/admin/profile" },
];

export default function AdminLayout({
  activeKey,
  children,
  title,
  eyebrow,
  description,
  actionButton,
}: {
  activeKey: string;
  children: ReactNode;
  title: string;
  eyebrow: string;
  description: string;
  actionButton?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const currentItem = navItems.find((item) => item.key === activeKey) || navItems[0];

  const SidebarContent = () => (
    <>
      <div className="mb-11 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#b96f4a] shadow-[0_8px_20px_rgba(185,111,74,.2)]">
            <img
              src="/manus-storage/kasher-mark_178c0f71.png"
              alt="Kasher"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight">Kasher</p>
            <p className="text-[11px] text-[#8a8378]">نظام تشغيل متجرك</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 text-[#8a8378] lg:hidden"
          aria-label="إغلاق القائمة"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-5 rounded-2xl bg-[#edf0f1] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9d2c4] text-xs font-bold text-[#8f4e34]">
            {(user?.companyName || user?.firstName || "م")[0]}
          </div>
          <div>
            <p className="text-xs font-bold">{user?.firstName || "تاجر Kasher"}</p>
            <p className="text-[10px] text-[#7f898f]">{user?.companyName || "المتجر"}</p>
          </div>
        </div>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a39b90]">
        مساحة العمل
      </p>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm transition-all ${
                selected
                  ? "bg-[#172433] font-semibold text-white shadow-[0_7px_18px_rgba(23,36,51,.12)]"
                  : "text-[#6f6b65] hover:bg-[#f0ebe3] hover:text-[#172433]"
              }`}
            >
              <Icon size={18} strokeWidth={selected ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {selected && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[#d99a78]" />}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-7 right-8 flex items-center gap-2 text-xs font-bold text-[#9b5540]"
      >
        <LogOut size={15} /> تسجيل الخروج
      </button>
    </>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#172433] selection:bg-[#b96f4a]/20">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/manus-storage/kasher-dashboard-texture_2e4a005c.png')] bg-cover bg-center opacity-[0.08]" />

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[270px] border-l border-[#e7e0d4] bg-[#fbfaf7]/95 px-5 py-6 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[270px] border-l border-[#e7e0d4] bg-[#fbfaf7]/95 px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#172433]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق القائمة"
        />
      )}

      {/* Content wrapper */}
      <main className="relative z-10 min-h-screen lg:mr-[270px]">
        {/* Header */}
        <header className="flex h-[76px] items-center justify-between border-b border-[#e9e3d9] bg-[#fbfaf7]/75 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#e5dfd5] bg-white p-2.5 lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu size={19} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-[#8a8378] sm:flex">
              <span>مساحة التاجر</span>
              <span className="text-[#c6bdb1]">/</span>
              <span className="font-semibold text-[#172433]">{currentItem.label}</span>
            </div>
            <div className="sm:hidden font-display text-lg font-bold">{currentItem.label}</div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 pl-2 transition hover:bg-[#f0ebe3]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9d2c4] text-sm font-bold text-[#8f4e34]">
                  {(user?.companyName || user?.firstName || "م")[0]}
                </div>
                <div className="hidden text-right md:block">
                  <p className="text-xs font-bold">{user?.companyName || "متجر المذاق"}</p>
                  <p className="text-[10px] text-[#999187]">الفرع الرئيسي</p>
                </div>
                <ChevronDown size={15} className={`text-[#948d82] transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {profileMenuOpen && (
                <>
                  {/* Backdrop click outside container */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-48 rounded-xl border border-[#e9e3d9] bg-[#fffdfa] py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        navigate("/admin/profile");
                        setProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-right text-xs text-[#172433] hover:bg-[#f5f2eb] font-semibold transition"
                    >
                      <UserRound size={14} className="text-[#8a8378]" />
                      <span>الملف الشخصي</span>
                    </button>
                    <div className="h-px bg-[#e9e3d9] my-1" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-right text-xs text-[#9b5540] hover:bg-[#fcf3ee] font-bold transition"
                    >
                      <LogOut size={14} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-9 md:py-11">
          {/* Section title header */}
          <section className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold text-[#b96f4a]">{eyebrow}</p>
              <h1 className="font-display text-3xl font-bold tracking-[-.04em] text-[#172433] md:text-[38px]">
                {title}
              </h1>
              <p className="mt-2 text-sm text-[#898278]">{description}</p>
            </div>
            {actionButton && <div className="flex gap-2">{actionButton}</div>}
          </section>

          {/* Children contents */}
          {children}
        </div>
      </main>
    </div>
  );
}
