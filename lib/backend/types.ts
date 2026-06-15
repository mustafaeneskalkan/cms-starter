export type UserPublic = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  role?: string;
  lastLoginAt?: string;
  createdAt?: string;
};

export type SessionIssued = {
  sessionId: string;
  expiresIn: number;
};

export type CurrentSessionResponse = {
  user: UserPublic;
  session: {
    sessionId: string;
    lastActivity?: string;
    userAgent?: string;
    ipAddress?: string;
  };
};

export type LoginRequest = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type LoginOrRegisterResponse = {
  message: string;
  user: UserPublic;
  session: SessionIssued;
};

export type MessageResponse = {
  message: string;
};

export type AdminSessionStatsResponse = {
  totalUsers: number;
  usersWithActiveSessions: number;
  totalActiveSessions: number;
  expiredSessions: number;
};

export const ADMIN_ROLE = "Admin";

export function isAdminUser(user: UserPublic | null | undefined): boolean {
  return user?.role === ADMIN_ROLE;
}
