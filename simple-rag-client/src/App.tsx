import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/AuthPage';
import { ChatDashboard } from './pages/ChatDashboard';
import { AuthProvider } from './components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';


function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
  const isChatPage = location.pathname === '/chat' || location.pathname.startsWith('/c/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isChatPage && <Navbar />}
      <main className="flex-1">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/chat" element={<ChatDashboard />} />
            <Route path="/c/:sessionId" element={<ChatDashboard />} />
          </Routes>
        </AuthProvider>
      </main>
      {!isAuthPage && !isChatPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
