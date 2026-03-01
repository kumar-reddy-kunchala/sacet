import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans flex flex-col">
      <header className="bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-yellow-400 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <span className="font-display text-2xl tracking-tighter uppercase bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              TECHTRECK
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {[
              { path: '/', label: 'Home' },
              { path: '/round1', label: 'Round 1' },
              { path: '/round2', label: 'Round 2' },
              { path: '/round3', label: 'Round 3' },
              { path: '/admin', label: 'Admin' }
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-yellow-400 ${
                  location.pathname === item.path ? 'text-yellow-400' : 'text-gray-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {children}
      </main>

      {location.pathname !== '/' && (
        <footer className="border-t border-white/5 py-12 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
              Department of CSE - TechTreck 2026
            </p>
            <p className="text-[10px] font-medium text-gray-800 uppercase tracking-widest">
              © 2026 Sri Aditya College of Engineering & Technology
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
