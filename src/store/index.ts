import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Reducers
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import messageReducer from "./slices/messageSlice";
import usersReducer from "./slices/usersSlice";

// Middleware
import socketMiddleware from "./middleware/socketMiddleware";

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  chats: chatReducer,
  messages: messageReducer,
  users: usersReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(socketMiddleware()),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
