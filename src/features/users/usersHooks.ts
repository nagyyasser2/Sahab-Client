import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../auth/authTypes";
import { usersApi } from "../../api/endpoints/usersApi";

/**
 * Hook for updating a user's profile picture
 * @param options - Optional configuration including callbacks
 * @returns Mutation for updating profile picture
 */
export const useUpdateProfilePicture = (options?: {
  onSuccess?: (user: User) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Pass the file and userId to the API function
    mutationFn: ({ file }: { file: File }) =>
      usersApi.updateProfilePicture(file),
    onSuccess: (updatedUser: User) => {
      // Update the user in the query cache
      queryClient.setQueryData(["user"], (oldUser: User | undefined) => {
        if (!oldUser) return updatedUser;
        return { ...oldUser, profilePic: updatedUser.profilePic };
      });

      // Also update the user in localStorage if that's where you're storing it
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...parsedUser, profilePic: updatedUser.profilePic })
        );
      }

      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(updatedUser);
      }
    },
  });
};

/**
 * Hook for updating user profile data
 * @param options - Optional configuration including callbacks
 * @returns Mutation for updating user profile
 */
export const useUpdateUserProfile = (options?: {
  onSuccess?: (user: User) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData }: { userData: Partial<User> }) =>
      usersApi.updateUserProfile(userData),
    onSuccess: (updatedUser: User) => {
      // Update the user in the query cache
      queryClient.setQueryData(["user"], updatedUser);

      // Also update the user in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(updatedUser);
      }
    },
  });
};
