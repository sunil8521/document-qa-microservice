import { useCheckAuth } from '../../hooks/useAuth';
import { useLocation, Navigate } from 'react-router-dom';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useCheckAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-[#2E7D32]"></div>
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
