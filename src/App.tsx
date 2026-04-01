import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AppThemeProvider } from './theme/ThemeProvider';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { RepoConfigContext, useRepoConfigProvider } from './hooks/useRepoConfig';
import { SettingsContext, useSettingsProvider } from './hooks/useSettings';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-mono/400.css';

const TEN_MINUTES = 10 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      gcTime: TEN_MINUTES,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'devdash-query-cache',
});

function AppInner() {
  const repoConfig = useRepoConfigProvider();
  const appSettings = useSettingsProvider();

  return (
    <RepoConfigContext.Provider value={repoConfig}>
      <SettingsContext.Provider value={appSettings}>
        <AppThemeProvider>
          <AuthGuard>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </AuthGuard>
        </AppThemeProvider>
      </SettingsContext.Provider>
    </RepoConfigContext.Provider>
  );
}

function App() {
  const auth = useAuthProvider();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: TEN_MINUTES,
        buster: '', // no cache busting — rely on maxAge
      }}
    >
      <AuthContext.Provider value={auth}>
        <AppInner />
      </AuthContext.Provider>
    </PersistQueryClientProvider>
  );
}

export default App;
