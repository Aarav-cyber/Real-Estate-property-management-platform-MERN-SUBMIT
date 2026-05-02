import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-lg border-b border-white/5 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              id="sidebar-open-btn"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white font-display">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors relative" id="notifications-btn">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white capitalize">
              {user?.role?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
