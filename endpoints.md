# تقرير مسارات مشروع كاشير (Kasher Project Endpoints Report)

مستند مرجعي شامل يغطي جميع مسارات الواجهة الخلفية (API Endpoints)، بما في ذلك هيكل الطلبات (Request Body/Params)، الترويسات (Headers)، وهياكل الردود المتوقعة (Responses).

---

## 💡 معلومات أساسية (Base Configurations)
- **العنوان الأساسي المحلي (Base URL):** `http://localhost:3000` (أو منفذ خادم Express الفعلي).
- **نوع محتوى الطلب (Request Content-Type):** `application/json` لجميع طلبات `POST` و `PUT`.
- **نظام التوثيق (Authentication):** يتم استخدام رموز JWT. عند توفر التوثيق، يجب إرسال رمز الـ Access Token في الترويسة كالتالي:
  ```http
  Authorization: Bearer <Access_Token>
  ```

---

## 🌐 1. مسارات المصادقة والمسارات العامة (Auth & Public Endpoints)
*المسار الأساسي:* `/api/auth`  
*الملف المصدري للتحكم:* [auth.js](file:///d:/KasherProject/routes/auth.js)

### [POST] تسجيل حساب أدمن جديد (`/api/auth/register`)
- **الوصف:** تسجيل أدمن جديد وتأسيس شركة/سوبرماركت جديدة (Tenant) وبدء فترة تجريبية تلقائية (30 يوم).
- **التوثيق:** لا يتطلب.
- **جسم الطلب (Request Body):**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "businessName": "Supermarket Store",
    "phone": "+201234567890",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123"
  }
  ```
- **الرد الناجح (`201 Created`):**
  ```json
  {
    "message": "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني."
  }
  ```

### [POST] التحقق من رمز البريد الإلكتروني (`/api/auth/verify-otp`)
- **الوصف:** تفعيل حساب الأدمن المسجل حديثاً باستخدام رمز الـ OTP المرسل إلى بريده الإلكتروني.
- **التوثيق:** لا يتطلب.
- **جسم الطلب (Request Body):**
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Email verified successfully"
  }
  ```

### [POST] تسجيل الدخول (`/api/auth/login`)
- **الوصف:** التحقق من الهوية والحصول على رمز الوصول (Access Token) ورمز التحديث (Refresh Token) وبيانات المستخدم.
- **التوثيق:** لا يتطلب.
- **جسم الطلب (Request Body):**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "token": "JWT_ACCESS_TOKEN",
    "refreshToken": "JWT_REFRESH_TOKEN",
    "user": {
      "_id": "60d0fe...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "admin",
      "tenantId": "60d0fd...",
      "companyName": "Supermarket Store",
      "companyAddress": "-",
      "phone": "+201234567890",
      "isVerified": true,
      "createdAt": "2026-08-16T..."
    }
  }
  ```

### [POST] نسيت كلمة المرور (`/api/auth/forgot-password`)
- **الوصف:** إرسال رمز OTP مكون من 6 أرقام إلى البريد الإلكتروني الخاص بالمستخدم لإعادة تعيين كلمة المرور.
- **التوثيق:** لا يتطلب.
- **جسم الطلب (Request Body):**
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Reset code sent to your email"
  }
  ```

### [POST] إعادة تعيين كلمة المرور (`/api/auth/reset-password`)
- **الوصف:** تعيين كلمة مرور جديدة بعد إدخال رمز التحقق (OTP) المرسل للبريد.
- **التوثيق:** لا يتطلب.
- **جسم الطلب (Request Body):**
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456",
    "newPassword": "newsecurepassword123",
    "confirmNewPassword": "newsecurepassword123"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

### [POST] تحديث التوكن (`/api/auth/refresh-token`)
- **الوصف:** الحصول على Access Token جديد للمستخدم لتفادي تسجيل الخروج.
- **التوثيق:** لا يتطلب (يتم التحقق من الـ Refresh Token في جسم الطلب).
- **جسم الطلب (Request Body):**
  ```json
  {
    "refreshToken": "JWT_REFRESH_TOKEN"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "token": "NEW_JWT_ACCESS_TOKEN"
  }
  ```

