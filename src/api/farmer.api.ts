import api from "./axios";

export const fetchNearbyServices = async (lat: number, lng: number) => {
  const res = await api.get(`/services/nearby?lat=${lat}&lng=${lng}`);
  return res.data;
};

export const reportSymptom = async (symptom: string) => {
  return api.post("/symptoms/report", { symptom });
};
