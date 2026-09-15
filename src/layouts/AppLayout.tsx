import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Bot, ArrowLeftRight, Settings, LogOut } from 'lucide-react';
import { authApi, getAuthToken } from '../api/client';

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // /app/* isn't just protected by the backend rejecting unauthenticated
  // API calls — it also needs to redirect anyone without a valid session
  // to /login, rather than silently rendering an empty-looking dashboard
  // (which is what happened before: pages caught the 401s and just showed
  // "no accounts yet", indistinguishable from a real new user).
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }

    authApi.getMe()
      .then(() => { if (!cancelled) setCheckingAuth(false); })
      .catch(() => { if (!cancelled) navigate('/login', { replace: true }); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { to: '/app/accounts', icon: LayoutDashboard, label: 'Accounts' },
    { to: '/app/bots', icon: Bot, label: 'My Bots' },
    { to: '/app/trade', icon: ArrowLeftRight, label: 'Trade' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white overflow-hidden relative">
      <div className="ambient-glow w-[400px] h-[400px] bg-purple-600/[0.04] top-0 left-1/3 pointer-events-none" />
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#0D0D14] flex flex-col hidden md:flex relative z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">BotXchange</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/5"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-purple-500/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-purple-400' : ''}`} />
                <span className={`relative z-10 ${isActive ? 'text-purple-400 font-medium' : ''}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 w-full text-left transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0D0D14] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-bold">BotXchange</span>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-[#0D0D14] flex items-stretch z-40">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 text-xs text-white/50"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                <span className={isActive ? 'text-purple-400' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
