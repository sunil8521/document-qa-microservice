import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GiWhiteBook } from 'react-icons/gi';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogoutMutation } from '../../hooks/useAuth';

export function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/')
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex h-[64px] md:h-[72px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <GiWhiteBook className="w-8 h-8 text-[#2E7D32] group-hover:text-[#1B5E20] transition-colors" />
            <span className="font-heading text-[22px] font-extrabold tracking-tight text-gray-900 group-hover:text-[#1B5E20] transition-colors">
              RAG Book<span className="text-[#2E7D32]">.</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-[13px] font-semibold text-gray-900 hover:text-[#2E7D32] transition-colors">Home</Link>
            <a href="#features" className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className="text-sm font-semibold bg-[#2E7D32] text-white px-5 py-2.5 rounded-full hover:bg-[#1B5E20] transition-all hover:shadow-lg hover:shadow-green-100"
              >
                Go to Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth?mode=login"
                className="text-[13px] font-bold text-gray-700 hover:text-[#2E7D32] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="text-[13px] font-bold bg-[#2E7D32] text-white px-6 py-2.5 rounded-full hover:bg-[#1B5E20] transition-all hover:shadow-lg hover:shadow-green-100"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <GiWhiteBook className="w-8 h-8 text-[#2E7D32]" />
              <span className="font-heading text-[22px] font-extrabold tracking-tight text-gray-900">
                RAG Book<span className="text-[#2E7D32]">.</span>
              </span>
            </Link>
            <button
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-lg font-bold text-gray-900" onClick={() => setMobileOpen(false)}>Home</Link>
              <a href="#features" className="text-lg font-bold text-gray-500 hover:text-gray-900" onClick={() => setMobileOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-lg font-bold text-gray-500 hover:text-gray-900" onClick={() => setMobileOpen(false)}>How it Works</a>
            </nav>
            
            <div className="h-px bg-gray-100 w-full" />
            
            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center text-sm font-bold bg-[#2E7D32] text-white px-5 py-3.5 rounded-xl hover:bg-[#1B5E20] transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full text-center text-sm font-bold border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center text-sm font-bold border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center text-sm font-bold bg-[#2E7D32] text-white px-5 py-3.5 rounded-xl hover:bg-[#1B5E20] transition-colors"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
