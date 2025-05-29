import { useSelector } from "react-redux";
import { selectIsTyping } from "../../../store/slices/messageSlice";
import type { RootState } from "../../../types";

interface TypingIndicatorProps {
  chatId: string;
  className?: string;
}

const TypingIndicator = ({ chatId, className = "" }: TypingIndicatorProps) => {
  const isTyping = useSelector((state: RootState) =>
    selectIsTyping(state, chatId)
  );

  if (!isTyping) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-xs text-blue-500 font-medium"></span>
      <div className="flex space-x-1">
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
    </div>
  );
};

export default TypingIndicator;
