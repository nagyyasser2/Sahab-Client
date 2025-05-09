import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

// Reducers
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import messageReducer from "./slices/messageSlice";

// Middleware
import socketMiddleware from "./middleware/socketMiddleware";

// Configure persistence
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "isAuthenticated"], // Only persist these fields
};

const chatPersistConfig = {
  key: "chats",
  storage,
  whitelist: ["chats"], // Only persist chat list
};

const messagePersistConfig = {
  key: "messages",
  storage,
  whitelist: ["messagesByChatId"], // Persist messages
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  chats: persistReducer(chatPersistConfig, chatReducer),
  messages: persistReducer(messagePersistConfig, messageReducer),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(socketMiddleware()), // Only add your custom middleware
});

// Create persistor
const persistor = persistStore(store);
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
