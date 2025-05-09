import { addMessage, markAsRead, setTyping } from "../slices/messageSlice";
import { updateUserStatus } from "../slices/chatSlice";
import socket, { SOCKET_ACTIONS, SOCKET_EVENTS } from "../../api/socket";

// Socket middleware to handle socket events and dispatch Redux actions
const socketMiddleware = () => {
  return (store: any) => {
    // Setup socket event listeners
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("Socket connected");
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("Socket disconnected");
    });

    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("Socket error:", error);
    });

    // Listen for incoming messages
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      store.dispatch(addMessage(message));
    });

    // Listen for message read events
    socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ chatId, messageId, userId }) => {
      store.dispatch(markAsRead({ chatId, messageId, userId }));
    });

    // Listen for typing events
    socket.on(SOCKET_EVENTS.USER_TYPING, ({ chatId, userId, isTyping }) => {
      store.dispatch(setTyping({ chatId, userId, isTyping }));
    });

    // Listen for user online/offline status
    socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
      store.dispatch(updateUserStatus({ userId, status: "online" }));
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, (userId) => {
      store.dispatch(updateUserStatus({ userId, status: "offline" }));
    });

    // The actual middleware
    return (next: any) => (action: any) => {
      // Check if action is a socket action
      if (action.socket) {
        const { event, data } = action.socket;

        switch (event) {
          case SOCKET_ACTIONS.SEND_MESSAGE:
            socket.emit(SOCKET_ACTIONS.SEND_MESSAGE, data);
            break;
          case SOCKET_ACTIONS.MARK_READ:
            socket.emit(SOCKET_ACTIONS.MARK_READ, data);
            break;
          case SOCKET_ACTIONS.TYPING:
            socket.emit(SOCKET_ACTIONS.TYPING, data);
            break;
          case SOCKET_ACTIONS.JOIN_CHAT:
            socket.emit(SOCKET_ACTIONS.JOIN_CHAT, data);
            break;
          case SOCKET_ACTIONS.LEAVE_CHAT:
            socket.emit(SOCKET_ACTIONS.LEAVE_CHAT, data);
            break;
          default:
            break;
        }
      }

      // Continue to the next middleware
      return next(action);
    };
  };
};

export default socketMiddleware;
