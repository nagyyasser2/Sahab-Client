import io from "socket.io-client";

// Initialize socket connection
const socket = io("http://localhost:3000/chat", {
  autoConnect: false,
  reconnection: true,
});

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  NEW_MESSAGE: "new_message",
  MESSAGE_READ: "message_read",
  USER_TYPING: "user_typing",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  JOIN_CHAT: "join_chat",
  LEAVE_CHAT: "leave_chat",
};

// Socket actions
export const SOCKET_ACTIONS = {
  SEND_MESSAGE: "send_message",
  MARK_READ: "mark_read",
  TYPING: "typing",
  JOIN_CHAT: "join_chat",
  LEAVE_CHAT: "leave_chat",
};

export default socket;
