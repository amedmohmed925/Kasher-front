/* Kasher — SuperAdmin workspace. Modern functional operations panel for platform controllers. */
import { useEffect, useState } from "react";
import { ArrowRight, Bell, FileCheck2, PackageSearch, Plus, ShieldAlert, Store, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import * as saApi from "@/lib/superAdminApi";

const sections: Record<string, { title: string; description: string; icon: any }> = {
  traders: { title: "التجار والأدمنز", description: "إدارة حسابات أصحاب المتاجر وصلاحياتهم على المنصة.", icon: Users },
  subscriptions: { title: "الاشتراكات", description: "مراجعة طلبات الاشتراك واعتمادها أو رفضها.", icon: FileCheck2 },
  products: { title: "منتجات المنصة", description: "عرض المنتجات عبر جميع التجار مع التصفية حسب التاجر.", icon: PackageSearch },
  invoices: { title: "فواتير المنصة", description: "متابعة حركة الفواتير على مستوى النظام بالكامل.", icon: FileCheck2 },
};

export default function SuperAdminSection({ section }: { section: string }) {
  const [, navigate] = useLocation();
  const current = sections[section] || sections.traders;
  const Icon = current.icon;
  const go = (key: string) => navigate(key === "overview" ? "/super-admin" : `/super-admin/${key}`);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#172433]">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[270px] border-l border-[#e7e0d4] bg-[#fbfaf7] px-5 py-6 lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172433]">
            <img src="/manus-storage/kasher-mark_178c0f71.png" alt="Kasher" className="h-7 w-7" />
          </div>
          <div>
            <b className="font-display text-xl">Kasher</b>
            <p className="text-[10px] text-[#8a8378]">إدارة النظام</p>
          </div>
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a39b90]">نطاق المنصة</p>
        <nav className="space-y-1">
          <button onClick={() => go("overview")} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm text-[#6f6b65] hover:bg-[#f0ebe3]">
            <ArrowRight size={17} /> نظرة عامة
          </button>
          {Object.entries(sections).map(([key, item]) => {
            const NavIcon = item.icon;
            return (
              <button
                key={key}
                onClick={() => go(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm transition ${key === section ? "bg-[#172433] font-semibold text-white shadow-[0_7px_18px_rgba(23,36,51,.12)]" : "text-[#6f6b65] hover:bg-[#f0ebe3]"}`}
              >
                <NavIcon size={17} />
                <span>{item.title}</span>
                {key === section && <i className="mr-auto h-1.5 w-1.5 rounded-full bg-[#d99a78]" />}
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="flex h-[76px] items-center justify-between border-b border-[#e9e3d9] bg-[#fbfaf7] px-5 md:px-9 lg:mr-[270px]">
        <button onClick={() => go("overview")} className="flex items-center gap-3 text-sm font-bold">
          <ArrowRight size={16} />
          <span className="font-display text-xl">{current.title}</span>
        </button>
        <Button variant="outline" onClick={() => go("overview")} className="gap-2 rounded-xl border-[#ded5c9] bg-transparent">
          <ArrowRight size={16} /> لوحة النظام
        </Button>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-9 md:px-9 md:py-12 lg:mr-[270px]">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold text-[#637c5d]">إدارة المنصة</p>
            <h1 className="font-display text-3xl font-bold tracking-[-.04em]">{current.title}</h1>
            <p className="mt-2 text-sm text-[#898278]">{current.description}</p>
          </div>
        </div>

        <div className="mb-7 flex flex-wrap gap-2">
          {Object.entries(sections).map(([key, item]) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${key === section ? "bg-[#172433] text-white" : "border border-[#e4dcd1] bg-[#fffdfa] text-[#7b756c] hover:bg-white"}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {section === "traders" && <TradersContent />}
        {section === "subscriptions" && <SubscriptionsContent />}
        {section === "products" && <PlatformProductsContent />}
        {section === "invoices" && <PlatformInvoicesContent />}
      </main>
    </div>
  );
}

function TradersContent() {
  const [tenants, setTenants] = useState<saApi.Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ tenantId: "", name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    saApi.listTenants()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.tenants || [];
        setTenants(list);
      })
      .catch((err) => setError(err.message || "تعذر تحميل التجار"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (tenantId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التاجر وجميع بياناته نهائياً؟")) return;
    try {
      await saApi.deleteTenant(tenantId);
      load();
    } catch (err: any) {
      alert(err.message || "فشل حذف التاجر");
    }
  };

  const handleDisable = async (tenantId: string) => {
    try {
      await saApi.disableTenant(tenantId);
      alert("تم تعطيل اشتراك التاجر بنجاح");
      load();
    } catch (err: any) {
      alert(err.message || "فشل تعطيل التاجر");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.tenantId || !newAdmin.name || !newAdmin.email || !newAdmin.password) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setCreating(true);
    try {
      await saApi.createAdminUser(newAdmin);
      setCreateOpen(false);
      setNewAdmin({ tenantId: "", name: "", email: "", password: "" });
      load();
    } catch (err: any) {
      alert(err.message || "تعذر إنشاء المسؤول");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-[#fffdfa] border border-[#e9e3d9] p-4 rounded-2xl">
        <div>
          <h3 className="font-bold text-sm">قائمة التجار النشطين</h3>
          <p className="text-xs text-[#8c8479] mt-0.5">تتبع أداء حسابات الشركات وإدارة اشتراكاتهم</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-xl bg-[#172433] hover:bg-[#203348] text-white">
          <Plus size={15} /> إضافة مسؤول لشركة
        </Button>
      </div>

      {error && <p className="p-3 text-xs text-[#9b4c32] bg-[#f9e7df] rounded-xl">{error}</p>}

      {loading ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">جاري التحميل...</p>
      ) : tenants.length === 0 ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">لا يوجد تجار مسجلين بعد.</p>
      ) : (
        <div className="bg-[#fffdfa] border border-[#e9e3d9] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#faf7f1] text-[#716960] font-bold border-b border-[#e9e3d9]">
                <tr>
                  <th className="p-3">اسم المتجر</th>
                  <th className="p-3">اسم المسؤول</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">الخطة</th>
                  <th className="p-3">حالة الاشتراك</th>
                  <th className="p-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee8df]">
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-[#faf9f6] transition">
                    <td className="p-3 font-semibold text-[#172433]">{tenant.name}</td>
                    <td className="p-3">{tenant.admin?.name || "—"}</td>
                    <td className="p-3">{tenant.admin?.email || "—"}</td>
                    <td className="p-3">
                      <Badge className="bg-[#f0dfd5] text-[#a76040] hover:bg-[#f0dfd5] text-[10px]">
                        {tenant.subscription?.plan === "trial" ? "فترة تجريبية" : "مميز Premium"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={tenant.subscription?.status === "approved" ? "bg-[#e6f0e5] text-[#5d805a] hover:bg-[#e6f0e5] text-[10px]" : "bg-[#f3e9d2] text-[#9b763d] hover:bg-[#f3e9d2] text-[10px]"}>
                        {tenant.subscription?.status === "approved" ? "نشط ومفعّل" : "بانتظار التأكيد"}
                      </Badge>
                    </td>
                    <td className="p-3 text-left space-x-2 space-x-reverse">
                      <Button variant="outline" onClick={() => handleDisable(tenant.tenantId)} className="h-7 text-[10px] rounded-lg border-[#e0d7cb]">تعطيل</Button>
                      <Button variant="destructive" onClick={() => handleDelete(tenant.tenantId)} className="h-7 text-[10px] rounded-lg bg-[#a76040] text-white hover:bg-[#905235]"><Trash2 size={13} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-[#fffdfa] border-[#e9e3d9] rounded-2xl" dir="rtl">
          <form onSubmit={handleCreateAdmin}>
            <DialogHeader className="text-right">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">إضافة مسؤول جديد لشركة</DialogTitle>
              <DialogDescription className="text-xs text-[#999187] mt-1">تتيح لك هذه الواجهة ربط مسؤول (أدمن) جديد بأحد الشركات المسجلة حالياً.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">اختر الشركة *</Label>
                <select
                  required
                  value={newAdmin.tenantId}
                  onChange={(e) => setNewAdmin({ ...newAdmin, tenantId: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#e1d8cc] bg-[#faf7f1] px-3 text-xs"
                >
                  <option value="">اختر الشركة...</option>
                  {tenants.map((t) => (
                    <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">الاسم بالكامل *</Label>
                <Input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="محمد أحمد" className="border-[#e1d8cc] bg-[#faf7f1] rounded-xl text-xs" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">البريد الإلكتروني *</Label>
                <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="admin@company.com" className="border-[#e1d8cc] bg-[#faf7f1] rounded-xl text-xs" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">كلمة المرور *</Label>
                <Input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="••••••••" className="border-[#e1d8cc] bg-[#faf7f1] rounded-xl text-xs" required />
              </div>
            </div>
            <DialogFooter className="flex flex-row gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl border-[#e1d8cc] text-xs">إلغاء</Button>
              <Button type="submit" disabled={creating} className="rounded-xl bg-[#172433] hover:bg-[#203348] text-white text-xs">{creating ? "جاري الحفظ..." : "إضافة مسؤول"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubscriptionsContent() {
  const [tenants, setTenants] = useState<saApi.Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    saApi.listTenants()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.tenants || [];
        setTenants(list);
      })
      .catch((err) => setError(err.message || "تعذر تحميل طلبات الاشتراكات"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (subId: string) => {
    if (!confirm("هل أنت متأكد من تفعيل هذا الاشتراك؟")) return;
    try {
      await saApi.approveSubscription({ subscriptionId: subId, status: "approved" });
      alert("تم تفعيل الاشتراك بنجاح");
      load();
    } catch (err: any) {
      alert(err.message || "فشل تفعيل الاشتراك");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setProcessing(true);
    try {
      await saApi.approveSubscription({ subscriptionId: rejectId, status: "rejected", rejectionReason: reason.trim() });
      setRejectOpen(false);
      setReason("");
      setRejectId("");
      alert("تم رفض طلب الاشتراك وإشعار التاجر بالسبب");
      load();
    } catch (err: any) {
      alert(err.message || "فشل معالجة طلب الرفض");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#fffdfa] border border-[#e9e3d9] p-5 rounded-2xl">
        <h3 className="font-bold text-sm">مراجعة الاشتراكات والمعاينات المعلقة</h3>
        <p className="text-xs text-[#8c8479] mt-0.5">اعتماد تراخيص التشغيل وفترة الـ 30 يوم للتجار الجدد</p>
      </div>

      {error && <p className="p-3 text-xs text-[#9b4c32] bg-[#f9e7df] rounded-xl">{error}</p>}

      {loading ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">جاري التحميل...</p>
      ) : tenants.length === 0 ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">لا توجد طلبات اشتراكات معلقة.</p>
      ) : (
        <div className="bg-[#fffdfa] border border-[#e9e3d9] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#faf7f1] text-[#716960] font-bold border-b border-[#e9e3d9]">
                <tr>
                  <th className="p-3">اسم المتجر</th>
                  <th className="p-3">الخطة المطلوبة</th>
                  <th className="p-3">قيمة الاشتراك</th>
                  <th className="p-3">تاريخ التقديم</th>
                  <th className="p-3">الحالة الحالية</th>
                  <th className="p-3 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee8df]">
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-[#faf9f6] transition">
                    <td className="p-3 font-semibold text-[#172433]">{tenant.name}</td>
                    <td className="p-3">{tenant.subscription?.plan === "trial" ? "فترة تجريبية 30 يوم" : "مميز السنوي"}</td>
                    <td className="p-3">{tenant.subscription?.price || 0} ج.م</td>
                    <td className="p-3">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="p-3">
                      <Badge className={tenant.subscription?.status === "approved" ? "bg-[#e6f0e5] text-[#5d805a] hover:bg-[#e6f0e5] text-[10px]" : tenant.subscription?.status === "rejected" ? "bg-[#f9e7df] text-[#9b4c32] hover:bg-[#f9e7df] text-[10px]" : "bg-[#f3e9d2] text-[#9b763d] hover:bg-[#f3e9d2] text-[10px]"}>
                        {tenant.subscription?.status === "approved" ? "مقبول" : tenant.subscription?.status === "rejected" ? "مرفوض" : "بانتظار المراجعة"}
                      </Badge>
                    </td>
                    <td className="p-3 text-left space-x-2 space-x-reverse">
                      {tenant.subscription?.status === "pending" && (
                        <>
                          <Button onClick={() => handleApprove(tenant.tenantId)} className="h-7 text-[10px] rounded-lg bg-[#637c5d] hover:bg-[#52684d] text-white">تفعيل</Button>
                          <Button variant="outline" onClick={() => { setRejectId(tenant.tenantId); setRejectOpen(true); }} className="h-7 text-[10px] rounded-lg border-[#a76040] text-[#a76040] hover:bg-[#fcf3ee]">رفض</Button>
                        </>
                      )}
                      {tenant.subscription?.status !== "pending" && <span className="text-[#8c8479] text-[10px]">مكتمل</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md bg-[#fffdfa] border-[#e9e3d9] rounded-2xl" dir="rtl">
          <form onSubmit={handleRejectSubmit}>
            <DialogHeader className="text-right">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2 text-[#a76040]"><ShieldAlert size={20} /> رفض طلب الاشتراك</DialogTitle>
              <DialogDescription className="text-xs text-[#999187] mt-1">يرجى كتابة سبب واضح للرفض (مثل: صورة التحويل البنكي غير واضحة) لتنبيه التاجر.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">سبب الرفض *</Label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="اكتب السبب هنا بالتفصيل..."
                  className="w-full h-24 rounded-xl border border-[#e1d8cc] bg-[#faf7f1] p-3 text-xs focus:outline-none focus:border-[#b96f4a]"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-row gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl border-[#e1d8cc] text-xs">إلغاء</Button>
              <Button type="submit" disabled={processing} className="rounded-xl bg-[#a76040] hover:bg-[#905235] text-white text-xs">{processing ? "جاري الإرسال..." : "تأكيد الرفض"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlatformProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    saApi.getSuperAdminStats()
      .then((res) => {
        setProducts(res.products || []);
      })
      .catch((err) => setError(err.message || "تعذر تحميل قائمة المنتجات"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    `${p.name} ${p.barcode || ""} ${p.sku || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fffdfa] border border-[#e9e3d9] p-5 rounded-2xl gap-3">
        <div>
          <h3 className="font-bold text-sm">منتجات جميع المتاجر</h3>
          <p className="text-xs text-[#8c8479] mt-0.5">مراقبة المنتجات المعروضة والـ SKUs عبر المنصة ككل</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو SKU..."
            className="text-xs h-10 border-[#e0d7cb]"
          />
        </div>
      </div>

      {error && <p className="p-3 text-xs text-[#9b4c32] bg-[#f9e7df] rounded-xl">{error}</p>}

      {loading ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">لا توجد منتجات مطابقة للبحث.</p>
      ) : (
        <div className="bg-[#fffdfa] border border-[#e9e3d9] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#faf7f1] text-[#716960] font-bold border-b border-[#e9e3d9]">
                <tr>
                  <th className="p-3">اسم المنتج</th>
                  <th className="p-3">رمز SKU</th>
                  <th className="p-3">سعر الشراء</th>
                  <th className="p-3">سعر البيع</th>
                  <th className="p-3 text-left">معرّف التاجر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee8df]">
                {filtered.map((product, idx) => (
                  <tr key={idx} className="hover:bg-[#faf9f6] transition">
                    <td className="p-3 font-semibold text-[#172433]">{product.name}</td>
                    <td className="p-3 text-[#77736f]">{product.barcode || product.sku}</td>
                    <td className="p-3">{product.originalPrice} ج.م</td>
                    <td className="p-3 text-[#b96f4a] font-bold">{product.sellingPrice} ج.م</td>
                    <td className="p-3 text-left text-[#8c8479] font-mono">{product.tenantId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformInvoicesContent() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    saApi.getTenantsStats()
      .then((res) => setStats(res || []))
      .catch((err) => setError(err.message || "تعذر تحميل فواتير المنصة"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-[#fffdfa] border border-[#e9e3d9] p-5 rounded-2xl">
        <h3 className="font-bold text-sm">حركة فواتير جميع المتاجر</h3>
        <p className="text-xs text-[#8c8479] mt-0.5">تفاصيل مبيعات وفواتير كل متجر بشكل مجمع ومباشر من قواعد البيانات</p>
      </div>

      {error && <p className="p-3 text-xs text-[#9b4c32] bg-[#f9e7df] rounded-xl">{error}</p>}

      {loading ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">جاري التحميل...</p>
      ) : stats.length === 0 ? (
        <p className="text-center py-12 text-sm text-[#8c8479]">لا توجد إحصائيات فواتير متاحة حالياً.</p>
      ) : (
        <div className="space-y-4">
          {stats.map((tenantStat, idx) => (
            <div key={idx} className="bg-[#fffdfa] border border-[#e9e3d9] p-5 rounded-2xl hover:shadow-[0_8px_20px_rgba(45,36,25,.03)] transition">
              <div className="flex justify-between items-center border-b border-[#eee8df] pb-3 mb-3">
                <span className="font-display text-base font-bold text-[#172433] flex items-center gap-2"><Store className="text-[#b96f4a]" size={18} /> {tenantStat.tenant?.name || "متجر مسجل"}</span>
                <span className="font-display text-sm font-bold text-[#b96f4a]">إجمالي الأرباح: {(tenantStat.totalProfit || 0).toLocaleString("ar-EG")} ج.م</span>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] text-[#8c8479]">الفواتير الصادرة مؤخراً:</p>
                {Array.isArray(tenantStat.invoices) && tenantStat.invoices.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tenantStat.invoices.map((inv: any, iIdx: number) => (
                      <div key={iIdx} className="bg-[#faf7f1] p-3 rounded-xl border border-[#eee8df] flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-[#172433]">{inv.invoiceNumber || `فاتورة #${inv._id.slice(-6)}`}</p>
                          <p className="text-[10px] text-[#8c8479] mt-0.5">{inv.createdAt ? new Date(inv.createdAt).toLocaleString("ar-EG") : ""}</p>
                        </div>
                        <span className="font-bold text-[#b96f4a]">{inv.totalAmount || 0} ج.م</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8c8479] italic py-2">لا توجد فواتير مسجلة للمتجر بعد.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
