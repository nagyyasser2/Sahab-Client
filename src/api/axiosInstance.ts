import axios from "axios";
import type { RefreshTokenResponse } from "../features/auth/authTypes";

const API_BASE_URL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = "/auth";
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token } = response.data.tokens;

        // Update tokens in storage
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
