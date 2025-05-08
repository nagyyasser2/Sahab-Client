import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../features/auth/authTypes";
import { FiLogOut, FiChevronDown, FiChevronUp, FiEdit } from "react-icons/fi";
import ConfirmationModal from "../common/ConfirmationModal";
import Spinner from "../common/Spinner";
import { authApi } from "../../api/endpoints/authApi";
import logoUrl from "../../../public/test2.svg";
import EditUserProfile from "./EditUserProfile";
import OnlineStatus from "../OnlineStatus";
import { IoLocationOutline } from "react-icons/io5";
import { BiMobileAlt } from "react-icons/bi";

interface UserProfileProps {
  user: User | null;
  onLogoutSuccess?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogoutSuccess }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleOpenModal = useCallback(() => {
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isLoggingOut) {
      setIsModalOpen(false);
    }
  }, [isLoggingOut]);

  const handleOpenEditProfile = useCallback(() => {
    setIsEditProfileOpen(true);
  }, []);

  const handleCloseEditProfile = useCallback(() => {
    setIsEditProfileOpen(false);
  }, []);

  const handleSaveProfile = useCallback(async (userData: any) => {
    // Here you would implement the API call to update the user profile
    // For example:
    // await userApi.updateProfile(userData);

    // Close the modal after successful update
    setIsEditProfileOpen(false);
  }, []);

  const handleUpdateProfilePicture = useCallback(async (file: File) => {
    // Here you would implement the API call to update just the profile picture
    // For example:
    // const formData = new FormData();
    // formData.append('profilePic', file);
    // await userApi.updateProfilePicture(formData);

    console.log("Updating profile picture:", file.name);
    // You might want to update the user state here to reflect the new picture
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setError(null);

    try {
      // Add a small delay to ensure token state is consistent
      await new Promise((resolve) => setTimeout(resolve, 100));

      await authApi.logout();

      // Clear tokens and user data locally regardless of API response
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Call the optional callback if provided
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }

      // Short delay before navigation to ensure state updates complete
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  }, [navigate, isLoggingOut, onLogoutSuccess]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-36">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="relative bg-white shadow-sm">
      {/* Menu button */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between px-2 py-2 text-gray-600 bg-gray-100 hover:bg-gray-150 cursor-pointer transition-all duration-200"
        aria-label="Toggle profile menu"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-0">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-32 h-10 object-contain" // Set width with w-32 (128px)
          />
          <OnlineStatus />
        </div>
        <div className="transform transition-transform duration-300 ease-in-out">
          {isExpanded ? (
            <FiChevronUp className="text-3xl" />
          ) : (
            <FiChevronDown className="text-3xl" />
          )}
        </div>
      </button>

      {/* Expanded profile content */}
      {isExpanded && (
        <div className="flex flex-col items-center text-center p-6 bg-white border-t border-gray-100">
          {/* Profile Picture */}
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-100">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={`${user.username}'s profile`}
                className="w-full h-full object-cover border-3 border-blue-800 shadow-md shadow-blue-700 rounded-full"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const nextElement = img.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = "flex";
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div
              className="w-full h-full items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold"
              style={{ display: "none" }}
            >
              {user.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>

          {/* User Info */}
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            {user.username}
          </h2>
          {user.phoneNumber && (
            <div className="flex items-center">
              <BiMobileAlt />
              <p className="text-sm text-gray-500 mt-1">{user.phoneNumber}</p>
            </div>
          )}
          {user.country && (
            <div className="flex items-center">
              <IoLocationOutline />
              <p className="text-sm text-gray-500">{user.country}</p>
            </div>
          )}
          <button
            onClick={handleOpenEditProfile}
            className="mt-2 cursor-pointer flex items-center gap-2 hover:text-gray-500 transition-all duration-200"
          >
            <FiEdit />
            <span>Edit</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleOpenModal}
            className="mt-1 flex items-center justify-center gap-2  bg-white px-4 py-2 rounded-md cursor-pointer transition-all duration-200 w-full max-w-xs hover:text-gray-500"
            disabled={isLoggingOut}
            aria-label="Logout"
          >
            {isLoggingOut ? (
              <Spinner size="sm" color="secondary" />
            ) : (
              <>
                <FiLogOut className="text-md" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Logout Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Logout"
        message={error || "Are you sure you want to logout?"}
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={handleCloseModal}
        isLoading={isLoggingOut}
      />

      {/* Edit Profile Modal */}
      {user && (
        <EditUserProfile
          user={user}
          isOpen={isEditProfileOpen}
          // onSave={handleSaveProfile}
          onCancel={handleCloseEditProfile}
          // onUpdatePicture={handleUpdateProfilePicture}
        />
      )}
    </div>
  );
};

export default UserProfile;
