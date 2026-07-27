import { useCheckAuth } from '../../hooks/useAuth';
import { useLocation, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useCheckAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 bg-[#2E7D32]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-16 h-16 bg-[#2E7D32]/30 rounded-full animate-pulse"></div>
          <div className="relative z-10 w-12 h-12 bg-[#2E7D32] rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20 transform rotate-3">
            <BookOpen className="w-6 h-6 text-white transform -rotate-3 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-heading tracking-tight mb-2">RAG Book.</h2>
        <p className="text-sm text-[#2E7D32] font-medium animate-pulse">Connecting to knowledge base...</p>
      </div>
    );
  }

  if (isError && !isAuthPage && !isLandingPage) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!isError && (isAuthPage || isLandingPage)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}
