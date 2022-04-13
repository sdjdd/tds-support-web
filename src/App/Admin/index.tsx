import { Navigate, Route, Routes } from 'react-router-dom';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

import Tickets from './Tickets';
import Settings from './Settings';

export default function AdminPage() {
  return (
    <div className="grid grid-cols-[64px_1fr] h-full bg-[#ebeff3]">
      <Sidebar className="z-40" />
      <div className="grid grid-rows-[64px_1fr] overflow-hidden">
        <Topbar />
        <div className="overflow-hidden">
          <Routes>
            <Route path="/tickets/*" element={<Tickets />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
