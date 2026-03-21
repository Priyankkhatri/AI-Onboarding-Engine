import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Upload, BarChart3, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Analyze', icon: Upload },
    { path: '/results', label: 'Results', icon: BarChart3 },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-dark-50/30 bg-dark-500/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/30 transition-shadow">
              <Sparkles className="w-5 h-5 text-dark-500" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-white tracking-tight">
                Onboard<span className="gold-text-gradient">AI</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-gold-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-50/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-gold-500/10 border border-gold-500/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
