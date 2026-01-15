import api from "./axios";

export const fetchPendingReports = async () => {
  try {
    const res = await api.get("/reports/incoming");
    return res.data;
  } catch (err) {
    console.warn("fetchPendingReports failed", err);
    return [];
  }
};
