import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../../api/axiosInstance";
import { SOCKET_ACTIONS, SOCKET_EVENTS } from "../../api/socket";
import type { ChatState } from "../../types";
import { emitSocketAction } from "../middleware/socketMiddleware";

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
      // Calculate skip parameter from page for backend API
      const skip = (page - 1) * limit;
      const response: any = await chatService.getChats({
        skip,
        limit,
        includeArchived,
      });

      // The backend now returns { chats, total } directly
      const { chats, total } = response.data;

      return {
        chats,
        total,
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
      dispatch(setCurrentChat({}));
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
      const response: any = await chatService.createChat(chatData);
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

// Async thunk for blocking user
export const blockUser = createAsyncThunk(
  "chats/blockUser",
  async (
    {
      conversationId,
      targetUserId,
    }: {
      conversationId: string;
      targetUserId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response: any = await chatService.blockUser(
        conversationId,
        targetUserId
      );

      dispatch(
        emitSocketAction(SOCKET_EVENTS.UPDATE_BLOCK_STATUS, {
          conversationId,
          receiverId: targetUserId,
          blockStatus: response.data.blockStatus,
        })
      );

      return {
        conversationId,
        targetUserId,
        conversation: response.data.conversation,
        message: response.data.message,
        blockStatus: response.data.blockStatus,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user"
      );
    }
  }
);

// Async thunk for unblocking user
export const unblockUser = createAsyncThunk(
  "chats/unblockUser",
  async (
    {
      conversationId,
      targetUserId,
    }: {
      conversationId: string;
      targetUserId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response: any = await chatService.unblockUser(
        conversationId,
        targetUserId
      );

      // dispatch(updateChatBlockStatus(response.data));

      dispatch(
        emitSocketAction(SOCKET_EVENTS.UPDATE_BLOCK_STATUS, {
          conversationId,
          receiverId: targetUserId,
          blockStatus: response.data.blockStatus,
        })
      );

      return {
        conversationId,
        targetUserId,
        conversation: response.data.conversation,
        message: response.data.message,
        blockStatus: response.data.blockStatus, // Make sure backend returns this
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user"
      );
    }
  }
);

// Async thunk for getting block status
export const getBlockStatus = createAsyncThunk(
  "chats/getBlockStatus",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response: any = await chatService.getBlockStatus(conversationId);

      return {
        conversationId,
        blockStatus: response.data, // Assuming the entire response.data is the blockStatus
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get block status"
      );
    }
  }
);

const initCurrentChat = {
  _id: null,
  participants: [],
  otherParticipant: null,
  messages: [],
  isActive: true,
  lastActivityAt: null,
  lastMessage: null,
  blockedBy: [],
  lastReadAt: {},
  isArchived: false,
  messageCount: 0,
  createdAt: null,
  updatedAt: null,
  blockStatus: {
    isBlockedByMe: false,
    isBlockedByOther: false,
    canSendMessages: true,
  },
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
  hasMore: false,
  skip: 0,
  blockingStatus: {
    loading: false,
    error: null,
  },
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
    resetUnreadMessages: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, unreadMessagesCount: 0 } : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = { ...state.currentChat, unreadMessagesCount: 0 };
      }
    },
    incrementUnreadMessages: (state, action) => {
      const { chatId } = action.payload;

      if (state.currentChat && state.currentChat._id === chatId) {
        return;
      }

      state.chats = state.chats.map((chat) =>
        chat._id === chatId
          ? { ...chat, unreadMessagesCount: chat.unreadMessagesCount + 1 }
          : chat
      );
    },
    updateLastMessage: (state, action) => {
      const { chatId, message } = action.payload;
      state.chats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, lastMessage: message } : chat
      );

      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat = { ...state.currentChat, lastMessage: message };
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    updateChatBlockStatus: (state, action) => {
      const { conversationId, blockStatus } = action.payload;

      // Update current chat if it matches
      if (state.currentChat._id === conversationId) {
        state.currentChat.blockStatus = blockStatus;
        state.currentChat.isBlocked = !blockStatus.canSendMessages;
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(
        (chat) => chat._id === conversationId
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex].blockStatus = blockStatus;
        state.chats[chatIndex].isBlocked = !blockStatus.canSendMessages;
      }
    },
    clearBlockingError: (state) => {
      state.blockingStatus.error = null;
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
      })
      // Get block status handlers
      .addCase(getBlockStatus.pending, (state) => {
        state.blockingStatus.loading = true;
        state.blockingStatus.error = null;
      })
      .addCase(getBlockStatus.fulfilled, (state, action) => {
        state.blockingStatus.loading = false;
        const { conversationId, blockStatus } = action.payload;

        // Update current chat if it matches
        if (state.currentChat._id === conversationId) {
          state.currentChat.blockStatus = blockStatus;
        }

        // Update chat in chats array
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === conversationId
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].blockStatus = blockStatus;
        }
      })
      .addCase(getBlockStatus.rejected, (state, action) => {
        state.blockingStatus.loading = false;
        state.blockingStatus.error = action.payload as string;
      })
      // Block user handlers
      .addCase(blockUser.pending, (state) => {
        state.blockingStatus.loading = true;
        state.blockingStatus.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.blockingStatus.loading = false;
        state.blockingStatus.error = null;

        const { conversationId, blockStatus } = action.payload;

        // Update current chat if it matches
        if (state.currentChat._id === conversationId) {
          state.currentChat.blockStatus = blockStatus;
        }

        // Update chat in chats array
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === conversationId
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].blockStatus = blockStatus;
          state.chats[chatIndex].isBlocked = !blockStatus.canSendMessages;
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.blockingStatus.loading = false;
        state.blockingStatus.error = action.payload as string;
      })
      // Unblock user handlers
      .addCase(unblockUser.pending, (state) => {
        state.blockingStatus.loading = true;
        state.blockingStatus.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.blockingStatus.loading = false;
        state.blockingStatus.error = null;

        const { conversationId, blockStatus } = action.payload;

        // Update current chat if it matches
        if (state.currentChat._id === conversationId) {
          state.currentChat.blockStatus = blockStatus;
        }

        // Update chat in chats array
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === conversationId
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].blockStatus = blockStatus;
          state.chats[chatIndex].isBlocked = !blockStatus.canSendMessages;
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.blockingStatus.loading = false;
        state.blockingStatus.error = action.payload as string;
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
  resetUnreadMessages,
  incrementUnreadMessages,
  updateLastMessage,
  updateChatBlockStatus,
  clearBlockingError,
} = chatSlice.actions;

export default chatSlice.reducer;
