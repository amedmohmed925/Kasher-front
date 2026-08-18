/**
 * Kasher — Super Admin API contract.
 */
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export type TenantSubscription = {
  plan: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  paymentConfirmed: boolean;
  startDate: string;
  endDate: string;
  rejectionReason?: string;
};

export type Tenant = {
  tenantId: string;
  name: string;
  address?: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  subscription?: TenantSubscription;
  stats?: {
    totalProfit: number;
    invoiceCount: number;
  };
};

export type TenantListResponse = {
  tenants: Tenant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type TenantDetails = {
  tenant: {
    _id: string;
    name: string;
    address?: string;
    createdAt: string;
  };
  employees: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  invoices: Array<{
    _id: string;
    invoiceNumber?: string;
    totalAmount: number;
    createdAt: string;
  }>;
};

export type SuperAdminStats = {
  tenantsCount: number;
  usersCount: number;
  profits: Array<{ _id: string; total: number }>;
  products: Array<{ name: string; sku: string; originalPrice: number; sellingPrice: number; tenantId: string }>;
};

export type GlobalReport = {
  _id: null | string;
  totalSales: number;
  totalInvoices: number;
  topProducts: Array<{ productId: string; name: string; quantitySold: number }>;
};

export const listTenants = (params: { page?: number; limit?: number; status?: string; plan?: string; include?: string } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qStr = query.toString();
  return apiGet<TenantListResponse | { tenants: Tenant[] }>(`/api/superAdmin/tenants${qStr ? `?${qStr}` : ""}`);
};

export const getTenantDetails = (tenantId: string) => apiGet<TenantDetails>(`/api/superAdmin/tenants/${tenantId}`);

export const deleteTenant = (tenantId: string) => apiDelete(`/api/superAdmin/tenants/${tenantId}`);

export const disableTenant = (tenantId: string) => apiPut<{ message: string }>(`/api/superAdmin/tenants/${tenantId}/disable`, {});

export const approveSubscription = (body: { subscriptionId: string; status: "approved" | "rejected"; rejectionReason?: string }) => 
  apiPost<{ message: string; subscription: any }>(`/api/superAdmin/subscriptions/${body.subscriptionId}/approve`, { status: body.status, rejectionReason: body.rejectionReason });

export const createAdminUser = (body: { tenantId: string; name: string; email: string; password: string }) => 
  apiPost<{ user: any }>("/api/superAdmin/users/admin", body);

export const updateAdminUser = (id: string, body: { name?: string; email?: string; password?: string }) => 
  apiPut<{ message: string; user: any }>(`/api/superAdmin/users/admin/${id}`, body);

export const deleteAdminUser = (id: string) => apiDelete(`/api/superAdmin/users/admin/${id}`);

export const getSuperAdminStats = () => apiGet<SuperAdminStats>("/api/superAdmin/stats");

export const getTenantsStats = () => apiGet<any[]>("/api/superAdmin/tenants-stats");

export const getGlobalReports = () => apiGet<GlobalReport[]>("/api/superAdmin/reports/global");

export const listSubscriptions = () => apiGet<any[]>("/api/superAdmin/subscriptions");

export const listPlatformProducts = (params: { adminId?: string; categoryId?: string; page?: number; limit?: number; minPrice?: number; maxPrice?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qStr = query.toString();
  return apiGet<any>(`/api/superAdmin/products${qStr ? `?${qStr}` : ""}`);
};