### [POST] تسجيل الخروج (`/api/auth/logout`)
- **الوصف:** إبطال وإلغاء صلاحية التوكن الحالي وحفظه في القائمة السوداء (Blacklist).
- **التوثيق:** **مطلوب** (`Authorization: Bearer <Token>`).
- **جسم الطلب (Request Body):** فارغ.
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 👔 2. مسارات المسؤولين الخاصة (Admin Endpoints)
*المسار الأساسي:* `/api/admin`  
*الملف المصدري للتحكم:* [admin.js](file:///d:/KasherProject/routes/admin.js)  
*التوثيق:* **مطلوب لجميع المسارات** (`Authorization: Bearer <Token>`) ويجب أن يكون دور المستخدم هو `admin`.

### 📂 أولاً: إدارة التصنيفات (Categories)

#### [GET] عرض جميع التصنيفات (`/api/admin/categories`)
- **الوصف:** جلب قائمة بجميع تصنيفات المنتجات الخاصة بشركة الأدمن.
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": "60d0fa...",
      "name": "أجبان",
      "tenantId": "60d0fd...",
      "createdAt": "2026-08-16T..."
    }
  ]
  ```

#### [POST] إضافة تصنيف جديد (`/api/admin/categories`)
- **الوصف:** إضافة تصنيف جديد للمنتجات داخل الشركة.
- **جسم الطلب (Request Body):**
  ```json
  {
    "name": "مشروبات"
  }
  ```
- **الرد الناجح (`201 Created`):**
  ```json
  {
    "message": "Category created",
    "category": {
      "_id": "60d0fb...",
      "name": "مشروبات",
      "tenantId": "60d0fd...",
      "createdAt": "2026-08-16T..."
    }
  }
  ```

#### [PUT] تعديل تصنيف (`/api/admin/categories/:id`)
- **الوصف:** تعديل اسم تصنيف معين باستخدام معرفه الفريد (`:id`).
- **جسم الطلب (Request Body):**
  ```json
  {
    "name": "مشروبات وعصائر"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Category updated",
    "category": {
      "_id": "60d0fb...",
      "name": "مشروبات وعصائر",
      "tenantId": "60d0fd...",
      "createdAt": "2026-08-16T..."
    }
  }
  ```

#### [DELETE] حذف تصنيف (`/api/admin/categories/:id`)
- **الوصف:** حذف تصنيف منتجات معين باستخدام معرفه الفريد (`:id`).
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Category deleted"
  }
  ```

---

### 📦 ثانياً: إدارة المنتجات (Products)

#### [GET] عرض جميع المنتجات (`/api/admin/products`)
- **الوصف:** جلب كافة المنتجات الموجودة بمخزون شركة الأدمن.
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": "60d0fc...",
      "tenantId": "60d0fd...",
      "name": "جبنة بيضاء",
      "sku": "SKU123",
      "originalPrice": 40,
      "sellingPrice": 50,
      "quantity": 100,
      "categoryId": "60d0fa...",
      "createdAt": "2026-08-16T..."
    }
  ]
  ```

#### [POST] إضافة منتج جديد (`/api/admin/products`)
- **الوصف:** إنشاء منتج جديد في قاعدة بيانات الشركة. يجب أن يكون الـ SKU فريداً داخل نفس الشركة.
- **جسم الطلب (Request Body):**
  ```json
  {
    "name": "جبنة بيضاء",
    "sku": "SKU123",
    "originalPrice": 40,
    "sellingPrice": 50,
    "quantity": 100,
    "categoryId": "60d0fa..."
  }
  ```
- **الرد الناجح (`201 Created`):**
  ```json
  {
    "message": "Product created",
    "product": {
      "_id": "60d0fc...",
      "tenantId": "60d0fd...",
      "name": "جبنة بيضاء",
      "sku": "SKU123",
      "originalPrice": 40,
      "sellingPrice": 50,
      "quantity": 100,
      "categoryId": "60d0fa...",
      "createdAt": "2026-08-16T..."
    }
  }
  ```

#### [PUT] تعديل منتج (`/api/admin/products/:id`)
- **الوصف:** تحديث مواصفات وسعر وكمية المنتج باستخدام معرفه الفريد (`:id`).
- **جسم الطلب (Request Body):**
  ```json
  {
    "name": "جبنة بيضاء فاخرة",
    "sku": "SKU123-UPDATED",
    "originalPrice": 42,
    "sellingPrice": 55,
    "quantity": 85,
    "categoryId": "60d0fa..."
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Product updated",
    "product": {
      "_id": "60d0fc...",
      "tenantId": "60d0fd...",
      "name": "جبنة بيضاء فاخرة",
      "sku": "SKU123-UPDATED",
      "originalPrice": 42,
      "sellingPrice": 55,
      "quantity": 85,
      "categoryId": "60d0fa...",
      "createdAt": "2026-08-16T..."
    }
  }
  ```

#### [DELETE] حذف منتج (`/api/admin/products/:id`)
- **الوصف:** حذف منتج من المخزون نهائياً. (ملاحظة: يفشل الحذف إذا كان المنتج مرتبطاً بفاتورة مبيعات مسجلة مسبقاً).
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Product deleted"
  }
  ```

