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

// API services
export const chatService = {
  getChats: ({
    skip = 0,
    limit = 10,
    includeArchived = false,
  }: {
    skip?: number;
    limit?: number;
    includeArchived?: boolean;
  }) =>
    axiosInstance.get("/chats", {
      params: {
        skip,
        limit,
        includeArchived,
      },
    }),

  getChatById: (id: string) => axiosInstance.get(`/chats/${id}`),
  createChat: (data: any) => axiosInstance.post("/chats", data),
  updateChat: (id: string, data: any) =>
    axiosInstance.put(`/chats/${id}`, data),
  deleteChat: (id: string) => axiosInstance.delete(`/chats/${id}`),
};

export const messageService = {
  getMessages: (chatId: any, receiverId: any) =>
    axiosInstance.get(`/chats/${chatId}/messages/${receiverId}`),
  sendMessage: (data: any) => axiosInstance.post(`/chats/message`, data),
  updateMessage: (id: any, data: any) =>
    axiosInstance.put(`/messages/${id}`, data),
  deleteMessage: (id: any) => axiosInstance.delete(`/messages/${id}`),
};

export const authService = {
  login: (credentials: any) => axiosInstance.post("/auth/login", credentials),
  register: (userData: any) => axiosInstance.post("/auth/register", userData),
  logout: () => axiosInstance.post("/auth/logout"),
  getCurrentUser: () => axiosInstance.get("/auth/me"),
};

export const usersService = {
  getAllUsers: () => axiosInstance.get("/users"),
  getUserById: (id: any) => axiosInstance.get(`/users/${id}`),
  createUser: (data: any) => axiosInstance.post("/users", data),
  updateUser: (id: any, data: any) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id: any) => axiosInstance.delete(`/users/${id}`),

  // Updated searchUsers with pagination
  searchUsers: (
    q: string,
    field: "username" | "phoneNumber" | "country",
    fields?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const params: any = { q, field, page, limit };
    if (fields) params.fields = fields;
    return axiosInstance.get("/users/search", { params });
  },
};

export default axiosInstance;
