import api from "./axios";

export const getSubadminStats = async () => {
  const res = await api.get("/subadmin/stats");
  return res.data;
};

export const getSubadminUsers = async (params?: {
  role?: string;
  search?: string;
  status?: string;
  sub_county?: string;
  page?: number;
  limit?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.role && params.role !== "all") q.set("role", params.role);
  if (params?.search) q.set("search", params.search);
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.sub_county && params.sub_county !== "all") q.set("sub_county", params.sub_county);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  const res = await api.get(`/subadmin/users?${q.toString()}`);
  return res.data;
};

export const suspendSubadminUser = async (userId: number, suspended: boolean) => {
  const res = await api.put(`/subadmin/users/${userId}/suspend`, { suspended });
  return res.data;
};

export const getSubadminSubcountyBreakdown = async () => {
  const res = await api.get("/subadmin/users/subcounty-breakdown");
  return res.data;
};

export const getSubadminAnalytics = async () => {
  const res = await api.get("/subadmin/analytics");
  return res.data;
};

export const getSubadminSymptomReports = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.status && params.status !== "all") q.set("status", params.status);
  const res = await api.get(`/subadmin/symptom-reports?${q.toString()}`);
  return res.data;
};

export const getSubadminSymptomReport = async (reportId: number) => {
  const res = await api.get(`/subadmin/symptom-reports/${reportId}`);
  return res.data;
};

export const getSubadminProviders = async (params?: { status?: string; type?: string }) => {
  const q = new URLSearchParams();
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.type && params.type !== "all") q.set("type", params.type);
  const res = await api.get(`/subadmin/providers?${q.toString()}`);
  return res.data;
};

export const getSubadminProviderApplication = async (providerId: number) => {
  const res = await api.get(`/subadmin/providers/${providerId}/application`);
  return res.data;
};

export const confirmSubadminProviderDocuments = async (providerId: number) => {
  const res = await api.put(`/subadmin/providers/${providerId}/confirm-documents`);
  return res.data;
};

export const verifySubadminProvider = async (
  providerId: number,
  opts?: { license_number?: string; license_expiry?: string }
) => {
  const res = await api.put(`/subadmin/providers/${providerId}/verify`, opts);
  return res.data;
};

export const rejectSubadminProvider = async (providerId: number, reason?: string) => {
  const res = await api.put(`/subadmin/providers/${providerId}/reject`, {
    reason: reason || "Application rejected",
  });
  return res.data;
};
