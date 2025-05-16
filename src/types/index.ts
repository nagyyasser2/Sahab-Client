export interface User {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface MessageContent {
  text: string;
}

export enum MessageStatus {
  Seen = 1,
  Send = 2,
  Delivered = 3,
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: MessageContent;
  type: string;
  status: MessageStatus;
  reactions: string[];
  createdAt: Date;
  isDeleted: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
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

// Define types based on the provided example
export interface PrivacySettings {
  lastSeenVisibility: "everyone" | "contacts" | "nobody";
  profilePhotoVisibility: "everyone" | "contacts" | "nobody";
}

export interface ParticipantUser {
  _id: string;
  username: string;
  country?: string;
  profilePic?: string;
  status?: string | null;
  lastSeen?: string;
  privacySettings?: PrivacySettings;
}

export interface Chat {
  _id: string;
  lastMessage: string;
  unreadMessagesCount: number;
  conversationKey: string;
  isActive: boolean;
  lastActivityAt: string;
  blockedBy: string[];
  isArchived: boolean;
  messageCount: number;
  otherParticipant: ParticipantUser;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat;
  loading: boolean;
  error: any;
  userStatuses: Record<string, string | null>;
  hasMore: boolean;
  skip: number;
  total: number;
  page: number;
  limit: number;
}
