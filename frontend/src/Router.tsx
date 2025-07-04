import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ShellLayout from '@/components/ShellLayout/ShellLayout';
import { HomePage } from '@/pages/Home.page';
import LoginPage from '@/pages/Login.page';
import RegisterPage from '@/pages/Register.page';

const router = createBrowserRouter([
  // --- layout route (wraps everything that should show nav + header) ---
  {
    element: <ShellLayout />,           // no path -> acts as pure layout
    children: [
      { index: true, element: <HomePage /> },
      // add more protected pages here
    ],
  },

  // --- routes that bypass the layout ---
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}