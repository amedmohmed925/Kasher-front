/**
 * Kasher — Register page. Creates a new admin account and starts a trial.
 * After registration, redirects to OTP verification step.
 */
import { useState } from "react";
import { ArrowLeft, Building2, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { apiPost } from "@/lib/api";

export default function Register() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ firstName: "", lastName: "", businessName: "", companyAddress: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false); const [otp, setOtp] = useState(""); const [otpMsg, setOtpMsg] = useState(""); const [otpError, setOtpError] = useState(""); const [otpLoading, setOtpLoading] = useState(false);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (form.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      await apiPost("/api/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        businessName: form.businessName,
        companyName: form.businessName,
        companyAddress: form.companyAddress,
        phone: form.phone,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      setOtpOpen(true); setOtpMsg("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
    } catch (err) { setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب. تحقق من البيانات."); }
    finally { setLoading(false); }
  };
  const verifyOtp = async () => {
    if (!otp.trim()) { setOtpError("أدخل رمز التحقق"); return; }
    setOtpError(""); setOtpLoading(true);
    try {
      await apiPost("/api/auth/verify-otp", { email: form.email, otp: otp.trim() });
      setOtpMsg("تم تفعيل حسابك بنجاح! جاري التوجيه لتسجيل الدخول...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) { setOtpError(err instanceof Error ? err.message : "رمز التحقق غير صحيح."); }
    finally { setOtpLoading(false); }
  };
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#172433]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[.82fr_1.18fr]">
        <section className="relative hidden overflow-hidden bg-[#172433] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[url('/manus-storage/kasher-dashboard-texture_2e4a005c.png')] bg-cover opacity-[.1]" />
          <div className="relative">
            <div className="mb-20 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#b96f4a]"><img src="/manus-storage/kasher-mark_178c0f71.png" alt="Kasher" className="h-8 w-8" /></div>
              <span className="font-display text-2xl font-bold">Kasher</span>
            </div>
            <p className="mb-5 text-sm text-[#c5d0d7]">انضم إلى Kasher</p>
            <h1 className="max-w-lg font-display text-5xl font-bold leading-[1.2] tracking-[-.05em]">أنشئ متجرك<br /><span className="text-[#d99a78]">في دقائق.</span></h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#b3c0c8]">سجّل حسابك الآن واحصل على 30 يوماً مجاناً لتجربة جميع المزايا.</p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-xs text-[#b3c0c8]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><b className="mb-1 block text-white">30 يوم</b><span>فترة تجريبية مجانية</span></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><b className="mb-1 block text-white">غير محدود</b><span>عدد المنتجات</span></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><b className="mb-1 block text-white">دعم فني</b><span>على مدار الساعة</span></div>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[500px]">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b96f4a]"><img src="/manus-storage/kasher-mark_178c0f71.png" alt="Kasher" className="h-7 w-7" /></div>
              <b className="font-display text-xl">Kasher</b>
            </div>
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold text-[#b96f4a]">حساب جديد</p>
              <h2 className="font-display text-3xl font-bold tracking-[-.04em]">إنشاء حساب أدمن</h2>
              <p className="mt-2 text-sm text-[#8c8479]">أدخل بياناتك لإنشاء حسابك وبدء الفترة التجريبية.</p>
            </div>
            <form onSubmit={submit} className="space-y-4 rounded-3xl border border-[#e8e0d5] bg-[#fffdfa] p-6 shadow-[0_14px_32px_rgba(45,36,25,.05)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#5d5a55] flex items-center gap-1"><User size={13} /> الاسم الأول</Label>
                  <Input value={form.firstName} onChange={update("firstName")} placeholder="محمد" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#5d5a55]">اسم العائلة</Label>
                  <Input value={form.lastName} onChange={update("lastName")} placeholder="أحمد" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#5d5a55] flex items-center gap-1"><Building2 size={13} /> اسم الشركة / المتجر</Label>
                <Input value={form.businessName} onChange={update("businessName")} placeholder="سوبرماركت المذاق" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#5d5a55] flex items-center gap-1"><Building2 size={13} /> عنوان الشركة / المتجر *</Label>
                <Input value={form.companyAddress} onChange={update("companyAddress")} placeholder="القاهرة، مصر" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#5d5a55] flex items-center gap-1"><Phone size={13} /> رقم الهاتف</Label>
                <Input value={form.phone} onChange={update("phone")} type="tel" placeholder="+201234567890" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#5d5a55]">البريد الإلكتروني</Label>
                <Input value={form.email} onChange={update("email")} type="email" placeholder="name@company.com" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#5d5a55]">كلمة المرور</Label>
                  <Input value={form.password} onChange={update("password")} type="password" placeholder="••••••••" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#5d5a55]">تأكيد كلمة المرور</Label>
                  <Input value={form.confirmPassword} onChange={update("confirmPassword")} type="password" placeholder="••••••••" className="h-11 rounded-xl border-[#e0d7cb] bg-[#fcfaf6]" required />
                </div>
              </div>
              {error && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs leading-5 text-[#9b4c32]">{error}</p>}
              <Button disabled={loading} className="h-12 w-full gap-2 rounded-xl bg-[#b96f4a] font-bold hover:bg-[#a96040]">{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}<ArrowLeft size={16} /></Button>
            </form>
            <div className="mt-5 text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-xs font-semibold text-[#b96f4a] hover:underline">لديك حساب بالفعل؟ سجّل الدخول</button>
            </div>
          </div>
        </section>
      </div>
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-md bg-[#fffdfa] border-[#e9e3d9] rounded-2xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="font-display text-xl font-bold">تفعيل الحساب</DialogTitle>
            <DialogDescription className="text-xs text-[#999187] mt-1">أدخل رمز التحقق المرسل إلى بريدك الإلكتروني ({form.email}).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {otpMsg && <p className="rounded-xl bg-[#e6f0e5] p-3 text-xs text-[#5d805a]">{otpMsg}</p>}
            {otpError && <p className="rounded-xl bg-[#f9e7df] p-3 text-xs text-[#9b4c32]">{otpError}</p>}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#6f6b65]">رمز التحقق (6 أرقام)</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="border-[#e1d8cc] bg-[#faf7f1] rounded-xl text-center tracking-[.3em] font-bold text-lg h-14" maxLength={6} />
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => { setOtpOpen(false); navigate("/login"); }} className="rounded-xl border-[#e1d8cc]">لاحقاً</Button>
            <Button onClick={verifyOtp} disabled={otpLoading} className="rounded-xl bg-[#b96f4a] hover:bg-[#a96040] text-white">{otpLoading ? "جاري التحقق..." : "تفعيل الحساب"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
