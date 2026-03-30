import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
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
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <AppInner />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
