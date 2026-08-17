# تقرير تدقيق وإعادة هيكلة Kasher Frontend

## Project Overview

المشروع عبارة عن React 19 + TypeScript + Vite، ويستخدم Wouter للتوجيه، Tailwind CSS 4 وshadcn/ui للواجهة، Recharts للرسوم، XLSX وjsPDF للتصدير، وFetch wrapper مخصصاً للتعامل مع باك إند Vercel المنشور. التطبيق RTL عربي، ويحتوي على مسارين رئيسيين: مساحة Admin الخاصة بالمتجر، ومساحة SuperAdmin الخاصة بالمنصة.

نقطة الدخول هي `client/src/main.tsx`، ثم `client/src/App.tsx` الذي يركّب `ErrorBoundary` و`ThemeProvider` و`AuthProvider` وWouter routes. المصادقة موجودة في `client/src/contexts/AuthContext.tsx`، وطبقة الطلبات العامة في `client/src/lib/api.ts`، وعقود Admin في `client/src/lib/adminApi.ts`. صفحات Admin الأساسية موزعة اسمياً، لكن `Home.tsx` و`AdminSection.tsx` و`SuperAdminSection.tsx` تحتوي على مسؤوليات كثيرة داخل ملفات كبيرة جداً.

## Architecture Snapshot

| المجال | التطبيق الحالي | الملاحظة |
|---|---|---|
| Routing | Wouter routes صريحة في `App.tsx` | صالح وظيفياً، لكن Guard ينفذ navigation أثناء render |
| Authentication | Context + localStorage + refresh on 401 | يعمل، لكن بيانات الجلسة والتوكنات موزعة بين Context وAPI wrapper |
| API/Data | `api.ts` و`adminApi.ts` | توجد استجابات غير موحدة و`any` وassertions كثيرة |
| Server state | useEffect/useState داخل الصفحات | لا يوجد cache أو إلغاء طلبات أو حماية من race conditions |
| Admin UI | ملفات صفحات منفصلة، لكن `AdminSection.tsx` ضخم جداً | business logic وJSX والتصدير في ملف واحد |
| SuperAdmin UI | `SuperAdminSection.tsx` يعتمد غالباً على بيانات ثابتة | أهم فجوة وظيفية: لا توجد طبقة API حقيقية لمعظم الأقسام |
| Error handling | ErrorBoundary + رسائل محلية | ErrorBoundary يعرض stack trace للمستخدم ويحتوي على `cn` غير مستورد |
| Performance | Vite bundle واحد كبير نسبياً | لا يوجد lazy loading للمسارات، والرسوم تستورد الحزمة في الصفحة الكبيرة |
| Accessibility | بعض aria-labels موجودة | توجد أزرار بلا labels، وselect/input labels غير مكتملة في مواضع، ونوافذ/حالات تركيز محدودة |
| Security | لا توجد أسرار داخل الكود حسب المراجعة | localStorage يحتوي access/refresh tokens، وهو خطر XSS يجب توثيقه ومراقبته |

## Problems Found

