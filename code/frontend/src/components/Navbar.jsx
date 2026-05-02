import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Building2, Menu, X, ChevronDown, Bell, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  const isLandingPage = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || !isLandingPage
          ? 'bg-dark-900/90 backdrop-blur-lg border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Real<span className="gradient-text">Est</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {isLandingPage && navLinks.map(({ label, href }) => (
              <a key={label} href={href} className="nav-link">{label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link flex items-center gap-1.5">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-all duration-200"
                    id="user-menu-btn"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                      {user?.role?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 capitalize">{user?.role}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-48 card py-1 border border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        id="logout-btn"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 text-sm" id="nav-login-btn">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 text-sm" id="nav-register-btn">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-gray-400" onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-toggle">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-lg border-t border-white/5 px-4 py-4 flex flex-col gap-3 animate-slide-up">
          {isLandingPage && navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="nav-link py-2" onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-sm text-red-400 py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary justify-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
