import { useSelector } from "react-redux";
import { selectIsTyping } from "../../../store/slices/messageSlice";
import type { RootState } from "../../../types";

interface TypingIndicatorProps {
  chatId: string;
  className?: string;
  chat: any;
  isHeader: boolean;
}

const TypingIndicator = ({
  chatId,
  className = "",
  chat,
  isHeader,
}: TypingIndicatorProps) => {
  const isTyping = useSelector((state: RootState) =>
    selectIsTyping(state, chatId)
  );

  return (
    <span className={`flex items-center space-x-1 h-4 ${className}`}>
      {isTyping ? (
        <>
          <span className="text-xs text-blue-500 font-medium"></span>
          <div className="flex space-x-1 items-center">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </>
      ) : (
        !isHeader && (
          <span className="text-xs text-gray-500 truncate max-w-[160px] leading-4">
            {chat?.lastMessage?.content?.text || "No messages yet"}
          </span>
        )
      )}
    </span>
  );
};

export default TypingIndicator;
