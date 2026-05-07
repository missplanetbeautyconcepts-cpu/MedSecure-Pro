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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error: Cannot connect to server. Check your connection.");
      // You might want to handle this with a toast, but since this is the service, 
      // we'll just log and let the UI handle it via catch blocks or query error states.
      return Promise.reject(new Error("Network error: Cannot connect to server. Check your connection."));
    }

    const { status } = error.response;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } else if (status === 403) {
      window.location.href = "/access-denied";
    } else if (status === 500) {
      console.error("A server error occurred. Please try again or contact admin.");
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (credentials: LoginCredentials) => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);
    const response = await api.post<LoginResponse>("/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },

  ping: () => api.get("/ping"),

  // Users
  getUsers: () => api.get<User[]>("/users"),
  createUser: (data: any, reauth: ReAuthRequest) => 
    api.post("/users/create", { ...data, ...reauth }),

  // Records
  getRecords: () => api.get<RecordMetadata[]>("/records"),
  
  createRecord: (data: RecordCreateRequest) => 
    api.post<RecordMetadata>("/records/create", data),

  getRecordFull: (id: number, reauth: ReAuthRequest) => 
    api.post<RecordFull>(`/records/${id}`, reauth),

  getRecordDetail: (id: number, reauth: ReAuthRequest) => 
    api.post<RecordFull>(`/records/${id}`, reauth),

  updateRecord: (id: number, data: RecordUpdateRequest, reauth: ReAuthRequest) => 
    api.put(`/records/${id}`, { ...data, ...reauth }),

  deleteRecord: (id: number, reauth: ReAuthRequest) => 
    api.delete(`/records/${id}`, { data: reauth }),

  // Keys
  getServerPubKey: () => api.get("/keys/server_pub"),
  rotateKeys: (reauth: ReAuthRequest) => api.post("/keys/rotate", reauth),

  // Audit & Security
  getAuditLogs: () => api.get<AuditLog[]>("/audit_logs"),
  getThreatStatus: () => api.get<ThreatStatus>("/security/threat-status"),
  simulateAttack: (data: AttackSimulationRequest, reauth: ReAuthRequest) => 
    api.post("/security/simulate-attack", { ...data, ...reauth }),
};

export default api;
