import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersService } from "../../api/axiosInstance";

// Async thunk with pagination
export const searchUsers = createAsyncThunk(
  "users/search",
  async (
    {
      q,
      field,
      fields,
      page = 1,
      limit = 10,
    }: {
      q: string;
      field: "username" | "phoneNumber" | "country";
      fields?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await usersService.searchUsers(
        q,
        field,
        fields,
        page,
        limit
      );
      return response.data; // should be { data, total, page, limit }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to search users");
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [] as any[],
    total: 0,
    page: 1,
    limit: 10,
    selectedUser: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action: any) => {
        state.loading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
