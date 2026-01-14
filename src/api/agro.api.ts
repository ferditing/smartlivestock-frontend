import api from "./axios";

export const fetchProducts = async () => {
  const res = await api.get("/agro/products");
  return res.data;
};
