import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { 
  LoginCredentials, 
  LoginResponse, 
  RecordMetadata, 
  RecordFull, 
  RecordCreateRequest,
  RecordUpdateRequest,
  AuditLog,
  ThreatStatus,
  AttackSimulationRequest,
  ReAuthRequest,
  User
} from "../types";

const API_BASE_URL = "https://fastapi-ecc-aes-api-674a.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to extract a readable error message
export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // Handle FastAPI validation error list
      return detail.map(d => `${d.loc.join(".")}: ${d.msg}`).join("; ");
    }
    return JSON.stringify(detail);
  }

  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  
  return "An unexpected error occurred.";
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const message = "Cannot connect to server. Check your connection or VPN.";
      console.error("Network error:", error);
      return Promise.reject(new Error(message));
    }

    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data);

    if (status === 401) {
      // If it's just a failed re-authentication (secondary password check), don't log out.
      // The individual component should handle this error.
      if (data?.detail === "Re-authentication failed" || data?.detail === "Invalid medical credentials") {
        return Promise.reject(error);
      }

      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      window.location.href = "/access-denied";
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (credentials: LoginCredentials) => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username.trim());
    formData.append("password", credentials.password.trim());
    formData.append("grant_type", "password");
    formData.append("scope", "");
    
    const response = await api.post<LoginResponse>("/token", formData, {
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
    });
    return response.data;
  },

  ping: () => api.get("/ping"),

  // Users
  getUsers: () => api.get<User[]>("/users"),
  createUser: (data: any, reauth: ReAuthRequest) => 
    api.post<User>("/users/create", { 
      username: data.username.trim(),
      password: data.password.trim(),
      role: data.role,
      reauth_password: reauth.reauth_password.trim() 
    }),

  // Records
  getRecords: () => api.get<RecordMetadata[]>("/records"),
  getPatients: () => api.get("/patients"),
  
  createRecord: (data: RecordCreateRequest) => 
    api.post<RecordMetadata>("/records/create", data),

  getRecordFull: (id: number, reauth: ReAuthRequest) => 
    api.post<RecordFull>(`/records/${id}`, { reauth_password: reauth.reauth_password }),

  getRecordDetail: (id: number, reauth: ReAuthRequest) => 
    api.post<RecordFull>(`/records/${id}`, { reauth_password: reauth.reauth_password }),

  updateRecord: (id: number, data: RecordUpdateRequest, reauth: ReAuthRequest) => 
    api.put(`/records/${id}`, { 
      plaintext: data.plaintext,
      note: data.note, 
      reauth_password: reauth.reauth_password 
    }),

  deleteRecord: (id: number, reauth: ReAuthRequest) => 
    api.delete(`/records/${id}`, { 
      data: { reauth_password: reauth.reauth_password } 
    }),

  // Specialized Record Access
  addVitals: (id: number, data: any) => 
    api.post(`/records/${id}/vitals`, data),
  
  getVitalsHistory: (id: number) => 
    api.get(`/records/${id}/vitals/history`),

  addLabResult: (id: number, data: any) => 
    api.post(`/records/${id}/lab-results`, data),

  getLabResults: (id: number) => 
    api.get(`/records/${id}/lab-results`),

  getPendingLabTests: () => 
    api.get("/lab/pending-tests"),

  // Keys
  getServerPubKey: () => api.get("/keys/server_pub"),
  rotateKeys: (reauth: ReAuthRequest) => 
    api.post("/keys/rotate", { password: reauth.reauth_password }),

  // Audit & Security
  getAuditLogs: () => api.get<AuditLog[]>("/audit_logs"),
  getThreatStatus: () => api.get<ThreatStatus>("/security/threat-status"),
  simulateAttack: (data: AttackSimulationRequest, reauth: ReAuthRequest) => 
    api.post("/security/simulate-attack", { 
      attack_type: data.attack_type,
      target_record_id: data.target_record_id,
      reauth_password: reauth.reauth_password 
    }),
};

export default api;
