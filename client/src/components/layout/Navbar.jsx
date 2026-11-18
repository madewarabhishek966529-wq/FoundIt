import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  Search,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout as apiLogout } from '../../api/auth.api';

export const Navbar = () => {
  const { user, clearAuth, theme, toggleTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Found<span className="text-blue-600 dark:text-blue-400">It</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/browse')
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Browse
            </Link>

            {user && (
              <>
                <Link
                  to="/report/lost"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/report/lost')
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  I Lost Something
                </Link>
                <Link
                  to="/report/found"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/report/found')
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  I Found Something
                </Link>
                <Link
                  to="/my-items"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/my-items')
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  My Reports
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Browse All Items
          </Link>
          {user ? (
            <>
              <Link
                to="/report/lost"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                I Lost Something
              </Link>
              <Link
                to="/report/found"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                I Found Something
              </Link>
              <Link
                to="/my-items"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                My Reports
              </Link>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
                <span className="text-sm font-semibold">{user.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm font-semibold text-red-500"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
