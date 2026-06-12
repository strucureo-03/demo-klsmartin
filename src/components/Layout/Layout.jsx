import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SidebarDrawer from './SidebarDrawer';
import { Menu, Activity, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const navigate = useNavigate();
  const { cart } = useAppContext();

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (totalCartItems === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [totalCartItems]);

  return (
    <div className="mobile-app-container">
      {/* Top App Bar */}
      <header className="mobile-top-bar glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="icon-btn" 
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="mobile-logo" onClick={() => navigate('/')}>
            <Activity size={20} color="var(--accent-primary)" />
            <span>IMPL</span>
          </div>
        </div>

        <div className="mobile-top-bar-actions">
          <button 
            className={`top-bar-cart-btn ${isBumping ? 'bump' : ''}`} 
            onClick={() => navigate('/billing')}
            aria-label="View Cart"
          >
            <ShoppingCart size={22} />
            {totalCartItems > 0 && (
              <span className="cart-badge-pill">{totalCartItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mobile-main-content">
        <Outlet />
      </main>

      {/* Slide-out Navigation Drawer */}
      <SidebarDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      {/* Overlay for clicking outside to close drawer */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
