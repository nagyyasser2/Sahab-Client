import React from "react";
import MessageSkeleton from "./MessageSkeleton";

interface LoadingMoreSkeletonProps {
  messageCount?: number;
}

const LoadingMoreSkeleton: React.FC<LoadingMoreSkeletonProps> = ({
  messageCount = 3,
}) => {
  // Generate a few skeleton messages for "load more" scenarios
  const generateLoadMorePattern = () => {
    const patterns = [
      { isMyMessage: true, variant: "medium" as const },
      { isMyMessage: false, variant: "long" as const },
      { isMyMessage: false, variant: "short" as const },
    ];

    return Array.from({ length: messageCount }, (_, index) => ({
      id: `load-more-${index}`,
      ...patterns[index % patterns.length],
      delay: index * 0.1,
    }));
  };

  const skeletonMessages = generateLoadMorePattern();

  return (
    <div className="space-y-4 py-2">
      {/* Loading indicator at top */}
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading more messages...</span>
        </div>
      </div>

      {/* Skeleton messages */}
      {skeletonMessages.map((skeleton) => (
        <div
          key={skeleton.id}
          className="animate-slide-down-fade"
          style={{
            animationDelay: `${skeleton.delay}s`,
            animationFillMode: "both",
          }}
        >
          <MessageSkeleton
            isMyMessage={skeleton.isMyMessage}
            variant={skeleton.variant}
          />
        </div>
      ))}
    </div>
  );
};

export default LoadingMoreSkeleton;
