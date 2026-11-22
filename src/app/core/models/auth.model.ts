export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  businessName: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string;
}
