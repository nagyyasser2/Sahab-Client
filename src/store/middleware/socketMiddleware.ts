import { updateUserStatus } from "../slices/chatSlice";
import socket, { SOCKET_EVENTS } from "../../api/socket";
import {
  type Dispatch,
  type Middleware,
  type MiddlewareAPI,
} from "@reduxjs/toolkit";
import type { RootState } from "../../types";
import {
  addMessage,
  markAsRead,
  setTypingStatus,
} from "../slices/messageSlice";

// Socket middleware to handle socket events and dispatch Redux actions
const socketMiddleware = (): Middleware<{}, RootState> => {
  return (store: MiddlewareAPI<Dispatch, RootState>) => {
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
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
      store.dispatch(addMessage(message));
    });

    // Listen for message read events
    socket.on(SOCKET_EVENTS.MESSAGES_READ, ({ chatId, messageId, userId }) => {
      store.dispatch(markAsRead({ chatId, messageId, userId }));
    });

    // Listen for typing events - simplified to only need chatId and isTyping
    socket.on(SOCKET_EVENTS.TYPING, ({ chatId, isTyping }) => {
      store.dispatch(setTypingStatus({ chatId, isTyping }));
    });

    // Listen for user online/offline status
    socket.on(SOCKET_EVENTS.USER_STATUS_UPDATE, ({ userId, status }) => {
      store.dispatch(updateUserStatus({ userId, status: status }));
    });

    // The actual middleware
    return (next) => (action: any) => {
      // Check if the action is intended for socket emission
      if (action.type === "socket/SEND_MESSAGE") {
        const { event, data } = action.payload;
        socket.emit(event, data);
      }

      // Handle different socket action types
      if (action.type === "socket/EMIT") {
        const { event, data } = action.payload;
        socket.emit(event, data);
      }

      // Continue to the next middleware
      return next(action);
    };
  };
};

// Action creator for socket emissions
export const emitSocketAction = (event: string, data: any) => ({
  type: "socket/EMIT",
  payload: { event, data },
});

export default socketMiddleware;
