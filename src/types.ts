/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User & Auth
export type UserRole = "admin" | "doctor" | "nurse" | "lab";

export interface User {
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;
  role: UserRole;
  exp: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ReAuthRequest {
  password: string;
}

// Records (Server-side encrypted)
export interface RecordMetadata {
  id: number;
  created_at: string;
  note: string | null;
}

export interface RecordFull extends RecordMetadata {
  client_pubkey: string;
  plaintext: string;  // Decrypted patient data (JSON string)
}

export interface PatientData {
  patient_name: string;
  age: number;
  bio_data?: {
    blood_type?: string;
    allergies?: string;
  };
  diagnosis?: string;
  doctor_notes?: string;
  vitals?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    spo2?: number;
    weight?: string;
    height?: string;
    pain_score?: number;
    nurse_notes?: string;
    history?: {
      timestamp: string;
      blood_pressure?: string;
      heart_rate?: number;
      temperature?: number;
      respiratory_rate?: number;
      spo2?: number;
    }[];
  };
  lab_tests?: {
    requested?: string[];
    results?: Record<string, {
      value: string;
      unit: string;
      reference_range: string;
      status: "normal" | "abnormal" | "critical";
      comments?: string;
      completed_at: string;
      technician_id: string;
    }>;
  };
}

export interface RecordCreateRequest {
  plaintext: string;  // JSON string: { patient_name, age, bio_data, diagnosis, vitals, lab_tests, doctor_notes }
  note?: string;
}

export interface RecordUpdateRequest {
  note?: string;
}

// Audit
export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  target_id: string | null;
  details: string | null;
}

// Security
export interface ThreatStatus {
  status: string;
  model_status: string;
  total_blocked_attempts: number;
  last_attack_detected: string | null;
  active_threats_last_hour: string[];
  recent_blocked_attempts: BlockedAttempt[];
}

export interface BlockedAttempt {
  id: string; // Added for UI keying
  timestamp: string;
  attack_type: string;
  attacker_info: string;
  details: string;
  simulated: boolean;
  blocked_by: string;
}

export interface AttackSimulationRequest {
  attack_type: "unauthorized_file_access" | "privilege_escalation" | "data_exfiltration" | "injection" | "brute_force";
  target_record_id?: number;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}
