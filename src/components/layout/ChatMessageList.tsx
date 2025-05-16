import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  selectMessagesByChatId,
} from "../../store/slices/messageSlice";
import { emitSocketAction } from "../../store/middleware/socketMiddleware";
import { SOCKET_ACTIONS } from "../../api/socket";
import type { RootState } from "../../store";
import { MessageStatus, type Message } from "../../types";

type ChatMessageListProps = {
  currentChat: any;
  currentUser: {
    _id: string;
  };
};

const ChatMessageList = ({
  currentChat,
  currentUser,
}: ChatMessageListProps) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages from Redux store
  const messages = useSelector((state: RootState) =>
    selectMessagesByChatId(state, currentChat._id)
  );

  const [isLoading, setIsLoading] = useState(true);

  // Fetch messages when the chat changes
  useEffect(() => {
    if (currentChat._id) {
      setIsLoading(true);
      dispatch(
        fetchMessages({
          chatId: currentChat._id,
          receiverId: currentChat.otherParticipant?._id,
        }) as any
      )
        .unwrap()
        .then(() => {
          setIsLoading(false);
          // Join the chat room via socket
          dispatch(
            emitSocketAction(SOCKET_ACTIONS.JOIN_CHAT, {
              chatId: currentChat._id,
            }) as any
          );
        })
        .catch((error: any) => {
          console.error("Failed to fetch messages:", error);
          setIsLoading(false);
        });

      // When component unmounts or chat changes, leave the chat room
      return () => {
        dispatch(
          emitSocketAction(SOCKET_ACTIONS.LEAVE_CHAT, {
            chatId: currentChat._id,
          }) as any
        );
      };
    }
  }, [currentChat._id, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (messages.length && currentChat._id) {
      const unreadMessages = messages.filter(
        (message: Message) =>
          message.senderId !== currentUser._id &&
          message.status !== MessageStatus.Seen
      );

      unreadMessages.forEach((message: Message) => {
        dispatch(
          emitSocketAction(SOCKET_ACTIONS.MARK_READ, {
            chatId: currentChat._id,
            messageId: message._id,
            userId: currentUser._id,
          }) as any
        );
      });
    }
  }, [messages, currentChat._id, currentUser._id, dispatch]);

  // Format timestamp to display in a readable format
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Chat header */}

      {/* Messages area */}
      <div className="flex-1 p-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message, index: any) => {
              const isMyMessage = message.senderId === currentUser._id;

              return (
                <div
                  key={index}
                  className={`flex ${
                    isMyMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-xl shadow ${
                      isMyMessage
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm">{message.content.text}</div>
                    <div
                      className={`text-xs mt-1 text-right ${
                        isMyMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                      {message.status === MessageStatus.Seen && isMyMessage && (
                        <span className="ml-1">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
