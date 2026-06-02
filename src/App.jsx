import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './mobile.css';
import { AppProvider, useAppContext } from './context/AppContext';

import Layout from './components/Layout/Layout';
import ChatPage from './pages/ChatPage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import ScanPage from './pages/ScanPage';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import BillingPage from './pages/BillingPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout wrapper to inject protection
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
);

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<ChatPage />} />
            <Route path="catalog/:type" element={<CatalogPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route 
              path="inventory" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <InventoryPage />
                </ProtectedRoute>
              } 
            />
            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
