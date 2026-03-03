import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Lazy loading de páginas para carregamento mais rápido
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Players = lazy(() => import('./pages/Players'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Houses = lazy(() => import('./pages/Houses'));
const Chests = lazy(() => import('./pages/Chests'));
const Bans = lazy(() => import('./pages/Bans'));
const PanelUsers = lazy(() => import('./pages/PanelUsers'));
const PanelLogs = lazy(() => import('./pages/PanelLogs'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

// Context de autenticação
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
              <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="players" element={<Suspense fallback={<PageLoader />}><Players /></Suspense>} />
              <Route path="players/:id" element={<Suspense fallback={<PageLoader />}><PlayerDetail /></Suspense>} />
              <Route path="vehicles" element={<Suspense fallback={<PageLoader />}><Vehicles /></Suspense>} />
              <Route path="houses" element={<Suspense fallback={<PageLoader />}><Houses /></Suspense>} />
              <Route path="chests" element={<Suspense fallback={<PageLoader />}><Chests /></Suspense>} />
              <Route path="bans" element={<Suspense fallback={<PageLoader />}><Bans /></Suspense>} />
              {user?.role === 'dono' && (
                <>
                  <Route path="panel-users" element={<Suspense fallback={<PageLoader />}><PanelUsers /></Suspense>} />
                  <Route path="panel-logs" element={<Suspense fallback={<PageLoader />}><PanelLogs /></Suspense>} />
                </>
              )}
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
