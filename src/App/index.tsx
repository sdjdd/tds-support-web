import { lazy, Suspense } from 'react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { queryClient } from '@/api/query-client';
import { Spin } from '@/components/antd';
import { useCurrentUser } from './states';

const Login = lazy(() => import('./Login'));
const Admin = lazy(() => import('./Admin'));

function Fallback() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spin />
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/admin/*" element={<RequireAuth children={<Admin />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RecoilRoot>
    </QueryClientProvider>
  );
}
