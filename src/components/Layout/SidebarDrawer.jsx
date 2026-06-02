import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Package, CreditCard, LogOut, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const SidebarDrawer = ({ isOpen, onClose }) => {
  const { user, logout, cart } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <aside className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text" style={{ fontSize: '1.25rem' }}>Menu</span>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      
      <div className="drawer-content">
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={onClose} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare className="sidebar-icon" />
            <span>Assistant</span>
          </NavLink>

          <NavLink to="/billing" onClick={onClose} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <CreditCard className="sidebar-icon" />
              <span>Billing Cart</span>
            </div>
            {totalCartItems > 0 && (
              <span className="cart-badge">{totalCartItems}</span>
            )}
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <div className="drawer-divider" />
              <span className="sidebar-nav-title">Admin</span>
              <NavLink to="/inventory" onClick={onClose} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
                <Package className="sidebar-icon" />
                <span>Inventory Master</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
      
      <div className="drawer-footer">
        <button onClick={handleLogout} className="drawer-logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default SidebarDrawer;
