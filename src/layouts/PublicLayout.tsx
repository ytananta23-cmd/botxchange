import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';

export const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col font-sans selection:bg-purple-500/30">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">BotXchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white hidden sm:block transition-colors">Log in</Link>
            <Link to="/signup" className="hidden sm:block">
              <Button variant="gradient" className="rounded-full">Get Started</Button>
            </Link>
            <button
              className="md:hidden text-white/70 hover:text-white p-2 -mr-2"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#0A0A0F]"
            >
              <nav className="flex flex-col px-4 py-4 gap-1 text-sm font-medium text-white/70">
                <a href="#features" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-white transition-colors">How it Works</a>
                <a href="#faq" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-white transition-colors">FAQ</a>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-white transition-colors sm:hidden">Log in</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="sm:hidden pt-2">
                  <Button variant="gradient" className="rounded-full w-full">Get Started</Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 bg-[#0D0D14] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="font-bold">BotXchange</span>
              </div>
              <p className="text-white/40 text-sm">Automated crypto derivatives trading for Delta Exchange India.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="https://www.delta.exchange" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Delta Exchange</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Popular Bots</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">BTC Grid Bot</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ETH DCA Bot</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Presets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-xs text-white/40 text-center leading-relaxed max-w-4xl mx-auto">
            <p>Crypto derivatives trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. BotXchange is a technology provider and does not offer financial or investment advice. You must integrate your own Delta Exchange India account to use this service.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