| Priority | File | Problem | Impact | Proposed Solution |
|---|---|---|---|---|
| Critical | `client/src/components/ErrorBoundary.tsx` | عرض `error.stack` للمستخدم وتسريب تفاصيل التنفيذ، مع استخدام `cn` دون import واضح | Security/stability؛ fallback نفسه قد يفشل | إخفاء stack في الإنتاج، توحيد رسالة عربية، واستعمال classes مباشرة أو استيراد `cn` بشكل صريح |
| Critical | `client/src/App.tsx` | `Guard` يستدعي `navigate` أثناء render عند اختلاف الدور | تحذيرات React وسلوك تنقل غير مستقر | نقل redirect إلى `useEffect` أو استخدام Redirect محسوب دون side effect أثناء render |
| High | `client/src/pages/Home.tsx` | بيانات stats/products ثابتة ممزوجة ببيانات API، وتدفق login قديم داخل الصفحة رغم وجود `/login` | خطر عرض بيانات غير حقيقية وتضارب UX | جعل الصفحة تعتمد على API أو حالة empty واضحة، وإزالة login modal القديم أو تحويله إلى route واضح |
| High | `client/src/pages/SuperAdminSection.tsx` | التجار والاشتراكات والمنتجات والفواتير والإشعارات كلها mock/static | عدم جاهزية SuperAdmin وعدم سلامة قرارات التشغيل | استخراج service layer وربط كل شاشة بالـ endpoints الحقيقية المتاحة؛ إبقاء unavailable states صريحة عند غياب endpoint |
| High | `client/src/pages/AdminSection.tsx` | ملف ضخم يجمع layout وPOS والعملاء والمنتجات والتحليلات والتصدير | صعوبة الصيانة وارتفاع احتمال regression | تقسيمه تدريجياً إلى `admin/` features وhooks ومكونات جداول/فلاتر قابلة لإعادة الاستخدام |
| High | `client/src/lib/adminApi.ts` | أنواع `Record<string, any>` وresponse assertions متكررة، و`updateProfile(body: unknown)` | ضعف type safety وخطر أخطاء runtime | تعريف response envelopes وDTOs محددة واستخدام normalizers مركزية |
| High | `client/src/lib/api.ts` | لا يوجد AbortSignal أو request timeout أو normalized error object | طلبات معلقة وrace conditions ورسائل غير موحدة | إضافة `ApiError` وtimeout/abort اختياري مع الحفاظ على refresh retry الحالي |
| Medium | `client/src/pages/Home.tsx` و`AdminSection.tsx` | fetches متكررة لنفس الموارد دون cache أو cancellation | أداء أقل وتحديثات stale محتملة | hooks server-state خفيفة مع request identity أو AbortController قبل إدخال مكتبة جديدة |
| Medium | `client/src/pages/SuperAdminDashboard.tsx` | `apiGet<any>` مع cards static ومطابقة response غير typed | maintenance وdata correctness | types خاصة بـ superAdmin stats وempty state حقيقية |
| Medium | `client/src/pages/AdminSection.tsx` | استيرادات وتصدير وAPI وJSX في مستوى واحد، مع many inline handlers | readability واختبار صعب | فصل helpers ومكونات التصدير والجداول تدريجياً |
| Low | `package.json` | حزمة UI كبيرة من template، ولا توجد lint/test scripts فعلية | bundle/DX | قياس الاستخدام قبل حذف أي dependency، ثم إضافة lint وtests صغيرة دون major upgrades |
| Low | عدة ملفات | تنسيق مضغوط جداً في مكونات متعددة | صعوبة المراجعة والمساهمات | تنسيق Prettier تدريجي بدون تغيير behavior |

## Refactoring Plan

### المرحلة الأولى: Critical fixes

إصلاح ErrorBoundary لمنع تسريب stack trace، وإصلاح Guard حتى لا ينفذ navigation أثناء render. هذه التغييرات لا تغير API أو routes أو business behavior.

### المرحلة الثانية: Architecture improvements

إنشاء طبقة normalizers وDTOs في `adminApi.ts`، ثم فصل موارد Admin إلى وحدات صغيرة مثل `adminProductsApi` و`adminCustomersApi` و`adminAnalyticsApi` مع الحفاظ على exports الحالية مؤقتاً للتوافق.

### المرحلة الثالثة: Component refactoring

تقسيم `AdminSection.tsx` إلى layout ومكونات `PosPage` و`ProductsPage` و`CustomersPage` و`AnalyticsPage` و`ProfilePage`، ثم استخراج الجداول والفلاتر والتصدير فقط عندما يقلل ذلك التكرار فعلاً. لا يُعاد تصميم الواجهة.

### المرحلة الرابعة: State and performance

