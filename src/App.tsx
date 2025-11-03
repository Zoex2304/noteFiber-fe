import { Outlet } from 'react-router-dom';

/**
 * Ini adalah root layout.
 * <Outlet /> akan merender halaman yang cocok
 * berdasarkan path (LandingPage, LoginPage, MainApp, dll.)
 */
export default function App() {
  return (
    <div className="h-screen w-screen">
      <Outlet />
    </div>
  );
}
