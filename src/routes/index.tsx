import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import root layout kita
import App from '@/App.tsx';

// Import halaman-halaman Anda
import MainApp from '@/pages/MainApp.tsx';
// DIPERBARUI: Path diubah ke arsitektur sub-folder yang baru
import LandingPage from '@/pages/landingpage/LandingPage.tsx';
// import LoginPage from '@/pages/LoginPage'; // Untuk nanti
import NotFoundPage from '@/pages/NotFoundPage.tsx';

// --- INI YANG ANDA MINTA ---
// Ubah variabel ini untuk mengganti halaman default saat development
// Opsi: '/landing', '/login', '/app'
const DEV_START_PAGE = '/landing';
// -----------------------------

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Layout shell (src/App.tsx baru)
    errorElement: <NotFoundPage />, // Tambahkan errorElement di level atas
    children: [
      {
        // Halaman index (/) akan me-redirect ke DEV_START_PAGE
        index: true,
        element: <Navigate to={DEV_START_PAGE} replace />,
      },
      {
        path: 'landing',
        element: <LandingPage />,
      },
      // {
      //   path: 'login',
      //   element: <LoginPage />,
      // },
      {
        path: 'app',
        element: <MainApp />, // Ini adalah aplikasi note-taker Anda yang lama
      },
      {
        // Catch-all route untuk 404 (sekarang di dalam children)
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;

