# خريطة صفحات Admin وواجهات API

جميع الطلبات تمر عبر `client/src/lib/api.ts` وتُرسل إلى `https://kasher-project.vercel.app` مع `Authorization: Bearer`. عند 401 يحاول العميل تجديد access token عبر `/api/auth/refresh-token` ثم يعيد الطلب الأصلي مرة واحدة.

| صفحة الواجهة | المسار | Endpoint الأساسي | العمليات |
|---|---|---|---|
| لوحة التاجر | `/admin` | `/api/admin/stats` | مؤشرات الفواتير والأرباح |
| نقطة البيع | `/admin/pos` | `/api/admin/products`, `/api/admin/invoices` | جلب المنتجات وإنشاء فاتورة بعناصر الأسعار الأصلية وأسعار البيع، طريقة الدفع، الخصم، والملاحظات |
| المنتجات والمخزون | `/admin/products` | `/api/admin/products`, `/api/admin/categories` | جلب وإضافة وحذف المنتجات، وإضافة/تعديل/حذف الفئات |
| الفواتير | `/admin/invoices` | `/api/admin/invoices` | جلب الفواتير |
| العملاء | `/admin/customers` | `/api/admin/customers`, `/api/admin/customers/stats/overview` | جلب وإضافة وحذف العملاء وإحصاءاتهم |
| التقارير والتحليلات | `/admin/analytics` | `/api/admin/stats`, `/api/admin/reports`, `/api/admin/dashboard/analytics` | عرض المؤشرات والتقارير والتحليلات اليومية، مع رسم بياني للمبيعات من response التقارير |
| تحليل فترة مع المصروفات | داخل `/admin/analytics` | `/api/admin/analytics/periods?period=...` | الإيرادات، الربح، المصروفات، الطلبات، متوسط الطلب والخصومات |
| مقارنة فترتين | داخل `/admin/analytics` | `/api/admin/analytics/compare?...` | مقارنة الإيرادات والطلبات والربح ومتوسط الطلب والعملاء |
| التحليل الشامل | داخل `/admin/analytics` | `/api/admin/analytics/dashboard?period=...` | مؤشرات الربح والهامش والمصروفات وأعلى الفواتير |
| التحليلات المفلترة اليومية | داخل `/admin/analytics` | `/api/admin/dashboard/analytics?startDate=...&endDate=...` | إرسال نطاق زمني وعرض response المبيعات اليومية |
| ملخص لوحة مستقل | داخل `/admin/analytics` | `/api/admin/analytics/dashboard-summary` | غير متاح حالياً؛ endpoint المنشور يعيد 404 ولا يتم استدعاؤه كبيانات تشغيلية |
| الملف الشخصي | `/admin/profile` | `/api/admin/profile` و`/api/admin/admin/:id` | جلب وتحديث بيانات الأدمن وكلمة المرور، وجلب أدمن حسب المعرّف |

## ملاحظات التحقق

تم اختبار `stats` و`reports` و`dashboard/analytics` و`profile GET` على النطاق المنشور بحساب admin وأعادت HTTP 200. كما أعاد `profile PUT` بجسم فارغ HTTP 200 دون تغيير مقصود في بيانات الحساب. وتم اختبار `analytics/periods` و`analytics/compare` و`analytics/dashboard` وأعادت HTTP 200. المصروفات والربح يعرضهما الفرونت إند كما يعيدهما الباك إند وفق قاعدة `originalPrice × quantity`، دون إعادة حساب أو اختراع بيانات. أما `dashboard-summary` فأعاد HTTP 404، لذلك لا يتم استخدامه كمسار تشغيلي حتى يتم نشره في الباك إند.
