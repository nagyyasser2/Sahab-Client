// Request Types
export interface RegisterRequest {
  phoneNumber: string;
  username: string;
  password: string;
  country: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

// Response Types
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface PrivacySettings {
  lastSeenVisibility: string;
  profilePhotoVisibility: string;
}

export interface User {
  _id: string;
  phoneNumber: string;
  username: string;
  country: string;
  profilePic: string;
  status: string | null;
  lastSeen: string | null;
  privacySettings: PrivacySettings;
}

export interface AuthResponse {
  tokens: TokenPair;
  user: User;
}

// Form Types
export interface LoginFormValues {
  identifier: string;
  password: string;
}

export interface RegisterFormValues {
  phoneNumber: string;
  username: string;
  password: string;
  confirmPassword: string;
  country: string;
}

export interface RefreshTokenResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}
