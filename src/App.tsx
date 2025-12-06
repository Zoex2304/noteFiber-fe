import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryClientProvider';
import { LogOverlay } from '@/utils/debug/LogOverlay';
import { Toaster } from 'sonner';

/**
 * Ini adalah root layout.
 * <Outlet /> akan merender halaman yang cocok
 * berdasarkan path (LandingPage, LoginPage, MainApp, dll.)
 */
export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Outlet />
          <LogOverlay />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}
