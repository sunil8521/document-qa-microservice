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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
