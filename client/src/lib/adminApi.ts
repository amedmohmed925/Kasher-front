/**
 * Kasher — Admin API contract. All requests go through the published backend.
 */
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export type Category = { _id: string; name: string; description?: string };
export type Product = { _id: string; name: string; barcode: string; sku?: string; originalPrice: number; sellingPrice: number; quantity: number; categoryId?: Category | string; description?: string };
export type Customer = { _id: string; name: string; phone: string; email?: string; address?: string; status?: "active" | "inactive"; totalOrders?: number; totalSpent?: number; createdAt?: string };
export type CustomerPagination = { current: number; pages: number; total: number; limit: number };
export type CustomerListResponse = { customers: Customer[]; pagination: CustomerPagination };
export type CustomerStats = { totalCustomers?: number; activeCustomers?: number; inactiveCustomers?: number; newCustomers?: number; period?: number; total?: { customers: number; activeCustomers: number; inactiveCustomers: number }; today?: { newCustomers: number; orders: number; revenue: number }; week?: { newCustomers: number; orders: number; revenue: number }; month?: { newCustomers: number; orders: number; revenue: number }; topCustomers?: Customer[]; recent?: Customer[]; activity?: unknown[] };
export type Invoice = { _id: string; invoiceNumber?: string; customerId?: string; totalAmount: number; paymentMethod?: string; createdAt?: string; customer?: { name?: string; phone?: string }; items?: Array<{ name: string; quantity: number; price: number }>; discount?: { type: "percentage" | "fixed"; value: number; amount: number }; notes?: string; subtotal?: number };
export type AdminStats = { totalInvoices?: number; dailyProfit?: number; monthlyProfit?: number; yearlyProfit?: number; invoicesCount?: number; todayProfit?: number; monthProfit?: number; yearProfit?: number };
export type AdminProfile = { id?: string; _id?: string; firstName?: string; lastName?: string; companyName?: string; companyAddress?: string; phone?: string; email?: string; role?: string };
export type AdminReport = Record<string, unknown>;
export type AdvancedAnalytics = Record<string, unknown>;
export interface PeriodAnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalItemsSold: number;
  profitMargin: number;
  discountRate: number;
}
export interface PeriodAnalyticsCustomers {
  uniqueCustomers: number;
  averageCustomerValue: number;
  totalCustomerRevenue: number;
}
export interface PeriodAnalyticsTopProduct {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}
export interface PeriodAnalyticsPaymentMethod {
  _id: string;
  count: number;
  amount: number;
}
export interface PeriodAnalyticsTimeTrend {
  _id: string;
  revenue: number;
  orders: number;
  profit: number;
  expenses: number;
  netProfit: number;
}
export interface PeriodAnalytics {
  period: {
    type: string;
    startDate: string | null;
    endDate: string | null;
    description: string;
  };
  overview: PeriodAnalyticsOverview;
  customers: PeriodAnalyticsCustomers;
  topProducts: PeriodAnalyticsTopProduct[];
  paymentMethods: PeriodAnalyticsPaymentMethod[];
  timeTrend: PeriodAnalyticsTimeTrend[];
}
export type AnalyticsComparison = Record<string, any>;
export type DashboardSummary = Record<string, any>;
export type ComprehensiveDashboard = Record<string, any>;

export const listCategories = () => apiGet<Category[]>("/api/admin/categories");
export const createCategory = (body: { name: string; description?: string }) => apiPost<Category>("/api/admin/categories", body);
export const updateCategory = (id: string, body: Partial<Category>) => apiPut<Category>(`/api/admin/categories/${id}`, body);
export const deleteCategory = (id: string) => apiDelete(`/api/admin/categories/${id}`);
export const listProducts = (query = "") => apiGet<Product[]>(`/api/admin/products${query}`);
export const searchProducts = (query: string) => apiGet<Product[]>(`/api/admin/products/search?q=${encodeURIComponent(query)}`);
export const createProduct = (body: FormData) => apiPost<Product>("/api/admin/products", body);
export const updateProduct = (id: string, body: Partial<Product>) => apiPut<Product>(`/api/admin/products/${id}`, body);
export const deleteProduct = (id: string) => apiDelete(`/api/admin/products/${id}`);

