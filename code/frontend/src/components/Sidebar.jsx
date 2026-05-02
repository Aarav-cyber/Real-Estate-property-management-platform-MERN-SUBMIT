import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, FileText, CreditCard,
  ClipboardList, LogOut, ChevronRight, Home, X
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const ownerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Building2, label: 'Properties', to: '/properties' },
    { icon: FileText, label: 'Leases', to: '/leases' },
    { icon: CreditCard, label: 'Payments', to: '/payments' },
    { icon: ClipboardList, label: 'Requests', to: '/requests' },
  ];

  const tenantLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Building2, label: 'Browse Properties', to: '/properties' },
    { icon: FileText, label: 'My Leases', to: '/leases' },
    { icon: CreditCard, label: 'Payments', to: '/payments' },
  ];

  const links = user?.role === 'owner' ? ownerLinks : tenantLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-800/95 backdrop-blur-xl border-r border-white/5 z-40
          flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">Real<span className="gradient-text">Est</span></span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white" id="sidebar-close">
            <X size={18} />
          </button>
        </div>

        {/* User Badge */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/15">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.role?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-primary-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              id={`sidebar-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {location.pathname === to && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <Link to="/" className="sidebar-link" id="sidebar-home">
            <Home size={17} /> <span>Go to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
            id="sidebar-logout"
          >
            <LogOut size={17} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
