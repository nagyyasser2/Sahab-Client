import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../../api/axiosInstance";
import { SOCKET_ACTIONS } from "../../api/socket";
import type { ChatState, ParticipantUser, PrivacySettings } from "../../types";

export const fetchChats = createAsyncThunk(
  "chats/fetchChats",
  async (
    {
      page = 1,
      limit = 10,
      includeArchived = false,
    }: { page?: number; limit?: number; includeArchived?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const skip = (page - 1) * limit;
      const response = await chatService.getChats({
        skip,
        limit,
        includeArchived,
      });
      return {
        chats: response.data.chats || response.data,
        total: response.data.total || response.data.length,
        page,
        limit,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch chats");
    }
  }
);

export const fetchChatById = createAsyncThunk(
  "chats/fetchChatById",
  async (chatId: string, { dispatch, rejectWithValue }) => {
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
  async (chatData: any, { rejectWithValue }) => {
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
  async (
    { chatId, data }: { chatId: string; data: any },
    { rejectWithValue }
  ) => {
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
  async (chatId: string, { dispatch, rejectWithValue }) => {
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

const privacySettings: PrivacySettings = {
  lastSeenVisibility: "everyone",
  profilePhotoVisibility: "everyone",
};

const participantUser: ParticipantUser = {
  _id: "",
  username: "",
  country: "",
  profilePic: "",
  status: "",
  lastSeen: "",
  privacySettings: privacySettings,
};

const initCurrentChat = {
  _id: "",
  conversationKey: "",
  lastMessage: "",
  isActive: false,
  lastActivityAt: "",
  unreadMessagesCount: 0,
  blockedBy: [],
  isArchived: false,
  messageCount: 0,
  otherParticipant: participantUser,
};

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: initCurrentChat,
  loading: false,
  error: null,
  userStatuses: {},
  total: 0,
  page: 1,
  limit: 10,
};

// Slice
const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state: ChatState) => {
      state.currentChat = initCurrentChat;
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.userStatuses[userId] = status;

      // Update user status in chats' otherParticipant if it matches the userId
      state.chats = state.chats.map((chat) => {
        if (chat.otherParticipant._id === userId) {
          return {
            ...chat,
            otherParticipant: {
              ...chat.otherParticipant,
              status,
            },
          };
        }
        return chat;
      });
    },
    addChatToList: (state: ChatState, action) => {
      state.chats.unshift(action.payload);
    },
    updateChatInList: (state, action) => {
      const updatedChat = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === updatedChat._id ? updatedChat : chat
      );

      // Also update currentChat if it's the one being updated
      if (state.currentChat && state.currentChat._id === updatedChat._id) {
        state.currentChat = updatedChat;
      }
    },
    archiveChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, isArchived: true } : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = { ...state.currentChat, isArchived: true };
      }
    },
    unarchiveChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, isArchived: false } : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = { ...state.currentChat, isArchived: false };
      }
    },
    updateLastActivity: (state, action) => {
      const { chatId, timestamp } = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, lastActivityAt: timestamp } : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = { ...state.currentChat, lastActivityAt: timestamp };
      }
    },
    incrementMessageCount: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId
          ? { ...chat, messageCount: chat.messageCount + 1 }
          : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = {
          ...state.currentChat,
          messageCount: state.currentChat.messageCount + 1,
        };
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all chats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: any) => {
        state.loading = false;
        state.chats = action.payload.chats;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch chats";
      })
      // Fetch single chat
      .addCase(fetchChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentChat = action.payload;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch chat";
      })
      // Create chat
      .addCase(createChat.fulfilled, (state, action: any) => {
        state.chats.unshift(action.payload);
        state.total += 1;
      })
      // Update chat
      .addCase(updateChat.fulfilled, (state, action: any) => {
        const updatedChat = action.payload;
        state.chats = state.chats.map((chat) =>
          chat._id === updatedChat._id ? updatedChat : chat
        );

        if (state.currentChat && state.currentChat._id === updatedChat._id) {
          state.currentChat = updatedChat;
        }
      })
      // Delete chat
      .addCase(deleteChat.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.chats = state.chats.filter((chat) => chat._id !== chatId);
        state.total -= 1;

        if (state.currentChat && state.currentChat._id === chatId) {
          state.currentChat = initCurrentChat;
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
  archiveChat,
  unarchiveChat,
  updateLastActivity,
  incrementMessageCount,
  setPage,
} = chatSlice.actions;

export default chatSlice.reducer;
