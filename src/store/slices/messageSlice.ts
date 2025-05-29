import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { messageService } from "../../api/axiosInstance";
import { SOCKET_ACTIONS } from "../../api/socket";
import { MessageStatus, type Message, type RootState } from "../../types";

// State interface
interface MessagesState {
  messagesByChatId: { [chatId: string]: Message[] };
  loading: boolean;
  error: string | null;
  typingChats: { [chatId: string]: boolean }; // Simplified: just track if someone is typing in this chat
}

// Initial state
const initialState: MessagesState = {
  messagesByChatId: {},
  loading: false,
  error: null,
  typingChats: {},
};

// Async thunks
export const fetchMessages = createAsyncThunk<
  { chatId: string; messages: Message[] }, // Return type
  { chatId: string; receiverId: string; skip?: number; limit?: number }, // Payload type
  { rejectValue: string } // ThunkAPI config
>(
  "messages/fetchMessages",
  async (
    { chatId, receiverId, skip = 0, limit = 20 },
    { rejectWithValue }: any
  ) => {
    try {
      const response = await messageService.getMessages(
        chatId,
        receiverId,
        skip,
        limit
      );
      return { chatId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk<
  Message,
  { chatId: string; content: { text: string }; receiverId: string },
  { rejectValue: string }
>(
  "messages/sendMessage",
  async (
    { chatId, content, receiverId },
    { dispatch, rejectWithValue }: any
  ) => {
    try {
      // Send via REST API
      const response = await messageService.sendMessage({
        chatId,
        content,
        receiverId,
      });
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
      return rejectWithValue(error.response?.data || "Failed to send message");
    }
  }
);

export const deleteMessage = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("messages/deleteMessage", async (messageId, { rejectWithValue }) => {
  try {
    await messageService.deleteMessage(messageId);
    return messageId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to delete message");
  }
});

// Slice
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Add message from socket
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.conversationId;

      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }

      // Check if message already exists to avoid duplicates
      const messageExists = state.messagesByChatId[chatId].some(
        (m) => m._id === message._id
      );

      if (!messageExists) {
        state.messagesByChatId[chatId].push(message);
      }
    },

    // Add older messages (for pagination)
    addOlderMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const { chatId, messages } = action.payload;

      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }

      // Filter out any messages that already exist in the state
      const uniqueMessages = messages.filter(
        (message) =>
          !state.messagesByChatId[chatId].some((m) => m._id === message._id)
      );

      // Add older messages to the beginning of the array
      state.messagesByChatId[chatId] = [
        ...uniqueMessages,
        ...state.messagesByChatId[chatId],
      ];
    },

    // Mark message as read
    markAsRead: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        userId: string;
      }>
    ) => {
      const { chatId, messageId } = action.payload;

      if (state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = state.messagesByChatId[chatId].map(
          (message) => {
            if (message._id === messageId) {
              return {
                ...message,
                status: MessageStatus.Seen,
              };
            }
            return message;
          }
        );
      }
    },

    // Simplified typing status - just set true/false for the chat
    setTypingStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        isTyping: boolean;
      }>
    ) => {
      const { chatId, isTyping } = action.payload;
      state.typingChats[chatId] = isTyping;
    },

    // Clear typing status for a chat
    clearTypingForChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.typingChats[chatId] = false;
    },

    // Clear messages for a specific chat
    clearChatMessages: (state, action: PayloadAction<string>) => {
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
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.loading = false;

        // If this is the initial fetch (not pagination), replace all messages
        if (
          !state.messagesByChatId[chatId] ||
          state.messagesByChatId[chatId].length === 0
        ) {
          state.messagesByChatId[chatId] = messages;
        } else {
          // This is a pagination request, add older messages to the beginning
          // Filter out any messages that already exist in the state
          const uniqueMessages = messages.filter(
            (message) =>
              !state.messagesByChatId[chatId].some((m) => m._id === message._id)
          );

          state.messagesByChatId[chatId] = [
            ...uniqueMessages,
            ...state.messagesByChatId[chatId],
          ];
        }
      })
      .addCase(fetchMessages.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const chatId = message.conversationId;

        if (!state.messagesByChatId[chatId]) {
          state.messagesByChatId[chatId] = [];
        }

        state.messagesByChatId[chatId].push(message);
      })
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;

        // Find and remove the message from all chats
        Object.keys(state.messagesByChatId).forEach((chatId) => {
          state.messagesByChatId[chatId] = state.messagesByChatId[
            chatId
          ].filter((message) => message._id !== messageId);
        });
      });
  },
});

// Selectors
export const selectMessagesByChatId = (
  state: RootState,
  chatId: string
): any => {
  return state.messages.messagesByChatId[chatId] || [];
};

export const selectIsTyping = (state: RootState, chatId: string): boolean => {
  return state.messages.typingChats[chatId] || false;
};

export const {
  addMessage,
  addOlderMessages,
  markAsRead,
  setTypingStatus,
  clearTypingForChat,
  clearChatMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
