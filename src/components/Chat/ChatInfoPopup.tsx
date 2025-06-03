import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiUser, FiPhone, FiGlobe, FiMessageCircle, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  blockUser,
  unblockUser,
  getBlockStatus,
  clearBlockingError,
} from "../../store/slices/chatSlice";
import ChatInfoSkeleton from "./ChatInfoSkeleton";

interface ChatInfoPopupProps {
  currentChat: any;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInfoPopup: React.FC<ChatInfoPopupProps> = ({
  currentChat,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { blockingStatus } = useSelector((state: any) => state.chats);
  const { loading: blockingLoading, error: blockingError } = blockingStatus;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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

  // Handle data loading simulation
  useEffect(() => {
    if (isOpen && currentChat?._id) {
      setIsDataLoaded(false);

      // Fetch block status
      dispatch(getBlockStatus(currentChat._id) as any);

      // Simulate loading time for smooth UX (minimum 800ms)
      const loadingTimer = setTimeout(() => {
        setIsDataLoaded(true);
      }, 800);

      return () => clearTimeout(loadingTimer);
    }
  }, [isOpen, currentChat?._id, dispatch]);

  // Reset loading state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setIsDataLoaded(false);
      dispatch(clearBlockingError());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // Show skeleton while data is loading
  if (!isDataLoaded) {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      console.error("Modal root not found");
      return null;
    }
    return createPortal(<ChatInfoSkeleton onClose={onClose} />, modalRoot);
  }

  const otherParticipant = currentChat?.otherParticipant;
  const blockStatus = currentChat?.blockStatus;
  const isBlockedByMe = blockStatus?.isBlockedByMe || false;
  const isBlockedByOther = blockStatus?.isBlockedByOther || false;

  const handleBlockUnblock = async () => {
    if (!currentChat?._id || !otherParticipant?._id) {
      console.error("Missing conversation or participant ID");
      return;
    }

    try {
      if (isBlockedByMe) {
        await dispatch(
          unblockUser({
            conversationId: currentChat._id,
            targetUserId: otherParticipant._id,
          }) as any
        ).unwrap();
      } else {
        await dispatch(
          blockUser({
            conversationId: currentChat._id,
            targetUserId: otherParticipant._id,
          }) as any
        ).unwrap();
      }

      // Close the popup after successful operation
      onClose();
    } catch (error) {
      console.error("Block/unblock error:", error);
      // The error will be displayed in the UI from the blockingError state
    }
  };

  // Dynamic button styling based on state
  const getButtonStyles = () => {
    if (blockingLoading) {
      // Loading state - colored backgrounds with white text
      return isBlockedByMe
        ? "bg-green-500 text-white hover:bg-green-600" // Unblocking - green bg, white text
        : "bg-red-500 text-white hover:bg-red-600"; // Blocking - red bg, white text
    } else {
      // Default state - white background with colored text
      return isBlockedByMe
        ? "bg-white text-green-600 border-2 border-green-600 hover:bg-green-50" // Unblock - white bg, green text
        : "bg-white text-red-600 border-2 border-red-600 hover:bg-red-50"; // Block - white bg, red text
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.4)] p-6 w-full max-w-md mx-4 transform transition-all relative animate-fade-in"
      >
        {/* Close button at top right of modal */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:bg-gray-50 border border-gray-200 cursor-pointer"
        >
          <FiX className="text-gray-600 text-lg" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Chat Information
        </h2>

        {/* Error Display */}
        {blockingError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-slide-down">
            {blockingError}
          </div>
        )}

        {/* Blocked Status Warning */}
        {isBlockedByOther && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg animate-slide-down">
            <span>⚠️ You have been blocked by this user</span>
          </div>
        )}

        {isBlockedByMe && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-slide-down">
            <span>🚫 You have blocked this user</span>
          </div>
        )}

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-100 animate-scale-in">
            {otherParticipant?.profilePic ? (
              <img
                src={otherParticipant.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold">
                {otherParticipant?.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="space-y-4 mb-6">
          <div
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <FiUser className="text-gray-600" size={18} />
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-gray-800 font-medium">
                {otherParticipant?.username || "Not provided"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <FiPhone className="text-gray-600" size={18} />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-gray-800 font-medium">
                {otherParticipant?.phoneNumber || "Not provided"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <FiGlobe className="text-gray-600" size={18} />
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="text-gray-800 font-medium">
                {otherParticipant?.country || "Not provided"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <FiMessageCircle className="text-gray-600" size={18} />
            <div>
              <p className="text-sm text-gray-500">Chat Created</p>
              <p className="text-gray-800 font-medium">
                {currentChat?.createdAt
                  ? new Date(currentChat.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBlockUnblock}
            disabled={blockingLoading || isBlockedByOther}
            className={`w-full px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-medium animate-slide-up ${getButtonStyles()} ${
              (blockingLoading || isBlockedByOther) &&
              "opacity-50 cursor-not-allowed"
            }`}
            style={{ animationDelay: "0.5s" }}
          >
            {blockingLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isBlockedByMe ? "Unblocking..." : "Blocking..."}</span>
              </>
            ) : (
              <>
                <span>{isBlockedByMe ? "✅" : "🚫"}</span>
                {isBlockedByMe ? "Unblock User" : "Block User"}
              </>
            )}
          </button>
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

export default ChatInfoPopup;
