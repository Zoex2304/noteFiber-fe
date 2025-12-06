import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import root layout
import App from '@/App.tsx';

// Import pages
import MainApp from '@/pages/MainApp.tsx';
import LandingPage from '@/pages/landingpage/LandingPage.tsx';
import NotFoundPage from '@/pages/NotFoundPage.tsx';
import SignUp from '@/pages/auth/SignUp';
import SignIn from '@/pages/auth/SignIn';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import ValidateCode from '@/pages/auth/ValidateCode';
import Checkout from '@/pages/checkout/Checkout';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Default development start page
const DEV_START_PAGE = '/landing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Navigate to={DEV_START_PAGE} replace />,
      },
      {
        path: 'landing',
        element: <LandingPage />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
      {
        path: 'signin',
        element: <SignIn />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'validate-code',
        element: <ValidateCode />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: 'checkout',
            element: <Checkout />,
          },
          {
            path: 'app',
            element: <MainApp />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
