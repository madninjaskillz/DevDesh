import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { GitHubUser } from '../types/github';
import { getUser, GitHubApiError } from '../api/github';

const PAT_KEY = 'devdash-github-pat';
const USER_KEY = 'devdash-github-user';

interface AuthState {
  token: string | null;
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function useAuthProvider(): AuthContextValue {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(PAT_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const user = userJson ? (JSON.parse(userJson) as GitHubUser) : null;
    return {
      token,
      user,
      isAuthenticated: !!token && !!user,
      isLoading: false,
      error: null,
    };
  });

  // Revalidate stored token on mount
  useEffect(() => {
    if (state.token && !state.user) {
      setState((s) => ({ ...s, isLoading: true }));
      getUser(state.token)
        .then((user) => {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false }));
        })
        .catch(() => {
          localStorage.removeItem(PAT_KEY);
          localStorage.removeItem(USER_KEY);
          setState({ token: null, user: null, isAuthenticated: false, isLoading: false, error: null });
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (token: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const user = await getUser(token);
      localStorage.setItem(PAT_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ token, user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof GitHubApiError && err.isUnauthorized
          ? 'Invalid token. Please check your PAT and try again.'
          : 'Failed to connect to GitHub. Please try again.';
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(PAT_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  return { ...state, login, logout };
}
