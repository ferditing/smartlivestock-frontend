import api from "./axios";

export type ShopInfo = {
  shopName: string;
  county: string;
  subCounty: string;
};

export type RevenueByMonth = {
  month: string;
  revenue: number;
  year: number;
};

export type OrdersByStatus = {
  status: string;
  count: number;
};

export type AgroStats = {
  productCount: number;
  totalRevenue: number;
  orderCount: number;
  customerCount: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  shopInfo?: ShopInfo;
  revenueByMonth?: RevenueByMonth[];
  ordersByStatus?: OrdersByStatus[];
};

export const getAgroStats = async (): Promise<AgroStats> => {
  const res = await api.get("/agro/stats");
  return res.data;
};

export type AgrovetShop = {
  id: number;
  shopName: string;
  county: string | null;
  subCounty: string | null;
  productCount: number;
};

export const getAgrovetShops = async (search?: string): Promise<AgrovetShop[]> => {
  const res = await api.get("/agro/shops", { params: search ? { search } : {} });
  return res.data;
};

export type SellerOrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price: number;
  name: string;
  image_url?: string;
  company?: string;
};

export type SellerOrder = {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: SellerOrderItem[];
  buyer?: { id: number; name: string; email?: string; phone?: string };
};

export const getSellerOrders = async (): Promise<SellerOrder[]> => {
  const res = await api.get("/agro/orders/seller");
  return res.data;
};

export const getSellerOrder = async (orderId: number): Promise<SellerOrder> => {
  const res = await api.get(`/agro/orders/seller/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<{ id: number; status: string }> => {
  const res = await api.patch(`/agro/orders/seller/${orderId}/status`, { status });
  return res.data;
};

export const fetchMyProducts = async () => {
  const res = await api.get("/agro/products/mine");
  return res.data;
};

export const fetchProviderProducts = async (providerId: number) => {
  const res = await api.get(`/agro/products/by-provider/${providerId}`);
  return res.data;
};

export const fetchProviderProductsPaginated = async (
  providerId: number,
  page: number = 1,
  search: string = ""
) => {
  const res = await api.get(`/agro/products/by-provider/${providerId}`, {
    params: { page, search },
  });
  return res.data;
};

// Vet verification (ecommerce product trust)
export type VetVerificationProduct = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  company?: string;
  description?: string;
  usage?: string;
  image_url?: string;
  provider_id?: number;
  shop_name?: string;
  vet_verification_requested?: boolean;
  vet_verified?: boolean;
  vet_verified_at?: string;
  vet_verified_by?: number;
  vet_verification_notes?: string | null;
};

export const requestVetVerification = async (productId: number) => {
  const res = await api.patch(`/agro/products/${productId}/request-vet-verification`);
  return res.data;
};

export const fetchVetVerificationRequests = async (): Promise<VetVerificationProduct[]> => {
  const res = await api.get("/agro/products/vet/verification-requests");
  return res.data;
};

export const vetVerifyProduct = async (productId: number, approved: boolean, notes?: string) => {
  const res = await api.patch(`/agro/products/vet/verify/${productId}`, { approved, notes });
  return res.data;
};

export const createProduct = async (form: FormData) => {
  const res = await api.post("/agro/products", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (id: number, form: FormData) => {
  const res = await api.put(`/agro/products/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete(`/agro/products/${id}`);
  return res.data;
};

