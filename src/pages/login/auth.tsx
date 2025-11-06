// auth.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://rupse_crm_backend.poudelanish17.com.np/api";

interface LoginResponse {
  token?: string;
  message?: string;
  [key: string]: unknown;
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  isUpload?: boolean;
}

interface ApiResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

// ✅ Auth Service
export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Invalid credentials");

    const token = (data.token || "").trim();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout(): void {
    localStorage.clear();
    window.location.href = "/login";
  },

  getToken(): string {
    return (localStorage.getItem("token") || "").trim();
  },

  getUser(): Record<string, unknown> {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      // If token parsing fails, just check if token exists
      return !!token;
    }
  },
};

// ✅ API Service using fetch (no axios dependency)
export const apiService = {
  async request(endpoint: string, { method = "POST", body, isUpload = false }: ApiRequestOptions = {}): Promise<ApiResponse> {
    const token = AuthService.getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (!isUpload) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      method,
      headers,
      body: isUpload ? (body as BodyInit) : JSON.stringify(body),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 403) {
      AuthService.logout();
      throw new Error("Session expired. Please login again.");
    }

    console.log("API Response Status:", response.status);

    // Return response with additional methods for consistency
    return {
      ok: response.ok,
      status: response.status,
      json: async () => {
        try {
          return await response.json();
        } catch {
          return {};
        }
      },
      text: async () => await response.text(),
    };
  },

  get: (url: string) => apiService.request(url, { method: "GET" }),
  post: (url: string, data: unknown) => apiService.request(url, { method: "POST", body: data }),
  put: (url: string, data: unknown) => apiService.request(url, { method: "PUT", body: data }),
  delete: (url: string) => apiService.request(url, { method: "DELETE" }),
  upload: (url: string, formData: FormData) =>
    apiService.request(url, { method: "POST", body: formData, isUpload: true }),
};

// ✅ Protect routes
export const useAuthGuard = (): void => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);
};

export default apiService;
