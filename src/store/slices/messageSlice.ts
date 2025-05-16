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
  typingUsers: { [chatId: string]: string[] };
}

// Initial state
const initialState: MessagesState = {
  messagesByChatId: {},
  loading: false,
  error: null,
  typingUsers: {},
};

// Async thunks
export const fetchMessages = createAsyncThunk<
  { chatId: string; messages: Message[] }, // Return type
  { chatId: string; receiverId: string }, // Payload type
  { rejectValue: string } // ThunkAPI config
>(
  "messages/fetchMessages",
  async ({ chatId, receiverId }, { rejectWithValue }: any) => {
    try {
      const response = await messageService.getMessages(chatId, receiverId);
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
      const response = await messageService.sendMessage(chatId, {
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

    // Mark message as read
    markAsRead: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        userId: string;
      }>
    ) => {
      const { chatId, messageId, userId } = action.payload;

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

    // Update typing status
    setTyping: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
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
          (id) => id !== userId
        );
      }
    },

    // Clear typing status for a chat
    clearTypingForChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.typingUsers[chatId] = [];
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
        state.messagesByChatId[chatId] = messages;
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

export const selectMessagesByChatId = (
  state: RootState,
  chatId: string
): any => {
  return state.messages.messagesByChatId[chatId] || [];
};

export const {
  addMessage,
  markAsRead,
  setTyping,
  clearTypingForChat,
  clearChatMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