export const getAdminStats = () => apiGet<AdminStats>("/api/admin/stats");
export const getAdminReports = (type?: "daily" | "monthly" | "yearly", startDate?: string, endDate?: string) => {
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);
  const qStr = query.toString();
  return apiGet<AdminReport | { data?: AdminReport }>(`/api/admin/reports${qStr ? `?${qStr}` : ""}`);
};
export const getDashboardAnalytics = (startDate?: string, endDate?: string) => { const query = startDate && endDate ? `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` : ""; return apiGet<AdminReport | { data?: AdminReport }>(`/api/admin/dashboard/analytics${query}`); };
export const getAnalytics = getDashboardAnalytics;
export const getAdvancedAnalytics = (startDate: string, endDate: string) => getDashboardAnalytics(startDate, endDate);
export const getPeriodAnalytics = (period: string, startDate?: string, endDate?: string) => { const query = new URLSearchParams({ period }); if (startDate) query.set("startDate", startDate); if (endDate) query.set("endDate", endDate); return apiGet<{ success?: boolean; data?: PeriodAnalytics }>(`/api/admin/analytics/periods?${query.toString()}`); };
export const compareAnalytics = (params: { currentPeriod: string; comparisonPeriod: string; currentStart?: string; currentEnd?: string; comparisonStart?: string; comparisonEnd?: string }) => { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value && query.set(key, value)); return apiGet<{ success?: boolean; data?: AnalyticsComparison }>(`/api/admin/analytics/compare?${query.toString()}`); };
export const getDashboardSummary = () => apiGet<{ success?: boolean; data?: DashboardSummary }>("/api/admin/analytics/dashboard-summary");
export const getComprehensiveDashboard = (period = "all", startDate?: string, endDate?: string) => { const query = new URLSearchParams({ period }); if (startDate) query.set("startDate", startDate); if (endDate) query.set("endDate", endDate); return apiGet<{ success?: boolean; data?: ComprehensiveDashboard }>(`/api/admin/analytics/dashboard?${query.toString()}`); };
export const listInvoices = (page = 1, limit = 20) => apiGet<Invoice[]>(`/api/admin/invoices?page=${page}&limit=${limit}`);
export const listAllInvoices = (params: { page?: number; limit?: number; startDate?: string; endDate?: string; customer?: string; employee?: string; minTotal?: number; maxTotal?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qStr = query.toString();
  return apiGet<Invoice[] | { data?: Invoice[] }>(`/api/admin/all-invoices${qStr ? `?${qStr}` : ""}`);
};
export type InvoiceCreateItem = { productId: string; quantity: number; originalPrice: number; sellingPrice: number };
export type InvoiceCreateBody = { customerId?: string; items: InvoiceCreateItem[]; paymentMethod: "cash" | "card" | "bank_transfer"; discount: { type: "percentage" | "fixed"; value: number; amount: number }; notes?: string };
export const createInvoice = (body: InvoiceCreateBody) => apiPost<{ success: boolean; data: Invoice }>("/api/admin/invoices", body);

export const getCustomers = async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value !== undefined && value !== "" && query.set(key, String(value))); const response = await apiGet<CustomerListResponse | Customer[] | { success?: boolean; data?: CustomerListResponse }>(`/api/admin/customers${query.toString() ? `?${query}` : ""}`); const data = Array.isArray(response) ? { customers: response, pagination: { current: 1, pages: 1, total: response.length, limit: response.length } } : ((response as { data?: CustomerListResponse }).data || response as CustomerListResponse); return { customers: data.customers || [], pagination: data.pagination || { current: 1, pages: 1, total: 0, limit: params.limit || 10 } }; };
export const getCustomer = (id: string) => apiGet<Customer | { success?: boolean; data?: { customer?: Customer } }>(`/api/admin/customers/${id}`).then((response) => (response as { data?: { customer?: Customer } }).data?.customer || response as Customer);
export const getCustomerStats = async () => { const response = await apiGet<{ success?: boolean; data?: { overview?: CustomerStats }; overview?: CustomerStats }>("/api/admin/customers/stats/overview"); return response.data?.overview || response.overview || {}; };
export const createCustomer = (body: { name: string; phone: string; email?: string; address?: string; status?: "active" | "inactive" }) => apiPost<Customer | { success?: boolean; data?: { customer?: Customer } }>("/api/admin/customers", body);
export const updateCustomer = (id: string, body: Partial<Customer>) => apiPut<Customer | { success?: boolean; data?: { customer?: Customer } }>(`/api/admin/customers/${id}`, body);
export const deleteCustomer = (id: string) => apiDelete(`/api/admin/customers/${id}`);

export const getProfile = () => apiGet<AdminProfile | { data?: { admin?: AdminProfile; profile?: AdminProfile } }>("/api/admin/profile");
export const updateProfile = (body: unknown) => apiPut<AdminProfile | { data?: { admin?: AdminProfile; profile?: AdminProfile } }>("/api/admin/profile", body);
export const getAdminById = (id: string) => apiGet<AdminProfile | { data?: { admin?: AdminProfile } }>(`/api/admin/admin/${id}`);
