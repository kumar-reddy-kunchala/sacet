import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Home, Info } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans">
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">SACETRAJATHOTSAV</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Home
            </Link>
            <Link 
              to="/round1" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/round1' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Round 1
            </Link>
            <Link 
              to="/round2" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/round2' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Round 2
            </Link>
            <Link 
              to="/round3" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/round3' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Round 3
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-top border-black/5 py-8 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2026 SACET Silver Jubilee Celebrations. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
