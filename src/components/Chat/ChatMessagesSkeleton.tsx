import React from "react";
import MessageSkeleton from "./MessageSkeleton";

interface ChatMessagesSkeletonProps {
  messageCount?: number;
}

const ChatMessagesSkeleton: React.FC<ChatMessagesSkeletonProps> = ({
  messageCount = 8,
}) => {
  // Create a realistic pattern of messages (mix of sent/received with different lengths)
  const generateMessagePattern = () => {
    const patterns = [
      { isMyMessage: false, variant: "medium" as const },
      { isMyMessage: true, variant: "short" as const },
      { isMyMessage: false, variant: "long" as const },
      { isMyMessage: true, variant: "medium" as const },
      { isMyMessage: false, variant: "short" as const },
      { isMyMessage: true, variant: "long" as const },
      { isMyMessage: false, variant: "medium" as const },
      { isMyMessage: true, variant: "short" as const },
    ];

    return Array.from({ length: messageCount }, (_, index) => ({
      id: index,
      ...patterns[index % patterns.length],
      delay: index * 0.1, // Staggered animation delay
    }));
  };

  const messageSkeletons = generateMessagePattern();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {messageSkeletons.map((skeleton) => (
            <div
              key={skeleton.id}
              className="animate-fade-in-up"
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
      </div>
    </div>
  );
};

export default ChatMessagesSkeleton;
