import io from "socket.io-client";

// Initialize socket connection
const socket = io("http://10.10.4.26:3000/chat", {
  autoConnect: false,
  reconnection: true,
});

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: "CONNECT",
  DISCONNECT: "DISCONNECT",
  ERROR: "ERROR",
  NEW_MESSAGE: "NEW_MESSAGE",
  MESSAGES_READ: "messages_read",
  USER_TYPING: "user_typing",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  JOIN_CHAT: "join_chat",
  LEAVE_CHAT: "leave_chat",
  RECEIVE_MESSAGE: "receive_message",
  TYPING: "typing",
  USER_STATUS_UPDATE: "user_status_update",
  USER_STATUS_CHECK: "user_status_check",
  NEW_CONVERSATION: "new_conversation",
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
