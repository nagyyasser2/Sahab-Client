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
    const refreshToken = localStorage.getItem("refresh_token");

    // If no refresh token exists, just clear local storage and return
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return;
    }

    try {
      // Set a timeout to prevent hanging if API is slow
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("Logout request timeout")), 5000);
      });

      // Create the actual API request
      const apiPromise = axiosInstance.post("/auth/logout", {
        refresh_token: refreshToken,
      });

      // Race between the timeout and the API call
      await Promise.race([timeoutPromise, apiPromise]);
    } catch (error) {
      console.warn(
        "Logout API call failed, but proceeding with local logout:",
        error
      );
      // Continue with logout process regardless of API success
    } finally {
      // Always clear local storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> => {
    try {
      // Set a timeout to prevent hanging if API is slow
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Token refresh request timeout")),
          5000
        );
      });

      // Create the actual API request
      const apiPromise = axiosInstance.post<RefreshTokenResponse>(
        "/auth/refresh-token",
        { refresh_token: refreshToken }
      );

      // Race between the timeout and the API call
      const response = (await Promise.race([
        timeoutPromise,
        apiPromise,
      ])) as unknown as typeof apiPromise;

      return (await response).data.tokens;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear stored tokens on refresh failure
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Helper method to check if user is logged in
  isLoggedIn: (): boolean => {
    return Boolean(
      localStorage.getItem("access_token") &&
        localStorage.getItem("refresh_token")
    );
  },

  // Helper method to get current user data
  getCurrentUser: (): any => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        return null;
      }
    }
    return null;
  },
};
