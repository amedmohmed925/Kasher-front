/**
 * Kasher — Warm Functional Modernism. Super Admin is an operational command
 * center for the platform, not a merchant dashboard; platform-wide scope is explicit.
 */
import { useEffect, useState } from "react";
import { Bell, ChevronDown, CircleDollarSign, FileCheck2, LayoutDashboard, LogOut, Menu, PackageSearch, ShieldCheck, Store, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { apiGet } from "@/lib/api";

const items = [{ label: "نظرة عامة على النظام", icon: LayoutDashboard }, { label: "التجار والأدمنز", icon: Users }, { label: "الاشتراكات", icon: FileCheck2 }, { label: "منتجات المنصة", icon: PackageSearch }, { label: "فواتير المنصة", icon: FileCheck2 }];
const cards = [{ label: "إجمالي التجار", value: "—", note: "نشطون على المنصة", icon: Store, tone: "bg-[#f3ded2] text-[#a76040]" }, { label: "إجمالي أرباح المنصة", value: "—", note: "مبيعات التجار", icon: CircleDollarSign, tone: "bg-[#f3e9d2] text-[#9b763d]" }, { label: "منتجات المنصة", value: "—", note: "متوفرة للتداول", icon: PackageSearch, tone: "bg-[#e0e9dc] text-[#637c5d]" }];

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(items[0].label);
  const [liveCards, setLiveCards] = useState(cards);
  const [pendingSubs, setPendingSubs] = useState<any[]>([]);

  useEffect(() => {
    apiGet<any>("/api/superAdmin/stats")
      .then((data) => setLiveCards([
        { ...cards[0], value: String(data.tenantsCount ?? data.usersCount ?? 0), note: "تاجر مسجل" },
        { ...cards[1], value: `${(data.profits?.[0]?.total || 0).toLocaleString("ar-SA")} ج.م`, note: "أرباح إجمالية" },
        { ...cards[2], value: `${Array.isArray(data.products) ? data.products.length : 0}`, note: "منتج معروض" }
      ]))
      .catch(() => undefined);

    apiGet<any[]>("/api/superAdmin/subscriptions")
      .then((data) => {
        const recent = (data || []).slice(0, 5);
        setPendingSubs(recent);
      })
      .catch(() => undefined);
  }, []);

  const signOut = () => { logout(); navigate("/login"); };
  const selectSection = (label: string) => {
    setActive(label);
    const routes: Record<string, string> = {
      "التجار والأدمنز": "/super-admin/traders",
      "الاشتراكات": "/super-admin/subscriptions",
      "منتجات المنصة": "/super-admin/products",
      "فواتير المنصة": "/super-admin/invoices"
    };
    if (routes[label]) navigate(routes[label]);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#172433]">
      <aside className={`fixed inset-y-0 right-0 z-40 w-[270px] border-l border-[#e7e0d4] bg-[#fbfaf7]/95 px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#172433]">
              <img src="/manus-storage/kasher-mark_178c0f71.png" alt="Kasher" className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">Kasher</p>
              <p className="text-[11px] text-[#8a8378]">إدارة النظام</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X size={18} /></button>
        </div>
        <div className="mb-5 rounded-2xl bg-[#edf0f1] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cbd8df] text-xs font-bold text-[#476173]">SA</div>
            <div>
              <p className="text-xs font-bold">{user?.firstName || "مدير النظام"}</p>
              <p className="text-[10px] text-[#7f898f]">صلاحية كاملة</p>
            </div>
          </div>
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a39b90]">نطاق المنصة</p>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <button
                key={item.label}
                onClick={() => { selectSection(item.label); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm transition ${selected ? "bg-[#172433] font-semibold text-white shadow-[0_7px_18px_rgba(23,36,51,.12)]" : "text-[#6f6b65] hover:bg-[#f0ebe3]"}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {selected && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[#d99a78]" />}
              </button>
            );
          })}
        </nav>
        <button onClick={signOut} className="absolute bottom-7 right-8 flex items-center gap-2 text-xs font-bold text-[#9b5540]">
          <LogOut size={15} /> تسجيل الخروج
        </button>
      </aside>

      <button className="fixed inset-0 z-30 bg-[#172433]/20 lg:hidden" onClick={() => setOpen(false)} hidden={!open} aria-label="إغلاق القائمة" />

      <main className="min-h-screen lg:mr-[270px]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#e9e3d9] bg-[#fbfaf7]/75 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-xl border border-[#e5dfd5] bg-white p-2.5 lg:hidden">
              <Menu size={19} />
            </button>
            <div>
              <p className="text-xs text-[#8b847b]">لوحة إدارة النظام</p>
              <h1 className="font-display text-lg font-bold">{active}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="hidden gap-1.5 bg-[#e0e9dc] text-[#637c5d] hover:bg-[#e0e9dc] md:flex">
              <i className="h-1.5 w-1.5 rounded-full bg-[#6d8870]" /> المنصة تعمل
            </Badge>
            <button className="relative rounded-xl p-2.5 text-[#777169]">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#b96f4a]" />
            </button>
            <button onClick={signOut} className="hidden items-center gap-2 rounded-xl p-1.5 hover:bg-[#f0ebe3] sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dbe4e9] text-xs font-bold text-[#476173]">SA</div>
              <ChevronDown size={15} className="text-[#948d82]" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-9 md:py-11">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[#7d776e]">
                <span className="h-2 w-2 rounded-full bg-[#637c5d]" /> صلاحيات superAdmin
              </p>
              <h2 className="font-display text-3xl font-bold tracking-[-.04em] md:text-[38px]">
                صورة النظام كاملة <span className="text-[#b96f4a]">.</span>
              </h2>
              <p className="mt-2 text-sm text-[#898278]">تابع التجار، الاشتراكات، وحركة المنصة من مكان واحد.</p>
            </div>
            <Button onClick={() => selectSection("التجار والأدمنز")} className="h-11 gap-2 rounded-xl bg-[#172433] px-5 text-white hover:bg-[#263b4b]">
              <Users size={16} /> إدارة التجار
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {liveCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 shadow-[0_7px_24px_rgba(45,36,25,.035)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                      <Icon size={19} />
                    </div>
                    <span className="text-[11px] font-bold text-[#71836a]">{card.note}</span>
                  </div>
                  <p className="text-sm text-[#888177]">{card.label}</p>
                  <p className="mt-1 font-display text-[29px] font-bold tracking-[-.04em]">{card.value}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-7 grid gap-7 xl:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 shadow-[0_7px_24px_rgba(45,36,25,.035)] md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">آخر طلبات الاشتراك</h3>
                  <p className="mt-1 text-xs text-[#999187]">طلبات تحتاج مراجعة من مدير النظام</p>
                </div>
                <button onClick={() => selectSection("الاشتراكات")} className="text-xs font-bold text-[#b96f4a]">عرض الكل</button>
              </div>
              <div className="space-y-3">
                {pendingSubs.length === 0 ? (
                  <p className="text-center py-12 text-xs text-[#999187] italic">لا توجد طلبات اشتراك مسجلة حالياً.</p>
                ) : (
                  pendingSubs.map((item) => {
                    const name = item.admin?.companyName || item.admin?.name || "تاجر جديد";
                    const plan = item.subscription?.plan === "trial" ? "تجريبي 30 يوم" : item.subscription?.plan === "monthly" ? "شهري مميز" : item.subscription?.plan === "yearly" ? "سنوي مميز" : item.subscription?.plan || "غير محدد";
                    const date = item.subscription?.createdAt ? new Date(item.subscription.createdAt).toLocaleDateString("ar-EG") : "";
                    const status = item.subscription?.status;
                    return (
                      <div key={item.subscription?.id} className="flex items-center gap-3 rounded-xl bg-[#faf7f1] p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0dfd5] text-xs font-bold text-[#a76040]">{name[0] || "S"}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{name}</p>
                          <p className="text-[10px] text-[#a19a90]">خطة: {plan} · تاريخ التقديم: {date}</p>
                        </div>
                        <Badge className={
                          status === "approved"
                            ? "bg-[#e6f0e5] text-[#5d805a] hover:bg-[#e6f0e5] text-[10px]"
                            : status === "rejected"
                              ? "bg-[#f9e7df] text-[#9b4c32] hover:bg-[#f9e7df] text-[10px]"
                              : "bg-[#f3e9d2] text-[#9b763d] hover:bg-[#f3e9d2] text-[10px]"
                        }>
                          {status === "approved" ? "مقبول" : status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#172433] p-6 text-white shadow-[0_12px_26px_rgba(23,36,51,.12)]">
              <p className="text-xs text-[#b8c3cb]">صلاحياتك الحالية</p>
              <h3 className="mt-2 font-display text-2xl font-bold">وصول على مستوى المنصة</h3>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs text-[#c1ccd2]">
                <p className="flex justify-between"><span>إدارة الأدمنز</span><ShieldCheck size={15} className="text-[#b7d0ac]" /></p>
                <p className="flex justify-between"><span>اعتماد الاشتراكات</span><ShieldCheck size={15} className="text-[#b7d0ac]" /></p>
                <p className="flex justify-between"><span>بيانات جميع المتاجر</span><ShieldCheck size={15} className="text-[#b7d0ac]" /></p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
