import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ShellLayout from '@/components/ShellLayout/ShellLayout';
import HomePage from '@/pages/Home.page';
import LoginPage from '@/pages/Login.page';
import RegisterPage from '@/pages/Register.page';
import EventsPage from "@/pages/Events.page";
import EventDetailPage from "@/pages/Event.page";

const router = createBrowserRouter([

  {
    element: <ShellLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
    ],
  },

]);

export function Router() {
  return <RouterProvider router={router} />;
}