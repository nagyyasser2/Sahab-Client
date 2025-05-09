import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../../api/axiosInstance";
import { SOCKET_ACTIONS } from "../../api/socket";

// Async thunks
export const fetchChats = createAsyncThunk(
  "chats/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getChats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchChatById = createAsyncThunk(
  "chats/fetchChatById",
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      const response = await chatService.getChatById(chatId);

      // Join the chat room via socket
      dispatch({
        type: "socket/JOIN_CHAT",
        payload: {
          event: SOCKET_ACTIONS.JOIN_CHAT,
          data: { chatId },
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createChat = createAsyncThunk(
  "chats/createChat",
  async (chatData, { rejectWithValue }) => {
    try {
      const response = await chatService.createChat(chatData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateChat = createAsyncThunk(
  "chats/updateChat",
  async ({ chatId, data }: any, { rejectWithValue }) => {
    try {
      const response = await chatService.updateChat(chatId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteChat = createAsyncThunk(
  "chats/deleteChat",
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      await chatService.deleteChat(chatId);

      // Leave the chat room via socket
      dispatch({
        type: "socket/LEAVE_CHAT",
        payload: {
          event: SOCKET_ACTIONS.LEAVE_CHAT,
          data: { chatId },
        },
      });

      return chatId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: "chats",
  initialState: {
    chats: [],
    currentChat: null,
    loading: false,
    error: null,
    userStatuses: {}, // Track online/offline status of users
  },
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    updateUserStatus: (state: any, action) => {
      const { userId, status } = action.payload;
      state.userStatuses[userId] = status;

      // Update user status in chats if it's a direct message
      state.chats = state.chats.map((chat: any) => {
        if (chat.type === "direct" && chat.participants.includes(userId)) {
          return {
            ...chat,
            participants: chat.participants.map((participant: any) =>
              participant.userId === userId
                ? { ...participant, status }
                : participant
            ),
          };
        }
        return chat;
      });
    },
    addChatToList: (state: any, action: any) => {
      state.chats.unshift(action.payload);
    },
    updateChatInList: (state: any, action: any) => {
      const updatedChat = action.payload;
      state.chats = state.chats.map((chat: any) =>
        chat.id === updatedChat.id ? updatedChat : chat
      );

      // Also update currentChat if it's the one being updated
      if (state.currentChat && state.currentChat.id === updatedChat.id) {
        state.currentChat = updatedChat;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all chats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload as any;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any) || "Failed to fetch chats";
      })
      // Fetch single chat
      .addCase(fetchChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload as any;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any) || "Failed to fetch chat";
      })
      // Create chat
      .addCase(createChat.fulfilled, (state: any, action) => {
        state.chats.unshift(action.payload);
      })
      // Update chat
      .addCase(updateChat.fulfilled, (state: any, action: any) => {
        const updatedChat = action.payload;
        state.chats = state.chats.map((chat: any) =>
          chat.id === updatedChat.id ? updatedChat : chat
        );

        if (state.currentChat && state.currentChat.id === updatedChat.id) {
          state.currentChat = updatedChat;
        }
      })
      // Delete chat
      .addCase(deleteChat.fulfilled, (state: any, action) => {
        const chatId = action.payload;
        state.chats = state.chats.filter((chat: any) => chat.id !== chatId);

        if (state.currentChat && state.currentChat.id === chatId) {
          state.currentChat = null;
        }
      });
  },
});

export const {
  setCurrentChat,
  clearCurrentChat,
  updateUserStatus,
  addChatToList,
  updateChatInList,
} = chatSlice.actions;
export default chatSlice.reducer;
