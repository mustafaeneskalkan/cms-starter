"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiFetch,
  ApiResult,
  getCsrfToken,
  readCsrfTokenFromCookie,
} from "../../lib/backend/api";
import type {
  AdminSessionStatsResponse,
  CurrentSessionResponse,
  LoginOrRegisterResponse,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
} from "../../lib/backend/types";
import { isAdminUser } from "../../lib/backend/types";

export const CMS_ACCESS_DENIED_MESSAGE =
  "CMS access requires an Admin account.";

type ChangeEmailRequest = {
  newEmail: string;
};

type SessionContextValue = {
  loading: boolean;
  csrfToken: string | null;
  session: CurrentSessionResponse | null;

  refreshSession: () => Promise<void>;
  ensureCsrfToken: () => Promise<string | null>;

  login: (payload: LoginRequest) => Promise<ApiResult<LoginOrRegisterResponse>>;
  register: (
    payload: RegisterRequest,
  ) => Promise<ApiResult<LoginOrRegisterResponse>>;
  logout: () => Promise<ApiResult<MessageResponse>>;

  changeEmail: (
    payload: ChangeEmailRequest,
  ) => Promise<ApiResult<MessageResponse>>;

  requestPasswordReset: (payload: {
    email: string;
  }) => Promise<ApiResult<MessageResponse>>;
  resetPassword: (payload: {
    token: string;
    newPassword: string;
  }) => Promise<ApiResult<MessageResponse>>;

  fetchAdminSessionStats: () => Promise<
    ApiResult<AdminSessionStatsResponse>
  >;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

async function logoutSilently(
  ensureCsrfToken: () => Promise<string | null>,
): Promise<void> {
  const token = await ensureCsrfToken();
  if (!token) return;

  await apiFetch<MessageResponse>("/api/users/logout", {
    method: "POST",
    headers: { "x-xsrf-token": token },
    body: JSON.stringify({}),
  });
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [session, setSession] = useState<CurrentSessionResponse | null>(null);

  const ensureCsrfToken = useCallback(async (): Promise<string | null> => {
    const cookieToken = readCsrfTokenFromCookie();
    if (cookieToken && cookieToken !== csrfToken) {
      setCsrfToken(cookieToken);
      return cookieToken;
    }

    if (csrfToken) return csrfToken;
    const result = await getCsrfToken();
    if (!result.ok) return null;
    setCsrfToken(result.data.csrfToken);
    return result.data.csrfToken;
  }, [csrfToken]);

  const enforceAdminSession = useCallback(
    async (data: CurrentSessionResponse): Promise<CurrentSessionResponse | null> => {
      if (isAdminUser(data.user)) {
        return data;
      }

      await logoutSilently(ensureCsrfToken);
      setSession(null);
      return null;
    },
    [ensureCsrfToken],
  );

  const refreshSession = useCallback(async (): Promise<void> => {
    const result = await apiFetch<CurrentSessionResponse>(
      "/api/users/session",
      {
        method: "GET",
      },
    );

    if (!result.ok) {
      if (result.status === 401) {
        setSession(null);
      }
      return;
    }

    const adminSession = await enforceAdminSession(result.data);
    setSession(adminSession);
  }, [enforceAdminSession]);

  const login = useCallback(
    async (
      payload: LoginRequest,
    ): Promise<ApiResult<LoginOrRegisterResponse>> => {
      const token = await ensureCsrfToken();
      if (!token) {
        return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
      }

      const result = await apiFetch<LoginOrRegisterResponse>(
        "/api/users/login",
        {
          method: "POST",
          headers: { "x-xsrf-token": token },
          body: JSON.stringify(payload),
        },
      );

      if (!result.ok) {
        return result;
      }

      if (!isAdminUser(result.data.user)) {
        await logoutSilently(ensureCsrfToken);
        setSession(null);
        return {
          ok: false,
          status: 403,
          message: CMS_ACCESS_DENIED_MESSAGE,
        };
      }

      setSession({
        user: result.data.user,
        session: { sessionId: result.data.session.sessionId },
      });

      return result;
    },
    [ensureCsrfToken],
  );

  const register = useCallback(
    async (
      payload: RegisterRequest,
    ): Promise<ApiResult<LoginOrRegisterResponse>> => {
      const token = await ensureCsrfToken();
      if (!token) {
        return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
      }

      const result = await apiFetch<LoginOrRegisterResponse>(
        "/api/users/register",
        {
          method: "POST",
          headers: { "x-xsrf-token": token },
          body: JSON.stringify(payload),
        },
      );

      if (!result.ok) {
        return result;
      }

      if (!isAdminUser(result.data.user)) {
        await logoutSilently(ensureCsrfToken);
        setSession(null);
        return {
          ok: false,
          status: 403,
          message: CMS_ACCESS_DENIED_MESSAGE,
        };
      }

      setSession({
        user: result.data.user,
        session: { sessionId: result.data.session.sessionId },
      });

      return result;
    },
    [ensureCsrfToken],
  );

  const logout = useCallback(async (): Promise<ApiResult<MessageResponse>> => {
    const token = await ensureCsrfToken();
    if (!token) {
      return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
    }

    const result = await apiFetch<MessageResponse>("/api/users/logout", {
      method: "POST",
      headers: { "x-xsrf-token": token },
      body: JSON.stringify({}),
    });

    if (result.ok) {
      setSession(null);
    }

    return result;
  }, [ensureCsrfToken]);

  const changeEmail = useCallback(
    async (
      payload: ChangeEmailRequest,
    ): Promise<ApiResult<MessageResponse>> => {
      const token = await ensureCsrfToken();
      if (!token) {
        return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
      }

      return apiFetch<MessageResponse>("/api/users/change-email", {
        method: "POST",
        headers: { "x-xsrf-token": token },
        body: JSON.stringify(payload),
      });
    },
    [ensureCsrfToken],
  );

  const requestPasswordReset = useCallback(
    async (payload: { email: string }): Promise<ApiResult<MessageResponse>> => {
      const token = await ensureCsrfToken();
      if (!token) {
        return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
      }

      return apiFetch<MessageResponse>("/api/users/request-password-change", {
        method: "POST",
        headers: { "x-xsrf-token": token },
        body: JSON.stringify(payload),
      });
    },
    [ensureCsrfToken],
  );

  const resetPassword = useCallback(
    async (payload: {
      token: string;
      newPassword: string;
    }): Promise<ApiResult<MessageResponse>> => {
      const csrf = await ensureCsrfToken();
      if (!csrf) {
        return { ok: false, status: 0, message: "Failed to obtain CSRF token" };
      }

      return apiFetch<MessageResponse>("/api/users/reset-password", {
        method: "POST",
        headers: { "x-xsrf-token": csrf },
        body: JSON.stringify(payload),
      });
    },
    [ensureCsrfToken],
  );

  const fetchAdminSessionStats = useCallback(async (): Promise<
    ApiResult<AdminSessionStatsResponse>
  > => {
    return apiFetch<AdminSessionStatsResponse>("/api/admin/sessions/stats", {
      method: "GET",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const revalidateSession = () => {
      void refreshSession();
    };

    (async () => {
      await ensureCsrfToken();
      await refreshSession();
      if (!cancelled) setLoading(false);
    })();

    const intervalId = window.setInterval(revalidateSession, 5 * 60 * 1000);
    window.addEventListener("focus", revalidateSession);
    document.addEventListener("visibilitychange", revalidateSession);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", revalidateSession);
      document.removeEventListener("visibilitychange", revalidateSession);
    };
  }, [ensureCsrfToken, refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      csrfToken,
      session,
      refreshSession,
      ensureCsrfToken,
      login,
      register,
      logout,
      changeEmail,
      requestPasswordReset,
      resetPassword,
      fetchAdminSessionStats,
    }),
    [
      loading,
      csrfToken,
      session,
      refreshSession,
      ensureCsrfToken,
      login,
      register,
      logout,
      changeEmail,
      requestPasswordReset,
      resetPassword,
      fetchAdminSessionStats,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}

export type { CurrentSessionResponse, LoginRequest, RegisterRequest };
