/**
 * Kasher — Admin workspace. Every view is wired to the live admin contract;
 * loading, empty, error, create, and delete states are explicit.
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { ArrowRight, BarChart3, FileText, LayoutDashboard, LogOut, Package, Plus, Search, ShoppingCart, Trash2, UserRound, Users, Camera } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { createCategory, createCustomer, createInvoice, createProduct, deleteCategory, deleteCustomer, deleteProduct, getAdminReports, getDashboardAnalytics, getAdvancedAnalytics, getAnalytics, getAdminStats, getPeriodAnalytics, compareAnalytics, getDashboardSummary, getComprehensiveDashboard, getAdminById, getCustomers, getCustomer, getCustomerStats, getProfile, listCategories, listInvoices, listAllInvoices, listProducts, updateCategory, updateProduct, updateProfile, type AdminProfile, type AdminStats, type Category, type Customer, type CustomerStats, type Invoice, type Product } from "@/lib/adminApi";

const sections: Record<string, { title: string; eyebrow: string; description: string; icon: typeof Package }> = {
  pos: { title: "نقطة البيع", eyebrow: "عمليات المتجر", description: "ابحث عن المنتجات وأنشئ الفاتورة مباشرة من مخزون متجرك.", icon: ShoppingCart },
  products: { title: "المنتجات والمخزون", eyebrow: "كتالوج المتجر", description: "إدارة المنتجات والتصنيفات والكميات من قاعدة البيانات.", icon: Package },
  invoices: { title: "الفواتير", eyebrow: "المبيعات اليومية", description: "عرض الفواتير الحقيقية المسجلة على حساب متجرك.", icon: FileText },
  customers: { title: "العملاء", eyebrow: "علاقات المتجر", description: "إدارة العملاء وإحصاءات مشترياتهم.", icon: Users },
  analytics: { title: "التقارير والتحليلات", eyebrow: "قراءة الأداء", description: "أرقام حقيقية من تقارير وإحصاءات KasherProject.", icon: BarChart3 },
  profile: { title: "الملف الشخصي", eyebrow: "إعدادات الحساب", description: "إدارة بياناتك وبيانات متجرك وكلمة المرور.", icon: UserRound },
};

export default function AdminSection({ section }: { section: string }) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation(); const current = sections[section] || sections.products; const Icon = current.icon;
  const go = (target: string) => navigate(target === "overview" ? "/admin" : `/admin/${target}`);
  return <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#172433]"><aside className="fixed inset-y-0 right-0 z-30 hidden w-[270px] border-l border-[#e7e0d4] bg-[#fbfaf7] px-5 py-6 lg:block"><div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b96f4a]"><img src="/manus-storage/kasher-mark_178c0f71.png" alt="Kasher" className="h-7 w-7" /></div><div><b className="font-display text-xl">Kasher</b><p className="text-[10px] text-[#8a8378]">مساحة التاجر</p></div></div><div className="mb-5 rounded-2xl bg-[#edf0f1] p-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9d2c4] text-xs font-bold text-[#8f4e34]">{(user?.companyName || user?.firstName || "م")[0]}</div><div><p className="text-xs font-bold">{user?.firstName || "تاجر Kasher"}</p><p className="text-[10px] text-[#7f898f]">{user?.companyName || "المتجر"}</p></div></div></div><button onClick={() => go("overview")} className="mb-5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm text-[#6f6b65] hover:bg-[#f0ebe3]"><LayoutDashboard size={17} /> نظرة عامة</button><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a39b90]">إدارة المتجر</p><nav className="space-y-1 mb-8">{Object.entries(sections).map(([key, item]) => { const NavIcon = item.icon; return <button key={key} onClick={() => go(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm transition ${key === section ? "bg-[#172433] font-semibold text-white" : "text-[#6f6b65] hover:bg-[#f0ebe3]"}`}><NavIcon size={17} /><span>{item.title}</span>{key === section && <i className="mr-auto h-1.5 w-1.5 rounded-full bg-[#d99a78]" />}</button>; })}</nav><button onClick={async () => { await logout(); navigate("/login"); }} className="absolute bottom-7 right-8 flex items-center gap-2 text-xs font-bold text-[#9b5540]"><LogOut size={15} /> تسجيل الخروج</button></aside><header className="flex h-[76px] items-center justify-between border-b border-[#e9e3d9] bg-[#fbfaf7] px-5 md:px-9 lg:mr-[270px]"><button onClick={() => go("overview")} className="flex items-center gap-3 text-sm font-bold"><ArrowRight size={16} /><span className="font-display text-xl">{current.title}</span></button><span className="text-xs text-[#8b847b]">بيانات مباشرة من Kasher API</span></header><main className="mx-auto max-w-[1200px] px-5 py-9 md:px-9 md:py-12 lg:mr-[270px]"><div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-bold text-[#b96f4a]">{current.eyebrow}</p><h1 className="font-display text-3xl font-bold tracking-[-.04em]">{current.title}</h1><p className="mt-2 text-sm text-[#898278]">{current.description}</p></div><Button onClick={() => section === "pos" ? undefined : undefined} className="gap-2 rounded-xl bg-[#b96f4a] hover:bg-[#a96040]"><Icon size={16} /> {section === "pos" ? "إتمام البيع" : "إضافة جديد"}</Button></div>{section === "pos" ? <PosContent /> : section === "products" ? <ProductsContent /> : section === "invoices" ? <InvoicesContent /> : section === "customers" ? <CustomersContent /> : section === "profile" ? <ProfileContent /> : <AnalyticsContent />}</main></div>;
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", barcode: "", originalPrice: "", sellingPrice: "", quantity: "", categoryId: "" });
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEditingScan, setIsEditingScan] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isCameraOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current = null;
        });
      }
      return;
    }

    const startScanner = () => {
      const Html5QrcodeClass = (window as any).Html5Qrcode;
      if (!Html5QrcodeClass) {
        setTimeout(startScanner, 200);
        return;
      }

      try {
        const html5QrCode = new Html5QrcodeClass("reader");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 }
          },
          (decodedText: string) => {
            // Play a success tone/beep
            try {
              const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
              audio.play().catch(() => {});
            } catch (e) {}

            // Populate form
            if (isEditingScan) {
              setEditingProduct((prev) => prev ? { ...prev, barcode: decodedText } : null);
            } else {
              setForm((prev) => ({ ...prev, barcode: decodedText }));
            }

            // Stop scanner & close
            html5QrCode.stop().then(() => {
              scannerRef.current = null;
              setIsCameraOpen(false);
              setIsEditingScan(false);
            }).catch(console.error);
          },
          () => {
            // Quietly ignore scan failures during frame capture
          }
        ).catch((err: any) => {
          console.error("Error starting camera barcode scanner:", err);
        });
      } catch (err) {
        console.error("Camera barcode scanner initialization error:", err);
      }
    };

    if (!(window as any).Html5Qrcode) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = startScanner;
      document.head.appendChild(script);
    } else {
      setTimeout(startScanner, 300);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current = null;
        });
      }
    };
  }, [isCameraOpen, isEditingScan]);

  const load = () => {
    setLoading(true);
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل المنتجات"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.barcode || ""}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await createCategory({ name: categoryName.trim() });
      setCategoryName("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إضافة الفئة");
    }
  };

  const saveCategory = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory(id, { name: editingName.trim() });
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تعديل الفئة");
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      if (form.categoryId === id) setForm({ ...form, categoryId: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف الفئة");
    }
  };

  const add = async () => {
    if (!form.categoryId) {
      setError("اختر فئة للمنتج أولاً");
      return;
    }
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => v && body.append(k, v));
    try {
      await createProduct(body);
      setForm({ name: "", barcode: "", originalPrice: "", sellingPrice: "", quantity: "", categoryId: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إضافة المنتج");
    }
  };

  const saveProduct = async () => {
    if (!editingProduct || !editingProduct.name.trim() || !editingProduct.barcode?.trim()) {
      setError("اسم المنتج والباركود مطلوبان");
      return;
    }
    try {
      await updateProduct(editingProduct._id, {
        name: editingProduct.name.trim(),
        barcode: editingProduct.barcode.trim(),
        originalPrice: Number(editingProduct.originalPrice),
        sellingPrice: Number(editingProduct.sellingPrice),
        quantity: Number(editingProduct.quantity),
        categoryId: typeof editingProduct.categoryId === "string" ? editingProduct.categoryId : editingProduct.categoryId?._id
      });
      setEditingProduct(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تعديل المنتج");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
          <h2 className="font-display text-lg font-bold">إضافة منتج</h2>
          <p className="mt-1 text-xs text-[#999187]">اختر فئة حقيقية قبل حفظ المنتج.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="flex gap-2">
              <Input placeholder="الباركود (Barcode)" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="flex-1" />
              <Button type="button" onClick={() => { setIsCameraOpen(true); setIsEditingScan(false); }} className="h-10 px-3 bg-[#b96f4a] hover:bg-[#a96040] text-white rounded-xl">
                <Camera size={16} />
              </Button>
            </div>
            <Input placeholder="سعر الشراء" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
            <Input placeholder="سعر البيع" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            <Input placeholder="الكمية" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <select
              required
              className="h-10 rounded-xl border border-[#e1d8cc] bg-[#faf7f1] px-3 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">اختر الفئة *</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={add} className="mt-4 gap-2 rounded-xl bg-[#172433]">
            <Plus size={15} /> حفظ المنتج
          </Button>
        </div>

        <div className="rounded-2xl border border-[#ead8ca] bg-[#f7ebe4] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">فئات المنتجات</h2>
              <p className="mt-1 text-xs text-[#8c776d]">إضافة وتعديل وحذف من الباك إند</p>
            </div>
            <Package size={20} className="text-[#b96f4a]" />
          </div>
          <div className="mt-4 flex gap-2">
            <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="اسم الفئة الجديدة" className="bg-white/70" />
            <Button onClick={addCategory} className="rounded-xl bg-[#b96f4a] px-3">
              <Plus size={15} />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {categories.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#8c776d]">لا توجد فئات بعد.</p>
            ) : (
              categories.map((c) => (
                <div key={c._id} className="flex items-center gap-2 rounded-xl bg-white/70 p-3">
                  <div className="flex-1">
                    {editingId === c._id ? (
                      <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="h-8 bg-white" />
                    ) : (
                      <span className="text-sm font-bold">{c.name}</span>
                    )}
                  </div>
                  {editingId === c._id ? (
                    <button onClick={() => saveCategory(c._id)} className="text-xs font-bold text-[#637c5d]">حفظ</button>
                  ) : (
                    <button onClick={() => { setEditingId(c._id); setEditingName(c.name); }} className="text-xs text-[#7b756c]">تعديل</button>
                  )}
                  <button onClick={() => removeCategory(c._id)} className="text-[#a76040]">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {error && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs text-[#9b4c32]">{error}</p>}

      <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">المنتجات الحقيقية</h2>
            <p className="mt-1 text-xs text-[#999187]">{products.length} منتجاً من الباك إند</p>
          </div>
          <div className="relative w-64">
            <Search size={15} className="absolute right-3 top-3 text-[#a19a90]" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو الباركود" className="pr-9" />
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#999187]">جاري تحميل المنتجات...</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#999187]">لا توجد منتجات.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-[#eee8df] text-xs text-[#999187]">
                <tr>
                  <th className="p-3">المنتج</th>
                  <th className="p-3">الباركود</th>
                  <th className="p-3">سعر البيع</th>
                  <th className="p-3">الكمية</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-[#f1ece5]">
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3 text-xs text-[#999187]">{p.barcode}</td>
                    <td className="p-3">{p.sellingPrice} ج.م</td>
                    <td className="p-3 font-bold">{p.quantity}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button onClick={() => setEditingProduct({ ...p })} className="text-xs font-semibold text-[#6f6b65]">تعديل</button>
                        <button
                          onClick={async () => {
                            try {
                              await deleteProduct(p._id);
                              load();
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "تعذر حذف المنتج");
                            }
                          }}
                          className="text-[#a76040]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-lg bg-[#fffdfa] border-[#e9e3d9] text-[#172433] rounded-2xl shadow-xl p-6" showCloseButton={true}>
          <DialogHeader className="text-right">
            <DialogTitle className="font-display text-xl font-bold text-[#172433] flex items-center gap-2">
              <Package className="text-[#b96f4a]" size={20} />تعديل المنتج
            </DialogTitle>
            <DialogDescription className="text-xs text-[#999187] mt-1">قم بتحديث تفاصيل المنتج وأسعاره ومخزونه.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">اسم المنتج *</Label>
                <Input value={editingProduct?.name || ""} onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, name: e.target.value } : null)} placeholder="اسم المنتج" className="border-[#e1d8cc] focus:border-[#b96f4a] bg-[#faf7f1] rounded-xl text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">الباركود *</Label>
                <div className="flex gap-2">
                  <Input value={editingProduct?.barcode || ""} onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, barcode: e.target.value } : null)} placeholder="الباركود" className="flex-1 border-[#e1d8cc] focus:border-[#b96f4a] bg-[#faf7f1] rounded-xl text-sm" />
                  <Button type="button" onClick={() => { setIsCameraOpen(true); setIsEditingScan(true); }} className="h-10 px-3 bg-[#b96f4a] hover:bg-[#a96040] text-white rounded-xl">
                    <Camera size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">سعر الشراء (ج.م)</Label>
                <Input type="number" value={editingProduct?.originalPrice ?? ""} onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, originalPrice: Number(e.target.value) } : null)} placeholder="سعر الشراء" className="border-[#e1d8cc] focus:border-[#b96f4a] bg-[#faf7f1] rounded-xl text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">سعر البيع (ج.م) *</Label>
                <Input type="number" value={editingProduct?.sellingPrice ?? ""} onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, sellingPrice: Number(e.target.value) } : null)} placeholder="سعر البيع" className="border-[#e1d8cc] focus:border-[#b96f4a] bg-[#faf7f1] rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#6f6b65]">الكمية المتوفرة *</Label>
                <Input type="number" value={editingProduct?.quantity ?? ""} onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, quantity: Number(e.target.value) } : null)} placeholder="الكمية" className="border-[#e1d8cc] focus:border-[#b96f4a] bg-[#faf7f1] rounded-xl text-sm" />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                <Label className="text-xs font-bold text-[#6f6b65] mb-1.5">الفئة *</Label>
                <select
                  required
                  className="h-10 w-full rounded-xl border border-[#e1d8cc] bg-[#faf7f1] px-3 text-sm focus:outline-none focus:border-[#b96f4a]"
                  value={typeof editingProduct?.categoryId === "string" ? editingProduct.categoryId : editingProduct?.categoryId?._id || ""}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, categoryId: e.target.value } : null)}
                >
                  <option value="">اختر الفئة *</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-xl border-[#e1d8cc] text-[#6f6b65] hover:bg-[#f0ebe3]">إلغاء</Button>
            <Button onClick={saveProduct} className="rounded-xl bg-[#172433] hover:bg-[#203348] text-white px-5">حفظ التعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Barcode Scanner Modal */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCameraOpen(false);
          setIsEditingScan(false);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-[#fffdfa] border-[#e9e3d9] text-[#172433] rounded-2xl shadow-xl p-6" showCloseButton={true}>
          <DialogHeader className="text-right">
            <DialogTitle className="font-display text-lg font-bold text-[#172433] flex items-center gap-2">
              <Camera className="text-[#b96f4a]" size={20} />
              مسح باركود المنتج بالكاميرا
            </DialogTitle>
            <DialogDescription className="text-xs text-[#999187] mt-1">
              وجه كاميرا الجهاز نحو الباركود بشكل مستقيم وسيتم التعرف عليه تلقائياً.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center">
            <div id="reader" className="w-full max-w-[320px] h-[240px] rounded-xl overflow-hidden border border-[#eee8df] bg-[#faf7f1]" />
          </div>

          <DialogFooter className="mt-4 flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCameraOpen(false)} className="rounded-xl border-[#e1d8cc] text-[#6f6b65] hover:bg-[#f0ebe3]">
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PosContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<Array<{ productId: string; name: string; originalPrice: number; sellingPrice: number; quantity: number }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("fixed");
  const [discountValue, setDiscountValue] = useState("0");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const [isPosCameraOpen, setIsPosCameraOpen] = useState(false);
  const posScannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPosCameraOpen) {
      if (posScannerRef.current) {
        posScannerRef.current.stop().catch(() => {}).then(() => {
          posScannerRef.current = null;
        });
      }
      return;
    }

    const startPosScanner = () => {
      const Html5QrcodeClass = (window as any).Html5Qrcode;
      if (!Html5QrcodeClass) {
        setTimeout(startPosScanner, 200);
        return;
      }

      try {
        const html5QrCode = new Html5QrcodeClass("pos-reader");
        posScannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 }
          },
          (decodedText: string) => {
            // Play a success sound
            try {
              const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
              audio.play().catch(() => {});
            } catch (e) {}

            // Process barcode to add product to cart
            processScannedBarcode(decodedText);

            // Stop scanner & close
            html5QrCode.stop().then(() => {
              posScannerRef.current = null;
              setIsPosCameraOpen(false);
            }).catch(console.error);
          },
          () => {
            // Quietly ignore scan failures during frame capture
          }
        ).catch((err: any) => {
          console.error("Error starting POS camera scanner:", err);
        });
      } catch (err) {
        console.error("POS camera scanner initialization error:", err);
      }
    };

    if (!(window as any).Html5Qrcode) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = startPosScanner;
      document.head.appendChild(script);
    } else {
      setTimeout(startPosScanner, 300);
    }

    return () => {
      if (posScannerRef.current) {
        posScannerRef.current.stop().catch(() => {}).then(() => {
          posScannerRef.current = null;
        });
      }
    };
  }, [isPosCameraOpen]);

  useEffect(() => {
    Promise.all([listProducts(), getCustomers({ limit: 100 })])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCustomers(c.customers || []);
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : "تعذر تحميل بيانات نقطة البيع"));
  }, []);

  // Auto-clear success/warning scanner messages after 3 seconds
  useEffect(() => {
    if (message && message.startsWith("✓") || message.startsWith("⚠️")) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const productsRef = useRef<Product[]>([]);
  const cartRef = useRef<any[]>([]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const scanMetaRef = useRef({
    buffer: "",
    keyTimes: [] as number[],
    lastBarcode: "",
    lastTimestamp: 0
  });

  const addScannedProductToCart = (p: Product) => {
    setCart((prevCart) => {
      const found = prevCart.find((x) => x.productId === p._id);
      if (found) {
        if (found.quantity >= p.quantity) {
          setMessage(`⚠️ لا يمكن إضافة المزيد من "${p.name}". الكمية المتاحة في المخزن هي ${p.quantity}`);
          return prevCart;
        }
        setMessage(`✓ تم زيادة كمية "${p.name}" في السلة`);
        return prevCart.map((x) => x.productId === p._id ? { ...x, quantity: x.quantity + 1 } : x);
      }
      setMessage(`✓ تم إضافة "${p.name}" إلى السلة`);
      return [...prevCart, { productId: p._id, name: p.name, originalPrice: p.originalPrice, sellingPrice: p.sellingPrice, quantity: 1 }];
    });
  };

  const processScannedBarcode = async (barcode: string) => {
    setMessage("");
    
    // 1. Local Cache Lookup
    const localProduct = productsRef.current.find(
      (p) => p.barcode === barcode || p.sku === barcode
    );

    if (localProduct) {
      addScannedProductToCart(localProduct);
      return;
    }

    // 2. Server Fallback Lookup
    try {
      const response = await apiGet<{ products: Product[] } | Product[]>(
        `/api/admin/products/search?barcode=${encodeURIComponent(barcode)}`
      );
      const list = Array.isArray(response) ? response : (response.products || []);
      if (list.length > 0) {
        const remoteProduct = list[0];
        setProducts((prev) => [...prev, remoteProduct]);
        addScannedProductToCart(remoteProduct);
      } else {
        setMessage(`⚠️ المنتج ذو الباركود (${barcode}) غير مسجل بالنظام`);
      }
    } catch (err) {
      console.error("Barcode API lookup fallback failed:", err);
      setMessage(`⚠️ المنتج ذو الباركود (${barcode}) غير مسجل بالنظام`);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Pause listener if preview is active
      if (preview) {
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey || (e.shiftKey && e.key === "Shift")) {
        return;
      }

      const meta = scanMetaRef.current;
      const now = Date.now();

      // Enter marks completion of scanner sequence
      if (e.key === "Enter") {
        if (meta.buffer.length >= 3) {
          const avgTime = meta.keyTimes.length > 0
            ? (meta.keyTimes[meta.keyTimes.length - 1] - meta.keyTimes[0]) / meta.keyTimes.length
            : 100;

          // timing helper signal Heuristics
          const isScannerHeuristic = avgTime < 50 || /^\d+$/.test(meta.buffer);

          if (isScannerHeuristic) {
            e.preventDefault();
            e.stopPropagation();

            const scannedBarcode = meta.buffer;
            meta.buffer = "";
            meta.keyTimes = [];

            // Duplicate protection (150ms bounce lockout)
            if (scannedBarcode === meta.lastBarcode && (now - meta.lastTimestamp) < 150) {
              console.log("Ignored duplicate scan bounce event for:", scannedBarcode);
              return;
            }

            meta.lastBarcode = scannedBarcode;
            meta.lastTimestamp = now;

            processScannedBarcode(scannedBarcode);
            return;
          }
        }
        meta.buffer = "";
        meta.keyTimes = [];
        return;
      }

      // Buffer characters
      if (e.key.length === 1) {
        const lastKey = meta.keyTimes[meta.keyTimes.length - 1] || 0;
        if (lastKey > 0 && (now - lastKey) > 200) {
          meta.buffer = "";
          meta.keyTimes = [];
        }

        meta.buffer += e.key;
        meta.keyTimes.push(now);

        const avgTime = meta.keyTimes.length > 1
          ? (meta.keyTimes[meta.keyTimes.length - 1] - meta.keyTimes[0]) / (meta.keyTimes.length - 1)
          : 0;

        // If active element is a text input, prevent character pollution when rapid scan timing is detected
        if (meta.keyTimes.length > 1 && avgTime < 50) {
          const activeEl = document.activeElement;
          if (activeEl && (
            activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.getAttribute("contenteditable") === "true"
          )) {
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [preview]);

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const requestedDiscount = Math.max(0, Number(discountValue) || 0);
  const discountAmount = Math.min(subtotal, discountType === "percentage" ? subtotal * Math.min(100, requestedDiscount) / 100 : requestedDiscount);
  const total = Math.max(0, subtotal - discountAmount);
  const selectedCustomer = customers.find((item) => item._id === selectedCustomerId);

  const add = (p: Product) => {
    setCart((items) => {
      const found = items.find((x) => x.productId === p._id);
      if (found) {
        if (found.quantity >= p.quantity) {
          alert(`لا يمكن إضافة المزيد. الكمية المتاحة في المخزن هي ${p.quantity}`);
          return items;
        }
        return items.map((x) => x.productId === p._id ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...items, { productId: p._id, name: p.name, originalPrice: p.originalPrice, sellingPrice: p.sellingPrice, quantity: 1 }];
    });
  };

  const decrease = (productId: string) => {
    setCart((items) => {
      const found = items.find((x) => x.productId === productId);
      if (!found) return items;
      if (found.quantity <= 1) {
        return items.filter((x) => x.productId !== productId);
      }
      return items.map((x) => x.productId === productId ? { ...x, quantity: x.quantity - 1 } : x);
    });
  };

  const remove = (productId: string) => {
    setCart((items) => items.filter((x) => x.productId !== productId));
  };

  const updateQty = (productId: string, val: string, maxQty: number) => {
    const qty = parseInt(val) || 0;
    if (qty <= 0) {
      remove(productId);
      return;
    }
    if (qty > maxQty) {
      alert(`الكمية المطلوبة تتجاوز المتاح في المخزن (${maxQty})`);
      return;
    }
    setCart((items) => items.map((x) => x.productId === productId ? { ...x, quantity: qty } : x));
  };

  const checkout = async () => {
    if (!cart.length) return;
    try {
      await createInvoice({
        ...(selectedCustomerId ? { customerId: selectedCustomerId } : {}),
        items: cart.map((x) => ({ productId: x.productId, quantity: x.quantity, originalPrice: x.originalPrice, sellingPrice: x.sellingPrice })),
        paymentMethod,
        discount: { type: discountType, value: requestedDiscount, amount: discountAmount },
        ...(notes.trim() ? { notes: notes.trim() } : {})
      });
      setCart([]);
      setSelectedCustomerId("");
      setCustomerSearchQuery("");
      setIsCustomerDropdownOpen(false);
      setDiscountValue("0");
      setNotes("");
      setPreview(false);
      setMessage("تم إنشاء الفاتورة بنجاح");
      listProducts().then((p) => setProducts(Array.isArray(p) ? p : [])).catch(() => undefined);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "تعذر إنشاء الفاتورة");
    }
  };

  const filteredProducts = products.filter(p =>
    `${p.name} ${p.barcode || ""} ${p.sku || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    `${c.name} ${c.phone}`.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
          <h2 className="font-display text-lg font-bold text-[#172433]">منتجات متجرك</h2>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute right-3 top-3 text-[#a19a90]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج أو الباركود..."
                className="pr-9 h-10 border-[#e1d8cc] rounded-xl text-xs"
              />
            </div>
            <Button
              type="button"
              onClick={() => setIsPosCameraOpen(true)}
              className="h-10 px-3 bg-[#b96f4a] hover:bg-[#a96040] text-white rounded-xl flex items-center gap-1.5 text-xs font-bold"
            >
              <Camera size={15} />
              مسح بالكاميرا
            </Button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#999187]">لا توجد منتجات مطابقة للبحث.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCart = cart.find(x => x.productId === p._id);
              const maxReached = inCart && inCart.quantity >= p.quantity;
              return (
                <button
                  key={p._id}
                  onClick={() => add(p)}
                  disabled={p.quantity <= 0 || maxReached}
                  className={`relative rounded-xl border p-4 text-right transition flex flex-col justify-between h-32 hover:border-[#b96f4a] ${p.quantity <= 0 ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : inCart ? 'border-[#b96f4a] bg-[#faf7f2]' : 'border-[#eee8df] bg-white'}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-[#172433] leading-snug">{p.name}</p>
                      {inCart && (
                        <span className="bg-[#b96f4a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {inCart.quantity} بالسلة
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-[#999187] font-mono">{p.barcode || p.sku}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-[#f1ece5] w-full">
                    <span className={`text-[10px] font-bold ${p.quantity <= 3 ? 'text-red-500' : 'text-[#71836a]'}`}>
                      {p.quantity <= 0 ? 'نفذت الكمية' : `${p.quantity} متوفر في المخزن`}
                    </span>
                    <strong className="text-sm text-[#b96f4a]">{p.sellingPrice.toLocaleString("ar-EG")} ج.م</strong>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#172433] p-5 text-white flex flex-col justify-between min-h-[550px]">
        <div>
          <h2 className="font-display text-lg font-bold border-b border-white/10 pb-3">السلة الحالية</h2>

          <div className="mt-4 relative">
            <Label className="text-xs text-[#c9d4da] mb-1.5 block font-bold">العميل</Label>

            {/* Custom dropdown toggle button */}
            <button
              type="button"
              onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
              className="h-10 w-full rounded-xl border-0 bg-white/10 px-3 text-xs text-white flex items-center justify-between hover:bg-white/20 transition text-right focus:outline-none"
            >
              <span className="truncate">
                {selectedCustomer ? `${selectedCustomer.name} · ${selectedCustomer.phone}` : "عميل نقدي / بدون عميل"}
              </span>
              <span className="text-white/50 text-[10px] mr-2">▼</span>
            </button>

            {/* Click-away overlay */}
            {isCustomerDropdownOpen && (
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => {
                  setIsCustomerDropdownOpen(false);
                  setCustomerSearchQuery("");
                }}
              />
            )}

            {/* Integrated search dropdown list */}
            {isCustomerDropdownOpen && (
              <div className="absolute right-0 left-0 mt-1 bg-[#1e2c3e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[250px] animate-in fade-in slide-in-from-top-1 duration-100">
                {/* Search field */}
                <div className="p-2 border-b border-white/10 bg-[#172433]">
                  <div className="relative">
                    <Search size={12} className="absolute right-2.5 top-2.5 text-white/50" />
                    <Input
                      autoFocus
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="ابحث باسم أو رقم العميل..."
                      className="pr-8 h-8 w-full bg-white/10 border-0 text-white text-xs placeholder:text-white/40 focus:ring-1 focus:ring-[#b96f4a] focus:bg-white/15"
                    />
                  </div>
                </div>

                {/* Choices list */}
                <div className="overflow-y-auto flex-1 max-h-[180px] divide-y divide-white/5 custom-scrollbar">
                  {/* Default cash customer */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId("");
                      setCustomerSearchQuery("");
                      setIsCustomerDropdownOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2.5 text-xs transition block hover:bg-[#b96f4a]/20 ${!selectedCustomerId ? 'bg-[#b96f4a]/10 text-[#d99a78] font-bold' : 'text-white/80'}`}
                  >
                    عميل نقدي / بدون عميل
                  </button>

                  {/* Filtered list */}
                  {filteredCustomers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-white/40">لا يوجد عملاء مطابقون</div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(c._id);
                          setCustomerSearchQuery("");
                          setIsCustomerDropdownOpen(false);
                        }}
                        className={`w-full text-right px-3 py-2.5 text-xs transition block hover:bg-[#b96f4a]/20 ${selectedCustomerId === c._id ? 'bg-[#b96f4a]/10 text-[#d99a78] font-bold' : 'text-white/80'}`}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{c.phone}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="my-5 max-h-[220px] overflow-y-auto space-y-3 pr-1">
            {cart.length ? (
              cart.map((x) => {
                const origProduct = products.find(p => p._id === x.productId);
                const maxQty = origProduct ? origProduct.quantity : 999;
                return (
                  <div key={x.productId} className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-xs font-bold truncate text-white">{x.name}</p>
                      <p className="text-[10px] text-[#c9d4da] mt-1">{(x.sellingPrice * x.quantity).toFixed(2)} ج.م</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-lg p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => decrease(x.productId)}
                        className="h-6 w-6 rounded bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 text-sm transition"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={x.quantity}
                        onChange={(e) => updateQty(x.productId, e.target.value, maxQty)}
                        className="w-8 text-center bg-transparent border-0 text-xs font-bold text-white focus:outline-none p-0"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const prod = products.find(p => p._id === x.productId);
                          if (prod) add(prod);
                        }}
                        className="h-6 w-6 rounded bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 text-sm transition"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(x.productId)}
                      className="text-red-400 hover:text-red-300 mr-2.5 shrink-0 transition"
                      aria-label="حذف الصنف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="py-12 text-center text-xs text-[#9fb0b9]">أضف منتجات إلى السلة لبدء الفاتورة</p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-[#c9d4da] mb-1 block">طريقة الدفع</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="h-9 w-full rounded-lg border-0 bg-white/10 px-2 text-xs text-white"
              >
                <option className="text-[#172433]" value="cash">نقدي</option>
                <option className="text-[#172433]" value="card">بطاقة</option>
                <option className="text-[#172433]" value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <Label className="text-[10px] text-[#c9d4da] mb-1 block">الخصم</Label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                  className="h-9 w-full rounded-lg border-0 bg-white/10 px-1 text-[10px] text-white"
                >
                  <option className="text-[#172433]" value="fixed">مبلغ</option>
                  <option className="text-[#172433]" value="percentage">٪</option>
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-[#c9d4da] mb-1 block">القيمة</Label>
                <Input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="h-9 border-0 bg-white/10 text-white text-xs px-1 text-center"
                />
              </div>
            </div>
          </div>

          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white/10 text-white h-9 border-0 text-xs rounded-lg"
            placeholder="ملاحظات الفاتورة (اختياري)"
          />

          <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
            <div className="flex justify-between text-[#c9d4da]">
              <span>الإجمالي قبل الخصم</span>
              <span>{subtotal.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-[#d99a78] font-bold">
              <span>قيمة الخصم</span>
              <span>- {discountAmount.toFixed(2)} ج.م
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
              <span>الإجمالي النهائي</span>
              <strong className="text-[#d99a78] text-base">{total.toFixed(2)} ج.م</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              disabled={!cart.length}
              onClick={() => setPreview(true)}
              variant="outline"
              className="h-10 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/5 text-xs font-bold"
            >
              معاينة
            </Button>
            <Button
              disabled={!cart.length}
              onClick={checkout}
              className="h-10 rounded-xl bg-[#b96f4a] hover:bg-[#a96040] text-white text-xs font-bold"
            >
              إتمام البيع
            </Button>
          </div>

          {message && <p className="text-xs text-center text-[#d99a78] font-bold bg-white/5 p-2 rounded-lg">{message}</p>}

          {preview && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                <b className="text-white">معاينة الفاتورة</b>
                <button onClick={() => setPreview(false)} className="text-[#d99a78] font-bold hover:underline">إغلاق</button>
              </div>
              <p className="text-[#c9d4da]">العميل: {selectedCustomer?.name || "عميل نقدي"}</p>
              <p className="text-[#c9d4da]">طريقة الدفع: {paymentMethod === "cash" ? "نقدي" : paymentMethod === "card" ? "بطاقة" : "تحويل بنكي"}</p>
              <p className="text-[#c9d4da]">الخصم المطبق: {discountAmount.toFixed(2)} ج.م</p>
              <p className="font-bold text-[#d99a78] text-sm pt-1 border-t border-white/5 flex justify-between">
                <span>المطلوب تحصيله:</span>
                <span>{total.toFixed(2)} ج.م</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* POS Camera Barcode Scanner Modal */}
      <Dialog open={isPosCameraOpen} onOpenChange={(open) => {
        if (!open) setIsPosCameraOpen(false);
      }}>
        <DialogContent className="sm:max-w-md bg-[#fffdfa] border-[#e9e3d9] text-[#172433] rounded-2xl shadow-xl p-6" showCloseButton={true}>
          <DialogHeader className="text-right">
            <DialogTitle className="font-display text-lg font-bold text-[#172433] flex items-center gap-2">
              <Camera className="text-[#b96f4a]" size={20} />
              مسح باركود المنتج بالكاميرا
            </DialogTitle>
            <DialogDescription className="text-xs text-[#999187] mt-1">
              وجه كاميرا الهاتف نحو باركود المنتج ليتم إضافته مباشرة إلى السلة.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center">
            <div id="pos-reader" className="w-full max-w-[320px] h-[240px] rounded-xl overflow-hidden border border-[#eee8df] bg-[#faf7f1]" />
          </div>

          <DialogFooter className="mt-4 flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsPosCameraOpen(false)} className="rounded-xl border-[#e1d8cc] text-[#6f6b65] hover:bg-[#f0ebe3]">
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoicesContent() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ customer: "", startDate: "", endDate: "", minTotal: "", maxTotal: "" });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    if (selectedInvoice && selectedInvoice.customerId) {
      setLoadingCustomer(true);
      setCustomerDetails(null);
      getCustomer(selectedInvoice.customerId)
        .then((data) => {
          setCustomerDetails(data);
        })
        .catch((err) => {
          console.error("Error fetching customer details:", err);
        })
        .finally(() => {
          setLoadingCustomer(false);
        });
    } else {
      setCustomerDetails(null);
    }
  }, [selectedInvoice]);

  const fetchInvoices = () => {
    setLoading(true);
    setError("");
    listAllInvoices({
      page,
      limit,
      customer: filters.customer.trim() || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minTotal: filters.minTotal ? Number(filters.minTotal) : undefined,
      maxTotal: filters.maxTotal ? Number(filters.maxTotal) : undefined,
    })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setItems(list);
      })
      .catch((err) => {
        listInvoices(page, limit)
          .then((x) => setItems(Array.isArray(x) ? x : []))
          .catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل الفواتير"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const handleReset = () => {
    setFilters({ customer: "", startDate: "", endDate: "", minTotal: "", maxTotal: "" });
    setPage(1);
    setLoading(true);
    listAllInvoices({ page: 1, limit })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setItems(list);
      })
      .catch(() => {
        listInvoices(1, limit).then((x) => setItems(Array.isArray(x) ? x : []));
      })
      .finally(() => setLoading(false));
  };

  const exportToExcel = () => {
    if (!items.length) {
      alert("لا توجد فواتير لتصديرها");
      return;
    }
    const dataToExport = items.map((invoice) => ({
      "رقم الفاتورة": invoice.invoiceNumber || `INV-${invoice._id.slice(-6)}`,
      "تاريخ الفاتورة": invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("ar-EG") : "—",
      "اسم العميل": invoice.customer?.name || "عميل نقدي",
      "رقم العميل": invoice.customer?.phone || "—",
      "طريقة الدفع": invoice.paymentMethod === "cash" ? "نقدي" : invoice.paymentMethod === "card" ? "بطاقة" : "تحويل بنكي",
      "الخصم المطبق (ج.م)": invoice.discount?.amount || 0,
      "الإجمالي النهائي (ج.م)": invoice.totalAmount || 0,
      "ملاحظات": invoice.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الفواتير");
    XLSX.writeFile(workbook, `تقرير_الفواتير_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]/80 p-5 space-y-4">
        <h3 className="font-display text-base font-bold text-[#172433]">البحث المتقدم في الفواتير</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <Input
            placeholder="اسم العميل"
            value={filters.customer}
            onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
            className="text-xs h-10 border-[#e0d7cb]"
          />
          <Input
            type="date"
            placeholder="من تاريخ"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="text-xs h-10 border-[#e0d7cb]"
          />
          <Input
            type="date"
            placeholder="إلى تاريخ"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="text-xs h-10 border-[#e0d7cb]"
          />
          <Input
            type="number"
            placeholder="الحد الأدنى للمبلغ"
            value={filters.minTotal}
            onChange={(e) => setFilters({ ...filters, minTotal: e.target.value })}
            className="text-xs h-10 border-[#e0d7cb]"
          />
          <Input
            type="number"
            placeholder="الحد الأقصى للمبلغ"
            value={filters.maxTotal}
            onChange={(e) => setFilters({ ...filters, maxTotal: e.target.value })}
            className="text-xs h-10 border-[#e0d7cb]"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleReset} className="h-10 rounded-xl border-[#e0d7cb] px-4 text-xs">
            إعادة تعيين
          </Button>
          <Button type="submit" className="h-10 rounded-xl bg-[#b96f4a] hover:bg-[#a96040] text-white px-5 text-xs">
            بحث
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-display text-lg font-bold">الفواتير المسجلة</h2>
            <p className="text-xs text-[#999187] mt-1">عرض وتصدير كافة فواتير المبيعات</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={exportToExcel}
              className="h-9 rounded-xl bg-[#6d8870] hover:bg-[#58705a] text-white px-4 text-xs font-bold gap-2"
            >
              تصدير إلى Excel
            </Button>
            <span className="text-xs text-[#999187]">الصفحة {page}</span>
          </div>
        </div>

        {error && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs text-[#9b4c32] mb-4">{error}</p>}

        {loading ? (
          <p className="py-12 text-center text-sm text-[#999187]">جاري تحميل الفواتير...</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#999187]">لا توجد فواتير تطابق البحث.</p>
        ) : (
          <div className="space-y-3">
            {items.map((invoice) => (
              <div
                key={invoice._id}
                onClick={() => setSelectedInvoice(invoice)}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-[#faf7f1] p-4 border border-[#eee8df] hover:border-[#d99a78] transition cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ded2] text-[#a76040]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <b className="text-sm text-[#172433]">{invoice.invoiceNumber || `فاتورة #${invoice._id.slice(-6)}`}</b>
                    <div className="flex gap-2 mt-1 text-[10px] text-[#999187]">
                      <span>طريقة الدفع: {invoice.paymentMethod === "cash" ? "نقدي" : invoice.paymentMethod === "card" ? "بطاقة" : "تحويل بنكي"}</span>
                      <span>•</span>
                      <span>العميل: {invoice.customer?.name || "عميل نقدي"}</span>
                      {invoice.createdAt && (
                        <>
                          <span>•</span>
                          <span>التاريخ: {new Date(invoice.createdAt).toLocaleDateString("ar-EG")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-left font-display text-base font-bold text-[#b96f4a] self-end sm:self-center">
                  {(invoice.totalAmount || 0).toLocaleString("ar-EG")} ج.م
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t border-[#eee8df] mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 rounded-xl text-xs"
              >
                السابق
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < limit}
                className="h-9 rounded-xl text-xs"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => { if (!open) setSelectedInvoice(null); }}>
        <DialogContent className="sm:max-w-2xl bg-[#fffdfa] border-[#e9e3d9] text-[#172433] rounded-2xl shadow-xl p-6" showCloseButton={true}>
          <DialogHeader className="text-right border-b border-[#eee8df] pb-3">
            <DialogTitle className="font-display text-xl font-bold text-[#172433] flex items-center gap-2">
              <FileText className="text-[#b96f4a]" size={20} />
              تفاصيل الفاتورة: {selectedInvoice?.invoiceNumber || `فاتورة #${selectedInvoice?._id.slice(-6)}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#999187] mt-1">
              عرض تفاصيل الأصناف المبيعة، قيمة الخصم، وطريقة التحصيل.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-5 py-4 text-right" dir="rtl">
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#faf7f1] p-4 rounded-xl border border-[#eee8df]">
                <div>
                  <p className="text-[#999187] font-semibold">اسم العميل:</p>
                  <p className="mt-1 text-sm font-bold text-[#172433]">{customerDetails?.name || selectedInvoice.customer?.name || "عميل نقدي"}</p>
                </div>
                <div>
                  <p className="text-[#999187] font-semibold">رقم الهاتف:</p>
                  <p className="mt-1 text-sm font-mono text-[#172433]">{customerDetails?.phone || selectedInvoice.customer?.phone || "—"}</p>
                </div>
                
                {loadingCustomer ? (
                  <div className="col-span-2 text-center text-xs text-[#999187] py-1 bg-white/40 rounded-lg">
                    جاري تحميل بيانات العميل المتقدمة...
                  </div>
                ) : customerDetails ? (
                  <>
                    {customerDetails.address && (
                      <div className="col-span-2">
                        <p className="text-[#999187] font-semibold">العنوان:</p>
                        <p className="mt-1 text-sm text-[#172433]">{customerDetails.address}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[#999187] font-semibold">حالة العميل:</p>
                      <p className="mt-1 text-sm font-bold text-[#172433]">
                        {customerDetails.status === "active" ? "نشط" : "غير نشط"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#999187] font-semibold">تاريخ التسجيل:</p>
                      <p className="mt-1 text-sm text-[#172433]">
                        {customerDetails.createdAt ? new Date(customerDetails.createdAt).toLocaleDateString("ar-EG") : "—"}
                      </p>
                    </div>
                  </>
                ) : null}

                <div>
                  <p className="text-[#999187] font-semibold">تاريخ الفاتورة:</p>
                  <p className="mt-1 text-sm font-bold text-[#172433]">
                    {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString("ar-EG") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[#999187] font-semibold">طريقة الدفع:</p>
                  <p className="mt-1 text-sm font-bold text-[#172433]">
                    {selectedInvoice.paymentMethod === "cash" ? "نقدي" : selectedInvoice.paymentMethod === "card" ? "بطاقة" : "تحويل بنكي"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[#172433]">الأصناف والمنتجات:</h4>
                <div className="overflow-hidden rounded-xl border border-[#eee8df]">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#faf7f1] text-[#999187] border-b border-[#eee8df]">
                      <tr>
                        <th className="p-3">المنتج</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3 text-left">سعر الوحدة</th>
                        <th className="p-3 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee8df] bg-white">
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-[#172433]">{item.name}</td>
                          <td className="p-3 text-center font-bold text-gray-700">{item.quantity}</td>
                          <td className="p-3 text-left font-mono">{Number(item.price || 0).toFixed(2)} ج.م</td>
                          <td className="p-3 text-left font-mono font-bold text-[#b96f4a]">
                            {(Number(item.price || 0) * item.quantity).toFixed(2)} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#eee8df] text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>الإجمالي قبل الخصم:</span>
                  <span className="font-mono">{(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-[#b96f4a] font-bold">
                  <span>قيمة الخصم المطبق:</span>
                  <span className="font-mono">- {(selectedInvoice.discount?.amount || 0).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#172433] border-t border-[#f1ece5] pt-2">
                  <span>الإجمالي النهائي للتحصيل:</span>
                  <span className="text-[#b96f4a] text-lg">{(selectedInvoice.totalAmount || 0).toFixed(2)} ج.م</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-[#faf7f1] p-3 rounded-xl border border-[#eee8df] text-xs mt-2 text-[#999187]">
                  <b className="text-gray-700 block mb-1">ملاحظات الفاتورة:</b>
                  {selectedInvoice.notes}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-row gap-2 justify-end border-t border-[#eee8df] pt-3">
            <Button onClick={() => setSelectedInvoice(null)} className="rounded-xl bg-[#172433] hover:bg-[#203348] text-white px-5 text-xs font-bold">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function CustomersContent() {
  const [items, setItems] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({});
  const [form, setForm] = useState({ name: "", phone: "", address: "", status: "active" as "active" | "inactive" });
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([getCustomers(), getCustomerStats()])
      .then(([c, s]) => {
        setItems(c.customers || []);
        setStats(s || {});
      })
      .catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل بيانات العملاء"));
  };

  useEffect(load, []);

  const add = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("الاسم والهاتف مطلوبان");
      return;
    }
    setError("");
    try {
      await createCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
        status: form.status
      });
      setForm({ name: "", phone: "", address: "", status: "active" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إضافة العميل");
    }
  };

  const cards = [
    { label: "إجمالي العملاء", value: stats.totalCustomers },
    { label: "العملاء النشطون", value: stats.activeCustomers },
    { label: "عملاء جدد هذا الشهر", value: stats.newCustomers }
  ];

  return (
    <div className="space-y-5">
      {error && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs text-[#9b4c32]">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
            <p className="text-xs text-[#999187]">{item.label}</p>
            <p className="mt-3 font-display text-2xl font-bold">
              {typeof item.value === "number" ? item.value.toLocaleString("ar-SA") : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5">
        <h2 className="mb-4 font-display text-lg font-bold">إضافة عميل جديد</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input required placeholder="اسم العميل *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required placeholder="الهاتف *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="العنوان (اختياري)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select
            className="h-10 rounded-xl border border-[#e1d8cc] bg-[#faf7f1] px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
          >
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
        <Button onClick={add} className="mt-4 gap-2 bg-[#172433]"><Plus size={15} /> حفظ العميل</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-[#fffdfa]">
        <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">قائمة العملاء</h2>
            <p className="mt-1 text-xs text-[#999187]">إدارة بيانات العملاء ومتابعة حالتهم من مكان واحد</p>
          </div>
          <span className="rounded-full bg-[#f5eee7] px-3 py-1 text-xs font-semibold text-[#9b6245]">{items.length} عميل</span>
        </div>

        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#999187]">لا توجد بيانات عملاء.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-[#faf7f1] text-xs text-[#82786d]">
                <tr>
                  <th className="px-5 py-3 font-semibold">العميل</th>
                  <th className="px-5 py-3 font-semibold">الهاتف</th>
                  <th className="px-5 py-3 font-semibold">العنوان</th>
                  <th className="px-5 py-3 font-semibold">الحالة</th>
                  <th className="px-5 py-3 font-semibold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1ece5]">
                {items.map((c) => (
                  <tr key={c._id} className="transition-colors hover:bg-[#fdfaf6]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ead9cc] font-display font-bold text-[#9b6245]">
                          {c.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-[#263442]">{c.name}</p>
                          <p className="mt-1 text-[11px] text-[#aaa096]">
                            {c.totalOrders ?? 0} طلبات · {(c.totalSpent ?? 0).toLocaleString("ar-SA")} ج.م
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#5f686f]" dir="ltr">{c.phone || "—"}</td>
                    <td className="max-w-[180px] truncate px-5 py-4 text-[#77736f]">{c.address || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={c.status === "inactive" ? "rounded-full bg-[#f4e4e1] px-3 py-1 text-[11px] font-semibold text-[#a65d52]" : "rounded-full bg-[#e6f0e5] px-3 py-1 text-[11px] font-semibold text-[#5d805a]"}>
                        {c.status === "inactive" ? "غير نشط" : "نشط"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        aria-label={`حذف ${c.name}`}
                        onClick={async () => {
                          try {
                            await deleteCustomer(c._id);
                            load();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "تعذر حذف العميل");
                          }
                        }}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-[#a76040] transition-colors hover:bg-[#f9e7df]"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
function AnalyticsContent() { const [stats, setStats] = useState<AdminStats | null>(null); const [profile, setProfile] = useState<AdminProfile | null>(null); const [dashboard, setDashboard] = useState<any>(null); const [reports, setReports] = useState<any[]>([]); const [advanced, setAdvanced] = useState<unknown>(null); const [comprehensive, setComprehensive] = useState<any>(null); const [startDate, setStartDate] = useState(() => sessionStorage.getItem("kasher.analytics.startDate") || "2024-01-01"); const [endDate, setEndDate] = useState(() => sessionStorage.getItem("kasher.analytics.endDate") || "2024-12-31"); const [compareStartDate, setCompareStartDate] = useState(() => sessionStorage.getItem("kasher.analytics.compareStartDate") || "2025-01-01"); const [compareEndDate, setCompareEndDate] = useState(() => sessionStorage.getItem("kasher.analytics.compareEndDate") || "2025-12-31"); const [loadingAdvanced, setLoadingAdvanced] = useState(false); const [error, setError] = useState(""); useEffect(() => { Promise.all([getAdminStats(), getDashboardAnalytics(), getAdminReports(), getProfile(), getComprehensiveDashboard("all")]).then(([s, d, r, p, full]) => { const dashboardData = (d as any)?.data || d; const reportsData = (r as any)?.data || r; setStats(s); setDashboard(dashboardData); setReports(Array.isArray(reportsData) ? reportsData : []); const profileData = (p as any)?.data?.admin || (p as any)?.data?.profile || (p as any)?.data || p; setProfile(profileData as AdminProfile); setComprehensive((full as any)?.data || full); }).catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل التحليلات")); }, []); useEffect(() => { sessionStorage.setItem("kasher.analytics.startDate", startDate); sessionStorage.setItem("kasher.analytics.endDate", endDate); sessionStorage.setItem("kasher.analytics.compareStartDate", compareStartDate); sessionStorage.setItem("kasher.analytics.compareEndDate", compareEndDate); }, [startDate, endDate, compareStartDate, compareEndDate]); const runAdvanced = async () => { if (!startDate || !endDate || startDate > endDate) { setError("اختر نطاقاً زمنياً صحيحاً"); return; } setError(""); setLoadingAdvanced(true); try { setAdvanced(await getAdvancedAnalytics(startDate, endDate)); } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل التحليل المتقدم؛ تحقق من تفعيل endpoint في الباك إند"); } finally { setLoadingAdvanced(false); } }; const dashboardCards = [{ label: "إيراد اليوم", value: dashboard?.revenue?.daily, suffix: "ج.م" }, { label: "إيراد الشهر", value: dashboard?.revenue?.monthly, suffix: "ج.م" }, { label: "فواتير اليوم", value: dashboard?.invoices?.daily, suffix: "فاتورة" }, { label: "كمية المخزون", value: dashboard?.inventory?.totalQuantity, suffix: "قطعة" }, { label: "قيمة المخزون", value: dashboard?.inventory?.totalValue, suffix: "ج.م" }]; const statCards = [{ label: "إجمالي الفواتير", value: stats?.totalInvoices, suffix: "فاتورة" }, { label: "الربح اليومي", value: stats?.dailyProfit, suffix: "ج.م" }, { label: "الربح الشهري", value: stats?.monthlyProfit, suffix: "ج.م" }, { label: "الربح السنوي", value: stats?.yearlyProfit, suffix: "ج.م" }]; const advancedData = ((advanced as any)?.data || advanced || {}) as any; const advancedRows = Array.isArray(advancedData) ? advancedData : []; const advancedCards = [{ key: "revenue", label: "الإيرادات", unit: "ج.م" }, { key: "products", label: "المنتجات", unit: "منتج" }, { key: "invoices", label: "الفواتير", unit: "فاتورة" }, { key: "customers", label: "العملاء", unit: "عميل" }]; return <div className="space-y-5">{error && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs text-[#9b4c32]">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map((card) => <div key={card.label} className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-5"><p className="text-xs text-[#999187]">{card.label}</p><p className="mt-3 font-display text-2xl font-bold">{typeof card.value === "number" ? card.value.toLocaleString("ar-SA") : "—"}</p><span className="mt-1 block text-[11px] text-[#b96f4a]">{card.suffix}</span></div>)}</div><div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6"><h2 className="font-display text-lg font-bold">تحليلات لوحة التحكم</h2><p className="mt-1 text-xs text-[#999187]">GET /api/admin/dashboard/analytics · revenue / products / invoices / customers / inventory</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{dashboardCards.map((card) => <div key={card.label} className="rounded-xl bg-[#faf7f1] p-4"><p className="text-xs text-[#999187]">{card.label}</p><p className="mt-2 font-display text-xl font-bold">{typeof card.value === "number" ? card.value.toLocaleString("ar-SA") : "—"}</p><span className="text-[10px] text-[#b96f4a]">{card.suffix}</span></div>)}</div></div><div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold text-[#b96f4a]">تحليل مخصص</p><h2 className="mt-1 font-display text-xl font-bold">التحليلات المتقدمة</h2><p className="mt-1 text-xs text-[#999187]">GET /api/admin/analytics/advanced?startDate=...&endDate=...</p></div><Button onClick={runAdvanced} disabled={loadingAdvanced} className="rounded-xl bg-[#172433]">{loadingAdvanced ? "جاري التحليل..." : "تطبيق الفلاتر"}</Button></div><div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold text-[#6f625a]">من تاريخ<Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2" /></label><label className="text-xs font-semibold text-[#6f625a]">إلى تاريخ<Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2" /></label></div>{advanced !== null && <div className="mt-5 space-y-4"><div className="flex items-center justify-between"><h3 className="font-display text-base font-bold">نتيجة التقرير للفترة المحددة</h3><span className="rounded-full bg-[#e6f0e5] px-3 py-1 text-[11px] font-semibold text-[#5d805a]">بيانات فعلية</span></div>{advancedRows.length > 0 ? <div className="overflow-x-auto rounded-xl border border-[#eee8df]"><table className="w-full min-w-[640px] text-right text-sm"><thead className="bg-[#faf7f1] text-xs text-[#82786d]"><tr><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">المبيعات</th><th className="px-4 py-3">الفواتير</th><th className="px-4 py-3">أفضل المنتجات</th></tr></thead><tbody className="divide-y divide-[#f1ece5]">{advancedRows.map((row: any) => <tr key={String(row._id)}><td className="px-4 py-3 font-semibold">{row._id || "—"}</td><td className="px-4 py-3">{row.totalSales ?? 0} ج.م</td><td className="px-4 py-3">{row.totalInvoices ?? 0}</td><td className="px-4 py-3">{Array.isArray(row.topProducts) && row.topProducts.length ? row.topProducts.map((p: any) => `${p.name} × ${p.quantitySold}`).join("، ") : "—"}</td></tr>)}</tbody></table></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{advancedCards.map((card) => { const values = advancedData?.[card.key] || {}; return <div key={card.key} className="rounded-xl bg-[#faf7f1] p-4"><p className="text-xs text-[#999187]">{card.label}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><p className="text-[10px] text-[#aaa096]">يومي</p><p className="mt-1 font-bold">{values.daily ?? 0}</p><span className="text-[10px] text-[#b96f4a]">{card.unit}</span></div><div><p className="text-[10px] text-[#aaa096]">شهري</p><p className="mt-1 font-bold">{values.monthly ?? 0}</p><span className="text-[10px] text-[#b96f4a]">{card.unit}</span></div><div><p className="text-[10px] text-[#aaa096]">سنوي</p><p className="mt-1 font-bold">{values.yearly ?? 0}</p><span className="text-[10px] text-[#b96f4a]">{card.unit}</span></div></div></div> })}</div>}{advancedData?.inventory && <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#e9e3d9] p-4"><p className="text-xs text-[#999187]">إجمالي كمية المخزون</p><p className="mt-2 font-display text-2xl font-bold">{advancedData.inventory.totalQuantity ?? 0}</p></div><div className="rounded-xl border border-[#e9e3d9] p-4"><p className="text-xs text-[#999187]">قيمة المخزون</p><p className="mt-2 font-display text-2xl font-bold">{advancedData.inventory.totalValue ?? 0} ج.م</p></div></div>}</div>}</div><div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">الرسوم البيانية التشغيلية</h2><p className="mt-1 text-xs text-[#999187]">تعتمد على بيانات API الفعلية فقط</p></div><span className="rounded-full bg-[#e6f0e5] px-3 py-1 text-[11px] font-semibold text-[#5d805a]">بيانات فعلية</span></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><p className="mb-2 text-xs font-semibold">اتجاه المبيعات اليومية</p>{reports.length ? <div className="h-64" dir="ltr"><ResponsiveContainer width="100%" height="100%"><LineChart data={reports}><CartesianGrid strokeDasharray="3 3" stroke="#eee8df" /><XAxis dataKey="_id" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="totalSales" stroke="#b96f4a" strokeWidth={3} /></LineChart></ResponsiveContainer></div> : <p className="py-10 text-xs text-[#999187]">لا توجد بيانات مبيعات كافية للرسم.</p>}</div><div><p className="mb-2 text-xs font-semibold">توزيع المصروفات حسب الفئة</p>{Array.isArray((comprehensive as any)?.expenses?.expensesByCategory) && (comprehensive as any).expenses.expensesByCategory.length ? <div className="h-64" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={(comprehensive as any).expenses.expensesByCategory}><CartesianGrid strokeDasharray="3 3" stroke="#eee8df" /><XAxis dataKey="category" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="amount" fill="#172433" /></BarChart></ResponsiveContainer></div> : <p className="py-10 text-xs text-[#999187]">لا يعيد الباك إند توزيع المصروفات حسب الفئة لهذه الاستجابة.</p>}</div></div></div><div className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6"><h2 className="font-display text-lg font-bold">التقارير اليومية</h2><p className="mt-1 text-xs text-[#999187]">GET /api/admin/reports · {reports.length} يوم</p>{reports.length === 0 ? <p className="py-8 text-center text-sm text-[#999187]">لا توجد تقارير.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-right text-sm"><thead className="bg-[#faf7f1] text-xs text-[#82786d]"><tr><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">إجمالي المبيعات</th><th className="px-4 py-3">الفواتير</th><th className="px-4 py-3">أفضل المنتجات</th></tr></thead><tbody className="divide-y divide-[#f1ece5]">{reports.map((row) => <tr key={String(row._id)}><td className="px-4 py-4 font-semibold">{row._id}</td><td className="px-4 py-4">{row.totalSales ?? 0} ج.م</td><td className="px-4 py-4">{row.totalInvoices ?? 0}</td><td className="px-4 py-4">{Array.isArray(row.topProducts) && row.topProducts.length ? row.topProducts.map((p: any) => `${p.name} × ${p.quantitySold}`).join("، ") : "—"}</td></tr>)}</tbody></table></div>}</div></div>; }


function ProfileContent() { const [profile, setProfile] = useState<AdminProfile>({}); const [form, setForm] = useState({ firstName: "", lastName: "", companyName: "", companyAddress: "", phone: "", currentPassword: "", newPassword: "" }); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [lookupId, setLookupId] = useState(""); const [lookup, setLookup] = useState<AdminProfile | null>(null); useEffect(() => { getProfile().then((response) => { const data = (response as { data?: { admin?: AdminProfile; profile?: AdminProfile } }).data; const next = data?.admin || data?.profile || response as AdminProfile; setProfile(next); setForm((current) => ({ ...current, firstName: next.firstName || "", lastName: next.lastName || "", companyName: next.companyName || "", companyAddress: next.companyAddress || "", phone: next.phone || "" })); }).catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل الملف الشخصي")); }, []); const lookupAdmin = async () => { if (!lookupId.trim()) return; try { const response = await getAdminById(lookupId.trim()); const data = (response as { data?: { admin?: AdminProfile } }).data; setLookup(data?.admin || response as AdminProfile); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "تعذر جلب الأدمن"); } }; const save = async () => { setMessage(""); setError(""); if (form.newPassword && !form.currentPassword) { setError("أدخل كلمة المرور الحالية أولاً"); return; } if (form.newPassword && form.newPassword.length < 6) { setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"); return; } try { const body = { firstName: form.firstName, lastName: form.lastName, companyName: form.companyName, companyAddress: form.companyAddress, phone: form.phone, ...(form.newPassword ? { currentPassword: form.currentPassword, newPassword: form.newPassword } : {}) }; const response = await updateProfile(body); const data = (response as { data?: { admin?: AdminProfile; profile?: AdminProfile } }).data; setProfile(data?.admin || data?.profile || response as AdminProfile); setForm({ ...form, currentPassword: "", newPassword: "" }); setMessage("تم تحديث الملف الشخصي بنجاح"); } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث الملف الشخصي"); } }; return <div className="grid gap-5 lg:grid-cols-[1fr_320px]">{(error || message) && <p className={`rounded-xl p-3 text-xs lg:col-span-2 ${error ? "bg-[#f9e7df] text-[#9b4c32]" : "bg-[#e6f0e5] text-[#5d805a]"}`}>{error || message}</p>}<div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6"><h2 className="font-display text-lg font-bold">بيانات الحساب والمتجر</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Input placeholder="الاسم الأول" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><Input placeholder="اسم العائلة" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /><Input placeholder="اسم الشركة" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /><Input placeholder="الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input placeholder="عنوان الشركة" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} className="md:col-span-2" /></div><Button onClick={save} className="mt-5 rounded-xl bg-[#172433]">حفظ التغييرات</Button></div><div className="rounded-2xl border border-[#ead8ca] bg-[#f7ebe4] p-6"><h2 className="font-display text-lg font-bold">تغيير كلمة المرور</h2><p className="mt-2 text-xs leading-6 text-[#8c776d]">أدخل كلمة المرور الحالية فقط عند إنشاء كلمة مرور جديدة.</p><div className="mt-5 space-y-3"><Input type="password" placeholder="كلمة المرور الحالية" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /><Input type="password" placeholder="كلمة المرور الجديدة" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></div></div><div className="rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-6 lg:col-span-2"><h2 className="font-display text-lg font-bold">جلب أدمن بالمعرّف</h2><p className="mt-1 text-xs text-[#999187]">GET /api/admin/admin/:id</p><div className="mt-4 flex gap-3"><Input placeholder="معرّف الأدمن" value={lookupId} onChange={(e) => setLookupId(e.target.value)} /><Button onClick={lookupAdmin} className="bg-[#b96f4a]">جلب البيانات</Button></div>{lookup && <p className="mt-4 text-sm text-[#5f686f]">{lookup.firstName || "—"} {lookup.lastName || ""} · {lookup.email || "—"} · {lookup.role || "admin"}</p>}</div><div className="rounded-2xl bg-[#172433] p-6 text-white lg:col-span-2"><p className="text-xs text-[#d99a78]">الحساب الحالي</p><h2 className="mt-2 font-display text-2xl font-bold">{profile.firstName || "—"} {profile.lastName || ""}</h2><p className="mt-2 text-sm text-[#c9d4da]">{profile.email || "—"} · {profile.role || "admin"}</p></div></div>; }
