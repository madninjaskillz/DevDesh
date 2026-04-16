import { createContext, useContext, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface RepoConfig {
  owner: string;
  repo: string;
}

const STORAGE_KEY = 'devdash-repos';
const STARRED_KEY = 'devdash-starred-repos';

const DEFAULT_REPOS: RepoConfig[] = [
  { owner: 'red-gate', repo: 'flyway-main' },
  { owner: 'red-gate', repo: 'FlywayDesktop' },
];

interface RepoConfigContextValue {
  repos: RepoConfig[];
  addRepo: (owner: string, repo: string) => Promise<void>;
  removeRepo: (owner: string, repo: string) => void;
  starredRepos: Set<string>;
  toggleStar: (owner: string, repo: string) => void;
  isValidating: boolean;
  error: string | null;
}

export const RepoConfigContext = createContext<RepoConfigContextValue>({
  repos: DEFAULT_REPOS,
  addRepo: async () => {},
  removeRepo: () => {},
  starredRepos: new Set(),
  toggleStar: () => {},
  isValidating: false,
  error: null,
});

export const useRepoConfig = () => useContext(RepoConfigContext);

function loadRepos(): RepoConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REPOS;
    const parsed = JSON.parse(raw) as RepoConfig[];
    return parsed.length > 0 ? parsed : DEFAULT_REPOS;
  } catch {
    return DEFAULT_REPOS;
  }
}

function saveRepos(repos: RepoConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

function loadStarred(): Set<string> {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStarred(starred: Set<string>) {
  localStorage.setItem(STARRED_KEY, JSON.stringify([...starred]));
}

export function useRepoConfigProvider(): RepoConfigContextValue {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [repos, setRepos] = useState<RepoConfig[]>(loadRepos);
  const [starredRepos, setStarredRepos] = useState<Set<string>>(loadStarred);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRepo = useCallback(
    async (owner: string, repo: string) => {
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Check duplicate against current state
      const current = loadRepos();
      if (current.some((r) => r.owner === owner && r.repo === repo)) {
        setError('Repository already added');
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        });

        if (res.status === 404) {
          setError(`Repository ${owner}/${repo} not found or not accessible`);
          return;
        }
        if (!res.ok) {
          setError(`Failed to validate repository: HTTP ${res.status}`);
          return;
        }

        const updated = [...loadRepos(), { owner, repo }];
        saveRepos(updated);
        setRepos(updated);
        // Invalidate all queries so they refetch with the new repo list
        queryClient.invalidateQueries();
      } catch (err) {
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
      } finally {
        setIsValidating(false);
      }
    },
    [token, queryClient],
  );

  const removeRepo = useCallback(
    (owner: string, repo: string) => {
      const current = loadRepos();
      const updated = current.filter((r) => !(r.owner === owner && r.repo === repo));
      saveRepos(updated);
      setRepos(updated);
      // Also remove from starred if present
      const fullName = `${owner}/${repo}`;
      setStarredRepos((prev) => {
        if (!prev.has(fullName)) return prev;
        const next = new Set(prev);
        next.delete(fullName);
        saveStarred(next);
        return next;
      });
      queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const toggleStar = useCallback((owner: string, repo: string) => {
    const fullName = `${owner}/${repo}`;
    setStarredRepos((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName); else next.add(fullName);
      saveStarred(next);
      return next;
    });
  }, []);

  return { repos, addRepo, removeRepo, starredRepos, toggleStar, isValidating, error };
}
