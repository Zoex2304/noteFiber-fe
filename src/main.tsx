import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import router modular kita
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Ganti <App /> dengan <RouterProvider /> */}
    <RouterProvider router={router} />
  </StrictMode>
);
