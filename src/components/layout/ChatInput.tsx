import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../store/slices/messageSlice";
import { emitSocketAction } from "../../store/middleware/socketMiddleware";
import { SOCKET_ACTIONS } from "../../api/socket";
import type { ParticipantUser } from "../../types";

type ChatInputProps = {
  currentChat: {
    _id: string;
    otherParticipant: ParticipantUser;
  };
};

const ChatInput = ({ currentChat }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<any>(null);
  const dispatch = useDispatch();
  const selectedUser = useSelector((state: any) => state.users.selectedUser);

  // Handle sending messages
  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (message.trim() === "") return;

    // Dispatch the sendMessage action
    dispatch(
      sendMessage({
        chatId: currentChat._id,
        content: { text: message },
        receiverId: selectedUser._id,
      }) as any
    );

    // Clear the input
    setMessage("");

    // Reset typing status
    handleStopTyping();
  };

  // Handle key press events (e.g., Enter to send)
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing status - simplified to only send chatId and isTyping
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      dispatch(
        emitSocketAction(SOCKET_ACTIONS.TYPING, {
          chatId: currentChat._id,
          receiverId: currentChat.otherParticipant._id,
          isTyping: true,
        }) as any
      );
      console.log("fuck");
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(handleStopTyping, 2000);
    setTypingTimeout(timeout);
  };

  // Stop typing indicator - simplified to only send chatId and isTyping
  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      dispatch(
        emitSocketAction(SOCKET_ACTIONS.TYPING, {
          chatId: currentChat._id,
          receiverId: currentChat.otherParticipant._id,
          isTyping: false,
        }) as any
      );
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  return (
    <footer className="h-15 p-2 bg-white">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          onBlur={handleStopTyping}
          placeholder="Message..."
          className="flex-1 p-2 pl-4 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-full ${
            message.trim()
              ? "bg-blue-400 text-white hover:bg-blue-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;
