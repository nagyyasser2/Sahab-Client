import type { User } from "../../features/auth/authTypes";
import axiosInstance from "../axiosInstance";

export const usersApi = {
  /**
   * Update user profile picture
   * @param userId - The ID of the user
   * @param file - The profile picture file to upload
   * @returns Promise with updated user data
   */
  updateProfilePicture: async (file: File): Promise<User> => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("profilePic", file);

    const response = await axiosInstance.put<User>(
      `/users/profile-pic`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Update user profile data
   * @param userId - The ID of the user
   * @param userData - The user data to update
   * @returns Promise with updated user data
   */
  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await axiosInstance.patch<User>(`/users`, userData);

    return response.data;
  },
};
