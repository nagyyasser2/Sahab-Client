import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from "../../features/auth/authTypes";
import axiosInstance from "../axiosInstance";

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Ensure username has @ prefix
    const formattedData = {
      ...data,
      username: data.username.startsWith("@")
        ? data.username
        : `@${data.username}`,
    };

    const response = await axiosInstance.post<AuthResponse>(
      "/auth/signup",
      formattedData
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/signin",
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/auth/logout", {
          refresh_token: refreshToken,
        });
      }
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/auth/refresh-token",
      {
        refresh_token: refreshToken,
      }
    );
    return response.data.tokens;
  },
};
