import { lazy, Suspense } from 'react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { queryClient } from '@/api/query-client';
import { Spin } from '@/components/antd';

const Login = lazy(() => import('./Login'));
const Admin = lazy(() => import('./Admin'));

function Fallback() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spin />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<div>tds support</div>} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/login" element={<Login />} />
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
