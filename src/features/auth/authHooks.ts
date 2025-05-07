import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/endpoints/authApi";
import type { User } from "./authTypes";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update user in query cache
      queryClient.setQueryData(["user"], data.user);

      // Redirect to home page
      navigate("/");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update user in query cache
      queryClient.setQueryData(["user"], data.user);

      // Redirect to home page
      navigate("/");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear user from query cache
      queryClient.removeQueries({ queryKey: ["user"] });

      // Redirect to login page
      navigate("/auth");
    },
  });
};

export const useCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};
