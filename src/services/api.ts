import axios, { AxiosError, AxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/auth";
import { ApiError, AuthResponse } from "../types";

const API_URL = "https://yakubu.pythonanywhere.com/";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add token for auth endpoints
    if (
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register")
    ) {
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // Skip token refresh for login/register endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post<AuthResponse>(
          `${API_URL}/api/super/v1/auth/refresh/`,
          { refresh: refreshToken },
        );
        const { access, refresh } = response.data;
        setTokens(access, refresh);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Format error for consistent handling
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      details: error.response?.data?.details || {},
    };
    return Promise.reject(apiError);
  },
);

export default api;