---

### 🧾 ثالثاً: إدارة المبيعات والفواتير (Invoices)

#### [GET] الفلترة والبحث المتقدم في الفواتير (`/api/admin/all-invoices`)
- **الوصف:** جلب فواتير الشركة مع جلب بيانات الموظف الذي أصدر الفاتورة (Populate)، ودعم الفلاتر المتقدمة والترقيم (Pagination).
- **معلمات الاستعلام (Query Parameters - اختيارية):**
  - `page` (الرقم الحالي للصفحة، الافتراضي: 1)
  - `limit` (عدد النتائج لكل صفحة، الافتراضي: 20)
  - `startDate` (تاريخ بداية البحث - صيغة ISO)
  - `endDate` (تاريخ نهاية البحث - صيغة ISO)
  - `customer` (نص للبحث في اسم العميل بـ Regex)
  - `employee` (معرف الموظف المصدّر للفاتورة `employeeId`)
  - `minTotal` (الحد الأدنى لقيمة الفاتورة الإجمالية)
  - `maxTotal` (الحد الأقصى لقيمة الفاتورة الإجمالية)
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": "60d0fe...",
      "tenantId": "60d0fd...",
      "invoiceNumber": "INV-1001",
      "employeeId": {
        "_id": "60d0ff...",
        "name": "Employee Name",
        "email": "employee@example.com"
      },
      "customer": {
        "name": "Customer Name",
        "phone": "+2010..."
      },
      "items": [
        {
          "productId": "60d0fc...",
          "sku": "SKU123",
          "name": "جبنة بيضاء",
          "quantity": 2,
          "price": 50,
          "total": 100
        }
      ],
      "totalAmount": 100,
      "createdAt": "2026-08-16T..."
    }
  ]
  ```

#### [GET] عرض الفواتير المحدود (`/api/admin/invoices`)
- **الوصف:** عرض مبسط للفواتير مع فلتر يعتمد على تاريخ واحد فقط.
- **معلمات الاستعلام (Query Parameters):**
  - `page` (الافتراضي: 1)
  - `limit` (الافتراضي: 10)
  - `date` (تاريخ الفلترة بالتحديد: `YYYY-MM-DD`)
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": "60d0fe...",
      "tenantId": "60d0fd...",
      "invoiceNumber": "INV-1001",
      "employeeId": "60d0ff...",
      "customer": {
        "name": "Customer Name",
        "phone": "+2010..."
      },
      "items": [...],
      "totalAmount": 100,
      "createdAt": "2026-08-16T..."
    }
  ]
  ```

---

### 📊 رابعاً: الإحصائيات والتقارير (Reports & Analytics)

#### [GET] إحصائيات الأدمن الأساسية (`/api/admin/stats`)
- **الوصف:** جلب أعداد الموظفين، أعداد الفواتير، وصافي أرباح المبيعات مقسمة لليوم، الشهر، والسنة.
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "employeesCount": 3,
    "invoicesCount": 20,
    "todayProfit": 500,
    "monthProfit": 12000,
    "yearProfit": 150000
  }
  ```

#### [GET] توليد التقارير البيعية المجمعة (`/api/admin/reports`)
- **الوصف:** تجميع المبيعات والأرباح وإدراج المنتجات الأكثر مبيعاً مجمعة حسب اليوم أو الشهر أو السنة.
- **معلمات الاستعلام (Query Parameters):**
  - `type` (نوع التجميع: `daily` أو `monthly` أو `yearly`)
  - `startDate` (فلترة التاريخ من)
  - `endDate` (فلترة التاريخ إلى)
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": "2026-08-16",
      "totalSales": 1000,
      "totalInvoices": 5,
      "topProducts": [
        { "productId": "60d0fc...", "name": "جبنة بيضاء", "quantitySold": 10 }
      ]
    }
  ]
  ```

