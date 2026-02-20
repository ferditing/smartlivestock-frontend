import api from "./axios";

export type CartItem = {
  id: number;
  product_id: number;
  qty: number;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  company?: string;
  description?: string;
  provider_id?: number;
  shop_name?: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price: number;
  name: string;
  image_url?: string;
  company?: string;
};

export type Order = {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_ref?: string;
  vet_approved?: boolean;
  created_at: string;
  items: OrderItem[];
};

// Cart APIs
export const getCart = async (): Promise<CartItem[]> => {
  const res = await api.get("/agro/cart");
  return res.data;
};

export const addToCart = async (product_id: number, qty: number = 1) => {
  const res = await api.post("/agro/cart/add", { product_id, qty });
  return res.data;
};

export const updateCartItem = async (id: number, qty: number) => {
  const res = await api.put(`/agro/cart/${id}`, { qty });
  return res.data;
};

export const removeFromCart = async (id: number) => {
  const res = await api.delete(`/agro/cart/${id}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/agro/cart");
  return res.data;
};

// Orders APIs
export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/agro/orders");
  return res.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const res = await api.get(`/agro/orders/${id}`);
  return res.data;
};

export const checkout = async (phone: string, provider_id?: number) => {
  const res = await api.post("/agro/orders/checkout", { phone, ...(provider_id != null && { provider_id }) });
  return res.data;
};

// Paystack checkout - initialize payment
export const initializePaystackPayment = async (amount: number, email: string, provider_id?: number) => {
  const res = await api.post("/agro/orders/paystack/initialize", { 
    amount, 
    email,
    ...(provider_id != null && { provider_id }) 
  });
  return res.data;
};

// Verify Paystack payment
export const verifyPaystackPayment = async (reference: string, provider_id?: number) => {
  const res = await api.post("/agro/orders/paystack/verify", { 
    reference,
    ...(provider_id != null && { provider_id }) 
  });
  return res.data;
};

// Re-initialize Paystack payment for an existing order (used by "Pay again")
export const reinitializePaystackPaymentForOrder = async (order_id: number) => {
  // Backend route can be implemented as either:
  // - POST /agro/orders/paystack/reinitialize  { order_id }
  // - POST /agro/orders/{id}/paystack/reinitialize
  // We'll call the generic endpoint first, and you can align backend accordingly.
  const res = await api.post("/agro/orders/paystack/reinitialize", { order_id });
  return res.data;
};

// Products APIs (for marketplace)
export const getMarketplaceProducts = async (params?: {
  provider_id?: number;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/agro/products", { params });
  return res.data;
};
