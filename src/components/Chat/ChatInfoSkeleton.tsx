import React from "react";
import { FiX } from "react-icons/fi";

interface ChatInfoSkeletonProps {
  onClose: () => void;
}

const ChatInfoSkeleton: React.FC<ChatInfoSkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.4)] p-6 w-full max-w-md mx-4 transform transition-all relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:bg-gray-50 border border-gray-200 cursor-pointer"
        >
          <FiX className="text-gray-600 text-lg" />
        </button>

        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded-md w-40 mb-4 animate-pulse"></div>

        {/* Profile Section Skeleton */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse shadow-md border-2 border-gray-100"></div>
        </div>

        {/* Information Section Skeleton */}
        <div className="space-y-4 mb-6">
          {/* Username skeleton */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          {/* Phone skeleton */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Country skeleton */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          {/* Chat Created skeleton */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-18 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="space-y-3">
          <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfoSkeleton;
