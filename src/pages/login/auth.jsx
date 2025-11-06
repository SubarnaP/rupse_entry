// auth.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://rupse_crm_backend.poudelanish17.com.np/api";

// ✅ Auth Service
export const AuthService = {
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Invalid credentials");

    const token = (data.token || "").trim();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout() {
    localStorage.clear();
    window.location.href = "/login";
  },

  getToken() {
    return (localStorage.getItem("token") || "").trim();
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  },

  isAuthenticated() {
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
  async request(endpoint, { method = "POST", body, isUpload = false } = {}) {
    const token = AuthService.getToken();
    const headers = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (!isUpload) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      method,
      headers,
      body: isUpload ? body : JSON.stringify(body),
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

  get: (url) => apiService.request(url, { method: "GET" }),
  post: (url, data) => apiService.request(url, { method: "POST", body: data }),
  put: (url, data) => apiService.request(url, { method: "PUT", body: data }),
  delete: (url) => apiService.request(url, { method: "DELETE" }),
  upload: (url, formData) =>
    apiService.request(url, { method: "POST", body: formData, isUpload: true }),
};

// ✅ Protect routes
export const useAuthGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);
};

export default apiService;