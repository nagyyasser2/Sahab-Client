import React from "react";

interface MessageSkeletonProps {
  isMyMessage?: boolean;
  variant?: "short" | "medium" | "long";
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isMyMessage = false,
  variant = "medium",
}) => {
  const getMessageWidth = () => {
    switch (variant) {
      case "short":
        return "w-24";
      case "medium":
        return "w-40";
      case "long":
        return "w-56";
      default:
        return "w-40";
    }
  };

  const getTextLines = () => {
    switch (variant) {
      case "short":
        return 1;
      case "medium":
        return 2;
      case "long":
        return 3;
      default:
        return 2;
    }
  };

  return (
    <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-sm px-4 py-2 rounded-xl shadow ${getMessageWidth()} ${
          isMyMessage
            ? "bg-blue-100 rounded-br-none"
            : "bg-gray-100 rounded-bl-none"
        }`}
      >
        {/* Message content skeleton */}
        <div className="space-y-2">
          {Array.from({ length: getTextLines() }).map((_, index) => (
            <div
              key={index}
              className={`h-4 bg-gray-200 rounded animate-pulse ${
                index === getTextLines() - 1 && getTextLines() > 1
                  ? "w-3/4" // Last line is shorter
                  : "w-full"
              }`}
            />
          ))}
        </div>

        {/* Timestamp skeleton */}
        <div className="flex justify-end mt-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
