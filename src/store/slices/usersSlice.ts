import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersService } from "../../api/axiosInstance";

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getAllUsers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || "Failed to fetch users");
    }
  }
);

export const searchUsers = createAsyncThunk(
  "users/search",
  async (
    {
      q,
      field,
      fields,
    }: {
      q: string;
      field: "username" | "phoneNumber" | "country";
      fields?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await usersService.searchUsers(q, field, fields);
      return response.data;
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
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state: any, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state: any, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError } = usersSlice.actions;
export default usersSlice.reducer;
