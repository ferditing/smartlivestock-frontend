import api from "./axios";

// ---- Stats ----
export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

// ---- Counties ----
export const getAdminCounties = async () => {
  const res = await api.get("/admin/counties");
  return res.data;
};

// ---- Staff ----
export const getStaff = async () => {
  const res = await api.get("/admin/staff");
  return res.data;
};

export const createStaff = async (payload: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  assigned_county?: string;
}) => {
  const res = await api.post("/admin/staff", payload);
  return res.data;
};

export const resendStaffInvite = async (staffId: number) => {
  const res = await api.post(`/admin/resend-staff-invite/${staffId}`);
  return res.data;
};

// ---- Users ----
export const getUsers = async (params?: {
  role?: string;
  county?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.role && params.role !== "all") q.set("role", params.role);
  if (params?.county && params.county !== "all") q.set("county", params.county);
  if (params?.search) q.set("search", params.search);
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  const res = await api.get(`/admin/users?${q.toString()}`);
  return res.data;
};

export const getUsersAnalytics = async () => {
  const res = await api.get("/admin/users/analytics");
  return res.data;
};

export const suspendUser = async (userId: number, suspended: boolean) => {
  const res = await api.put(`/admin/users/${userId}/suspend`, { suspended });
  return res.data;
};

// ---- Providers ----
export const getProviders = async (params?: { status?: string; type?: string }) => {
  const q = new URLSearchParams();
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.type && params.type !== "all") q.set("type", params.type);
  const res = await api.get(`/admin/providers?${q.toString()}`);
  return res.data;
};

export const getProviderApplication = async (providerId: number) => {
  const res = await api.get(`/admin/providers/${providerId}/application`);
  return res.data;
};

export const confirmProviderDocuments = async (providerId: number) => {
  const res = await api.put(`/admin/providers/${providerId}/confirm-documents`);
  return res.data;
};

export const verifyProvider = async (
  providerId: number,
  opts?: { license_number?: string; license_expiry?: string }
) => {
  const res = await api.put(`/admin/providers/${providerId}/verify`, opts);
  return res.data;
};

export const rejectProvider = async (providerId: number, reason?: string) => {
  const res = await api.put(`/admin/providers/${providerId}/reject`, {
    reason: reason || "Application rejected",
  });
  return res.data;
};

// ---- Settings ----
export const getAdminSettings = async () => {
  const res = await api.get("/admin/settings");
  return res.data;
};

export const updateAdminSettings = async (payload: {
  outbreak_alert_threshold?: number;
  license_renewal_reminder_days?: number;
  email_on_approval?: boolean;
}) => {
  const res = await api.put("/admin/settings", payload);
  return res.data;
};

// ---- Audit logs ----
export const getAuditLogs = async (params?: { page?: number; limit?: number }) => {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  const res = await api.get(`/admin/audit-logs?${q.toString()}`);
  return res.data;
};

// ---- Analytics ----
export const getAdminAnalytics = async () => {
  const res = await api.get("/admin/analytics");
  return res.data;
};

export const getSymptomReports = async (params?: {
  page?: number;
  limit?: number;
  county?: string;
  status?: string;
}) => {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.county && params.county !== "all") q.set("county", params.county);
  if (params?.status && params.status !== "all") q.set("status", params.status);
  const res = await api.get(`/admin/symptom-reports?${q.toString()}`);
  return res.data;
};

export const getSymptomReport = async (reportId: number) => {
  const res = await api.get(`/admin/symptom-reports/${reportId}`);
  return res.data;
};

export const createVerifiedDocument = async (
  reportId: number,
  payload?: { prescription_notes?: string; recommendations?: string }
) => {
  const res = await api.post(
    `/admin/symptom-reports/${reportId}/verified-document`,
    payload
  );
  return res.data;
};

export const getVerifiedDocuments = async (params?: {
  page?: number;
  limit?: number;
  report_id?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.report_id != null) q.set("report_id", String(params.report_id));
  const res = await api.get(`/admin/verified-documents?${q.toString()}`);
  return res.data;
};
