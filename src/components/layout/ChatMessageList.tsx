import { useState, useEffect } from "react";

type ChatMessageListProps = {
  currentChat: any;
};

const ChatMessageList = ({ currentChat }: ChatMessageListProps) => {
  const user = { _id: "1" }; // Simulating useCurrentUser() to identify "my" messages

  // In a real application, you'd fetch messages from your API or state
  const [messages, setMessages] = useState([
    {
      _id: "1",
      conversationId: "2",
      senderId: "2", // Not the current user
      content: {
        text: "Hey, how are you doing today?",
      },
      type: "text",
      status: 3,
      isDeleted: false,
      editedAt: null,
      reactions: [],
      timestamp: "2025-04-29T10:26:05.881Z",
      createdAt: "2025-04-29T10:26:05.884Z",
      updatedAt: "2025-04-29T13:29:11.034Z",
    },
    {
      _id: "2",
      conversationId: "2",
      senderId: "1", // Current user
      content: {
        text: "I'm doing great! Just working on this new chat interface. What about you?",
      },
      type: "text",
      status: 3,
      isDeleted: false,
      editedAt: null,
      reactions: [],
      timestamp: "2025-04-29T10:27:15.881Z",
      createdAt: "2025-04-29T10:27:15.884Z",
      updatedAt: "2025-04-29T13:29:11.034Z",
    },
    {
      _id: "3",
      conversationId: "2",
      senderId: "2", // Not the current user
      content: {
        text: "That sounds interesting! I'd love to see it when it's done.",
      },
      type: "text",
      status: 3,
      isDeleted: false,
      editedAt: null,
      reactions: [],
      timestamp: "2025-04-29T10:28:25.881Z",
      createdAt: "2025-04-29T10:28:25.884Z",
      updatedAt: "2025-04-29T13:29:11.034Z",
    },
    {
      _id: "4",
      conversationId: "2",
      senderId: "1", // Current user
      content: {
        text: "I'll definitely share it with you! It uses Tailwind CSS for styling.",
      },
      type: "text",
      status: 3,
      isDeleted: false,
      editedAt: null,
      reactions: [],
      timestamp: "2025-04-29T10:29:35.881Z",
      createdAt: "2025-04-29T10:29:35.884Z",
      updatedAt: "2025-04-29T13:29:11.034Z",
    },
    {
      _id: "4",
      conversationId: "2",
      senderId: "1", // Current user
      content: {
        text: "Hi.",
      },
      type: "text",
      status: 3,
      isDeleted: false,
      editedAt: null,
      reactions: [],
      timestamp: "2025-04-29T10:29:35.881Z",
      createdAt: "2025-04-29T10:29:35.884Z",
      updatedAt: "2025-04-29T13:29:11.034Z",
    },
  ]);

  // Format timestamp to display in a readable format
  const formatTime = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 overflow-y-auto">
      <div className="flex-1 space-y-4">
        {messages.map((message) => {
          const isMyMessage = message.senderId === user._id;

          return (
            <div
              key={message._id}
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
                  {formatTime(message.timestamp)}
                  {message.status === 3 && isMyMessage && (
                    <span className="ml-1">✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatMessageList;
