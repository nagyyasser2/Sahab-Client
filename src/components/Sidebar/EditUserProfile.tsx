import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { FormInput } from "../common/FormInput";
import { FormSelect } from "../common/FormSelect";
import { Button } from "../common/Button";
import { FiCamera, FiUpload } from "react-icons/fi";
import {
  usernameValidator,
  phoneNumberValidator,
  countryValidator,
} from "../../utils/validators";
import type { User } from "../../features/auth/authTypes";
import {
  useUpdateProfilePicture,
  useUpdateUserProfile,
} from "../../features/users/usersHooks";

interface EditUserProfileProps {
  user: User;
  isOpen: boolean;
  onCancel: () => void;
}

const COUNTRIES = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "Egypt", label: "Egypt" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "India", label: "India" },
  { value: "Italy", label: "Italy" },
  { value: "Japan", label: "Japan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Mexico", label: "Mexico" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Russia", label: "Russia" },
  { value: "United States", label: "United States" },
];

export const EditUserProfile: React.FC<EditUserProfileProps> = ({
  user,
  isOpen,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: {},
  } = useForm({
    defaultValues: {
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      country: user.country || "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(
    user.profilePic || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handler for page reload after successful operations
  const handleSuccess = () => {
    window.location.reload();
  };

  const updateProfileMutation = useUpdateUserProfile({
    onSuccess: handleSuccess,
  });

  const updatePictureMutation = useUpdateProfilePicture({
    onSuccess: handleSuccess,
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        isOpen &&
        !updateProfileMutation.isPending
      ) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel, updateProfileMutation.isPending]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen &&
        !updateProfileMutation.isPending
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onCancel, updateProfileMutation.isPending]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const onSubmit = async (formData: any) => {
    setError(null);
    try {
      await updateProfileMutation.mutateAsync({
        userData: formData,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update user. Please try again.");
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleUpdatePicture = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setError(null);
    try {
      await updatePictureMutation.mutateAsync({
        file,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update profile picture. Please try again.");
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.4)] p-6 w-full max-w-md mx-4 transform transition-all"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Edit Profile
        </h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex flex-col items-center mb-6">
          <div
            className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-100 cursor-pointer relative group"
            onClick={handlePictureClick}
          >
            {picturePreview ? (
              <img
                src={picturePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera className="text-white text-2xl" />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {fileInputRef.current?.files?.[0] && (
            <Button
              onClick={handleUpdatePicture}
              isLoading={updatePictureMutation.isPending}
              className="mt-1 bg-blue-300 flex items-center gap-2 cursor-pointer text-sm"
            >
              <FiUpload size={14} />
              Update
            </Button>
          )}

          <p className="text-xs text-gray-500 mt-1">
            Click on the image to change your profile picture
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <FormInput
            label="Username"
            {...register("username", usernameValidator)}
          />
          <FormInput
            label="Phone Number"
            {...register("phoneNumber", phoneNumberValidator)}
          />
          <FormSelect
            label="Country"
            options={COUNTRIES}
            {...register("country", countryValidator)}
          />
        </form>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleCancel}
            disabled={updateProfileMutation.isPending}
            className="bg-yellow-400 hover:bg-yellow-500 text-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            isLoading={updateProfileMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("Modal root not found");
    return null;
  }

  return createPortal(modalContent, modalRoot);
};

export default EditUserProfile;
