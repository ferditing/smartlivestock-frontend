import api from "./axios";

export const fetchMyProducts = async () => {
  const res = await api.get("/agro/products/mine");
  return res.data;
};

export const fetchProviderProducts = async (providerId: number) => {
  const res = await api.get(`/agro/products/by-provider/${providerId}`);
  return res.data;
};

