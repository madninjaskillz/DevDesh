import { createContext, useContext, useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export interface RepoConfig {
  owner: string;
  repo: string;
}

const STORAGE_KEY = 'devdash-repos';

const DEFAULT_REPOS: RepoConfig[] = [
  { owner: 'red-gate', repo: 'flyway-main' },
  { owner: 'red-gate', repo: 'FlywayDesktop' },
];

interface RepoConfigContextValue {
  repos: RepoConfig[];
  addRepo: (owner: string, repo: string) => Promise<void>;
  removeRepo: (owner: string, repo: string) => void;
  isValidating: boolean;
  error: string | null;
}

export const RepoConfigContext = createContext<RepoConfigContextValue>({
  repos: DEFAULT_REPOS,
  addRepo: async () => {},
  removeRepo: () => {},
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

export function useRepoConfigProvider(): RepoConfigContextValue {
  const { token } = useAuth();
  const [repos, setRepos] = useState<RepoConfig[]>(loadRepos);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRepo = useCallback(
    async (owner: string, repo: string) => {
      if (!token) throw new Error('Not authenticated');

      // Check if already exists
      if (repos.some((r) => r.owner === owner && r.repo === repo)) {
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
          setError(`Failed to validate repository: ${res.status}`);
          return;
        }

        const updated = [...repos, { owner, repo }];
        setRepos(updated);
        saveRepos(updated);
      } finally {
        setIsValidating(false);
      }
    },
    [token, repos],
  );

  const removeRepo = useCallback(
    (owner: string, repo: string) => {
      const updated = repos.filter((r) => !(r.owner === owner && r.repo === repo));
      setRepos(updated);
      saveRepos(updated);
    },
    [repos],
  );

  return { repos, addRepo, removeRepo, isValidating, error };
}
