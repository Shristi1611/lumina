import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShelfProvider } from './context/ShelfContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import BookDetail from './pages/BookDetail';
import Shelf from './pages/Shelf';
import PomodoroPage from './pages/PomodoroPage';
import Dashboard from './pages/Dashboard';
// Replace lines 14 and 15 with these:
import Login, { Register } from './pages/Login';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash-loading"><span>💅</span></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash-loading"><span>💅</span></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="book/:id" element={<BookDetail />} />
        <Route path="shelf" element={<ProtectedRoute><Shelf /></ProtectedRoute>} />
        <Route path="pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShelfProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Playfair Display', serif",
                background: '#fff0f5',
                color: '#7a1e4b',
                border: '1px solid #f4a7c3',
                borderRadius: '12px',
              },
            }}
          />
        </ShelfProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
