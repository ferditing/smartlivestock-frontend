import api from "./axios";

export const fetchProducts = async (providerId?: number) => {
  try {
    const url = providerId ? `/agro/products?provider_id=${providerId}` : "/agro/products";
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.warn("fetchProducts failed", err);
    return [];
  }
};
