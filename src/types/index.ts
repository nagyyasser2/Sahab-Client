export interface User {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface Chat {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: string[];
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  readBy?: string[];
  createdAt: Date;
  isDeleted?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  userStatuses: Record<string, "online" | "offline">;
}

export interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>;
}

export interface RootState {
  auth: AuthState;
  chats: ChatState;
  messages: MessageState;
}

export interface SocketAction {
  event: string;
  data: any;
}

export interface ActionWithSocket {
  socket?: SocketAction;
  type: string;
  payload?: any;
}