#### [GET] تحليلات لوحة التحكم لوضع المخزون والمبيعات (`/api/admin/dashboard/analytics`)
- **الوصف:** عرض حالة المخزون الحالية وإجمالي قيمته المالية بالإضافة لملخص المبيعات خلال فترة تاريخية محددة.
- **معلمات الاستعلام (Query Parameters):**
  - `startDate` (اختياري - تاريخ البداية)
  - `endDate` (اختياري - تاريخ النهاية)
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "inventoryStatus": {
      "totalQuantity": 500,
      "totalValue": 25000
    },
    "invoiceSummaries": {
      "totalInvoices": 120,
      "totalRevenue": 50000
    }
  }
  ```

---

## 👑 3. مسارات المسؤولين الخارقين (Super Admin Endpoints)
*المسار الأساسي:* `/api/superAdmin`  
*الملف المصدري للتحكم:* [superAdmin.js](file:///d:/KasherProject/routes/superAdmin.js)  
*التوثيق:* **مطلوب لجميع المسارات** (`Authorization: Bearer <Token>`) ويجب أن يكون دور المستخدم هو `superAdmin`.

### [GET] استعراض الشركات الموحد والمفصل (`/api/superAdmin/tenants`)
- **الوصف:** جلب كافة الشركات (الـ Tenants/السوبرماركتس) المسجلة بالنظام مع جلب تفاصيل مديريها، اشتراكاتها، وإحصائيات مبيعاتها اختيارياً.
- **معلمات الاستعلام (Query Parameters):**
  - `page` (الافتراضي: 1)
  - `limit` (الافتراضي: 10)
  - `status` (فلترة حالة الاشتراك: `pending`, `approved`, `rejected`...)
  - `plan` (فلترة نوع الخطة: `trial`, `premium`...)
  - `include` (عند إرسال قيمة `stats` يتم جلب إجمالي أرباح وعدد فواتير كل شركة)
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "tenants": [
      {
        "tenantId": "60d0fd...",
        "name": "Supermarket Store",
        "address": "-",
        "createdAt": "2026-08-16T...",
        "admin": {
          "id": "60d0fe...",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "phone": "+201234567890"
        },
        "subscription": {
          "plan": "trial",
          "price": 0,
          "status": "pending",
          "paymentConfirmed": false,
          "startDate": "2026-08-16T...",
          "endDate": "2026-09-15T..."
        },
        "stats": {
          "totalProfit": 50000,
          "invoiceCount": 120
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### [GET] تفاصيل شركة محددة (`/api/superAdmin/tenants/:tenantId`)
- **الوصف:** جلب الملف التعريفي الكامل لشركة معينة شامل قائمة الموظفين التابعين وقائمة المبيعات بالكامل.
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "tenant": {
      "_id": "60d0fd...",
      "name": "Supermarket Store",
      "address": "-",
      "createdAt": "2026-08-16T..."
    },
    "employees": [
      {
        "_id": "60d0ff...",
        "name": "Emp Name",
        "email": "emp@example.com",
        "role": "employee"
      }
    ],
    "invoices": [
      {
        "_id": "60d0fe...",
        "invoiceNumber": "INV-1001",
        "totalAmount": 100,
        "createdAt": "2026-08-16T..."
      }
    ]
  }
  ```

### [DELETE] حذف شركة بالكامل (`/api/superAdmin/tenants/:tenantId`)
- **الوصف:** حذف الشركة وحذف كافة الحسابات والفواتير والبيانات المرتبطة بها نهائياً من النظام.
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Tenant and all associated data deleted successfully"
  }
  ```

### [PUT] تعطيل اشتراك الشركة (`/api/superAdmin/tenants/:tenantId/disable`)
- **الوصف:** إيقاف اشتراك شركة معينة مؤقتاً وتعطيل وصولها للخدمة.
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Tenant subscription disabled"
  }
  ```

### [GET] إحصائيات النظام الشاملة للـ Super Admin (`/api/superAdmin/stats`)
- **الوصف:** جلب ملخص عام لكامل النظام (عدد الشركات، إجمالي المستخدمين، تفاصيل الأرباح لكل شركة، وقائمة المنتجات الإجمالية).
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "tenantsCount": 5,
    "usersCount": 20,
    "profits": [
      { "_id": "60d0fd...", "total": 50000 }
    ],
    "products": [
      { "name": "جبنة بيضاء", "sku": "SKU123", "originalPrice": 40, "sellingPrice": 50, "tenantId": "60d0fd..." }
    ]
  }
  ```

### [GET] ملخص إيرادات الشركات (`/api/superAdmin/tenants-stats`)
- **الوصف:** جلب كشف مبسط بإيرادات وفواتير كل شركة على حدة.
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "tenant": {
        "_id": "60d0fd...",
        "name": "Supermarket Store"
      },
      "totalProfit": 50000,
      "invoices": [...]
    }
  ]
  ```

