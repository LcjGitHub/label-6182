import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DeckPresetPage from './pages/DeckPresetPage';
import RecordFormPage from './pages/RecordFormPage';
import RecordListPage from './pages/RecordListPage';
import SpreadTemplatePage from './pages/SpreadTemplatePage';
import StatisticsPage from './pages/StatisticsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5e35b1' },
    secondary: { main: '#ff6f00' },
    background: { default: '#f5f3fa' },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** 应用根组件 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<RecordListPage />} />
              <Route path="templates" element={<SpreadTemplatePage />} />
              <Route path="decks" element={<DeckPresetPage />} />
              <Route path="stats" element={<StatisticsPage />} />
              <Route path="records/new" element={<RecordFormPage />} />
              <Route path="records/:id/edit" element={<RecordFormPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
