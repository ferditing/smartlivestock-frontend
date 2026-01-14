import api from "./axios";

export const fetchPendingReports = async () => {
  const res = await api.get("/vet/reports/pending");
  return res.data;
};