### [POST] إنشاء مسؤول جديد لشركة ما يدوياً (`/api/superAdmin/users/admin`)
- **الوصف:** تمكين الـ Super Admin من إضافة مستخدم بدور `admin` تابع لشركة معينة يدوياً.
- **جسم الطلب (Request Body):**
  ```json
  {
    "tenantId": "60d0fd...",
    "name": "New Admin Name",
    "email": "newadmin@example.com",
    "password": "securepassword123"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "user": {
      "_id": "60d0ff...",
      "tenantId": "60d0fd...",
      "name": "New Admin Name",
      "email": "newadmin@example.com",
      "role": "admin"
    }
  }
  ```

### [PUT] تعديل بيانات الأدمن (`/api/superAdmin/users/admin/:id`)
- **الوصف:** تعديل بيانات حساب الأدمن (الاسم، البريد الإلكتروني، كلمة المرور الجديدة).
- **جسم الطلب (Request Body):**
  ```json
  {
    "name": "Updated Admin Name",
    "email": "newadmin@example.com",
    "password": "newsecurepassword123"
  }
  ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Admin updated successfully",
    "user": {
      "_id": "60d0ff...",
      "name": "Updated Admin Name",
      "email": "newadmin@example.com",
      "role": "admin"
    }
  }
  ```

### [DELETE] حذف حساب أدمن (`/api/superAdmin/users/admin/:id`)
- **الوصف:** حذف حساب أدمن معين من النظام باستخدام معرفه الفريد (`:id`).
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Admin user deleted successfully"
  }
  ```

### [GET] التقرير البيعي الموحد والتقرير الشامل (`/api/superAdmin/reports/global`)
- **الوصف:** تجميع المبيعات والفواتير الإجمالية على مستوى كامل خوادم النظام ولجميع الشركات، لمعرفة إيرادات المنصة ككل والمنتجات الأكثر طلباً.
- **الرد الناجح (`200 OK`):**
  ```json
  [
    {
      "_id": null,
      "totalSales": 100000,
      "totalInvoices": 1250,
      "topProducts": [
        { "productId": "60d0fc...", "name": "جبنة بيضاء", "quantitySold": 500 }
      ]
    }
  ]
  ```

### [POST] مراجعة وتفعيل اشتراك شركة (`/api/superAdmin/subscriptions/approve`)
- **الوصف:** تمكين الـ Super Admin من مراجعة طلبات الاشتراكات المعلقة، والموافقة عليها لتفعيل النظام للشركة، أو رفضها مع كتابة سبب الرفض.
- **جسم الطلب (Request Body):**
  - **في حالة الموافقة (Approved):**
    ```json
    {
      "subscriptionId": "60d0fa...",
      "status": "approved"
    }
    ```
  - **في حالة الرفض (Rejected) - يجب إرفاق سبب الرفض:**
    ```json
    {
      "subscriptionId": "60d0fa...",
      "status": "rejected",
      "rejectionReason": "لقد قمت بإرفاق صورة دفع غير واضحة للتأكيد."
    }
    ```
- **الرد الناجح (`200 OK`):**
  ```json
  {
    "message": "Subscription status updated successfully",
    "subscription": {
      "_id": "60d0fa...",
      "tenantId": "...",
      "plan": "premium",
      "status": "approved",
      "paymentConfirmed": true
    }
  }
  ```

---

## ⚠️ 4. تنبيه هام بخصوص ملفات المسارات غير المفعلة (Unmounted Routes)

> [!WARNING]
> هناك ملفات مسارات تم برمجتها داخل مجلد `routes` ولكن **لم يتم تضمينها أو ربطها (Mount)** داخل ملف [server.js](file:///d:/KasherProject/server.js) الخاص بالخادم الأساسي:
> 1. **[inventory.js](file:///d:/KasherProject/routes/inventory.js):** يحتوي على مسار البحث عن المنتجات `GET /products/search`. (يرجى ربطه لتشغيل البحث المتقدم للمنتجات).
> 2. **[invoices.js](file:///d:/KasherProject/routes/invoices.js):** يحتوي على مسارات إصدار فواتير جديدة `POST /invoices` ومسار البحث المتقدم للفواتير `GET /invoices/search`.
> 3. **[subscriptions.js](file:///d:/KasherProject/routes/subscriptions.js):** يحتوي على مسار عرض الاشتراكات `GET /subscriptions` وتفعيلها `POST /subscriptions/approve` بشكل منفصل. (ملاحظة: كود الموافقة مدمج بالفعل داخل ملف `superAdmin.js`).
> 
> **إذا حاولت استدعاء أي من هذه المسارات مباشرة ببادئ مثل `/api/admin/products/search` فسترجع خطأ `404 Not Found` حتى يتم استيرادها وربطها بـ `app.use()` في ملف [server.js](file:///d:/KasherProject/server.js).**
