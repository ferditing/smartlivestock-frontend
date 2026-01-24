import api from "./axios";

export const fetchNearbyServices = async (lat: number, lng: number, radius = 10000) => {
  // backend exposes nearby providers at /api/providers/nearby
  const res = await api.get(`/providers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return res.data;
};

export const reportSymptom = async (symptom: string, opts?: { lat?: number; lng?: number; animal_id?: number }) => {
  return api.post("/reports", {
    symptom_text: symptom,
    lat: opts?.lat,
    lng: opts?.lng,
    animal_id: opts?.animal_id,
  });
};
