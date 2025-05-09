import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { messageService } from "../../api/axiosInstance";
import { SOCKET_ACTIONS } from "../../api/socket";

// Async thunks
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(chatId);
      return { chatId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ chatId, content }: any, { dispatch, getState, rejectWithValue }) => {
    try {
      // Send via REST API
      const response = await messageService.sendMessage(chatId, { content });
      const message = response.data;

      // Also emit via socket for real-time updates
      dispatch({
        type: "socket/SEND_MESSAGE",
        payload: {
          event: SOCKET_ACTIONS.SEND_MESSAGE,
          data: { chatId, message },
        },
      });

      return message;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(messageId);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messagesByChatId: {}, // { chatId: [messages] }
    loading: false,
    error: null,
    typingUsers: {}, // { chatId: [userIds] }
  },
  reducers: {
    // Add message from socket
    addMessage: (state: any, action) => {
      const message = action.payload;
      const chatId = message.chatId;

      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }

      // Check if message already exists to avoid duplicates
      const messageExists = state.messagesByChatId[chatId].some(
        (m: any) => m.id === message.id
      );

      if (!messageExists) {
        state.messagesByChatId[chatId].push(message);
      }
    },

    // Mark message as read
    markAsRead: (state: any, action) => {
      const { chatId, messageId, userId } = action.payload;

      if (state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = state.messagesByChatId[chatId].map(
          (message: any) => {
            if (message.id === messageId) {
              return {
                ...message,
                readBy: [...(message.readBy || []), userId],
              };
            }
            return message;
          }
        );
      }
    },

    // Update typing status
    setTyping: (state: any, action) => {
      const { chatId, userId, isTyping } = action.payload;

      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }

      if (isTyping) {
        // Add user to typing list if not already there
        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId);
        }
      } else {
        // Remove user from typing list
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          (id: any) => id !== userId
        );
      }
    },

    // Clear typing status for a chat
    clearTypingForChat: (state: any, action) => {
      const chatId = action.payload;
      state.typingUsers[chatId] = [];
    },

    // Clear messages for a specific chat
    clearChatMessages: (state: any, action) => {
      const chatId = action.payload;
      delete state.messagesByChatId[chatId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state: any, action: any) => {
        const { chatId, messages } = action.payload;
        state.loading = false;
        state.messagesByChatId[chatId] = messages;
      })
      .addCase(fetchMessages.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state: any, action: any) => {
        const message = action.payload;
        const chatId = message.chatId;

        if (!state.messagesByChatId[chatId]) {
          state.messagesByChatId[chatId] = [];
        }

        state.messagesByChatId[chatId].push(message);
      })
      // Delete message
      .addCase(deleteMessage.fulfilled, (state: any, action) => {
        const messageId = action.payload;

        // Find and remove the message from all chats
        Object.keys(state.messagesByChatId).forEach((chatId) => {
          state.messagesByChatId[chatId] = state.messagesByChatId[
            chatId
          ].filter((message: any) => message.id !== messageId);
        });
      });
  },
});

export const {
  addMessage,
  markAsRead,
  setTyping,
  clearTypingForChat,
  clearChatMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