إضافة hooks خفيفة للطلبات التي تحتاج cancellation، تثبيت الدوال/القيم فقط حيث توجد إعادة حساب فعلية، وإضافة lazy loading للمسارات الكبيرة بعد التأكد من عدم كسر Wouter أو auth guards.

### المرحلة الخامسة: Accessibility and cleanup

تحسين labels وaria attributes وإدارة التركيز في النوافذ، إزالة المسارات الوهمية أو جعلها تعرض حالة غير متاحة بوضوح، ثم مراجعة التبعيات والتنسيق.

### Validation

بعد كل مجموعة تغييرات سيتم تشغيل `pnpm check` و`pnpm build`. سيتم عدم الادعاء باختبار كامل ما لم توجد اختبارات آلية تغطي المسارات، وسيتم توثيق أي endpoint SuperAdmin غير متاح بدلاً من اختراع بيانات.

## Scope Decision

لن يتم إجراء rewrite شامل أو تغيير التصميم الحالي. سيتم تنفيذ إصلاحات حرجة أولاً، ثم فصل أكبر الملفات تدريجياً، مع إبقاء API contracts وroutes وسلوك المصادقة كما هي.

## تنفيذ هذه الدورة

تم تنفيذ الإصلاحات التالية مع الحفاظ على العقود الخارجية:

| الملف | التغيير |
|---|---|
| `client/src/components/ErrorBoundary.tsx` | إخفاء stack trace من واجهة المستخدم، توحيد رسالة عربية آمنة، وتسجيل التفاصيل في console أثناء التطوير فقط. |
| `client/src/App.tsx` | تحويل redirect الخاص بالأدوار إلى `useEffect` لمنع side effect أثناء render، وإضافة lazy loading للمسارات مع fallback RTL. |
| `client/src/lib/api.ts` | إضافة `ApiError` موحد ورسائل أفضل للاستجابات المتداخلة مع إبقاء refresh-token retry كما هو. |
| `client/src/pages/Home.tsx` | إزالة تدفق تسجيل الدخول الوهمي، توجيه زر الدخول إلى `/login`، منع عرض بيانات المنتجات الثابتة، وتحسين types الخاصة بإحصاءات ومنتجات Admin. |
| `client/src/pages/SuperAdminSection.tsx` | إزالة التجار والاشتراكات والمنتجات والفواتير والإشعارات الوهمية؛ تعرض الأقسام الآن حالة صريحة حتى يتم توثيق endpoints SuperAdmin الحقيقية. |
| `todo.md` | تسجيل نطاق التدقيق ونتائج التنفيذ. |

## Validation Results

تم تشغيل `pnpm check` و`pnpm build` بنجاح. لم توجد ملفات اختبارات آلية (`*.test.*` أو `*.spec.*`) في المشروع، لذلك لا يُدّعى وجود تغطية اختبارية كاملة. تم التقاط معاينة مرئية لمساري `/` و`/login`، وبقيت واجهة الدخول سليمة بعد code splitting.

## Remaining Issues and Risks

لا يزال `AdminSection.tsx` كبيراً ويحتوي على JSX وbusiness logic وتصدير داخل ملف واحد؛ تفكيكه يحتاج دورة مستقلة لتقليل خطر regression. كما يظهر تحذير build بأن chunk `AdminSection` يتجاوز 500KB بعد الضغط، رغم أن route-level lazy loading خفّض تحميل المسارات الأخرى. ما زالت بعض استجابات Analytics وSuperAdmin تستخدم `any` أو عقوداً غير مكتملة، ولا يمكن تحويلها إلى DTOs دقيقة قبل توثيق response schemas من الباك إند. كذلك ما تزال access/refresh tokens محفوظة في localStorage بسبب عقد التطبيق الحالي؛ هذا قرار أمني يحتاج تنسيقاً مع الباك إند لا تغييره من الواجهة وحدها.
