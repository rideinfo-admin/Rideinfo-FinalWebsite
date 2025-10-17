import { useState, useEffect } from 'react';
import { authService } from './services/auth';
import Login from './pages/Login';
import Layout from './components/Layout';
import InstituteManagement from './pages/InstituteManagement';
import Analysis from './pages/Analysis';
import Complaints from './pages/Complaints';

type Page = 'institutes' | 'analysis' | 'complaints';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('institutes');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('institutes');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {currentPage === 'institutes' && <InstituteManagement />}
      {currentPage === 'analysis' && <Analysis />}
      {currentPage === 'complaints' && <Complaints />}
    </Layout>
  );
}

export default App;
