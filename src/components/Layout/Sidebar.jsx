import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Scissors, Brain, Search, ScanLine, Activity, Package, CreditCard, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { user, logout } = useAppContext();

  return (
    <aside className="sidebar glass-panel">
      <div>
        <div className="sidebar-logo">
          <Activity className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">KLS Martin</span>
        </div>
        
        <nav className="sidebar-nav">
          <span className="sidebar-nav-title">Navigation</span>
          
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>
          
          <span className="sidebar-nav-title">Catalogs</span>
          
          <NavLink to="/catalog/general-surgery" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Scissors className="sidebar-icon" />
            <span>General Surgery</span>
          </NavLink>
          
          <NavLink to="/catalog/neurosurgery" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Brain className="sidebar-icon" />
            <span>Neurosurgery</span>
          </NavLink>
          
          <span className="sidebar-nav-title">Tools</span>
          
          <NavLink to="/search" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Search className="sidebar-icon" />
            <span>Fuzzy Search</span>
          </NavLink>
          
          <NavLink to="/scan" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <ScanLine className="sidebar-icon" />
            <span>Barcode Scan</span>
          </NavLink>

          {/* New Billing POS */}
          <NavLink to="/billing" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <CreditCard className="sidebar-icon" />
            <span>Point of Sale</span>
          </NavLink>

          {/* New Admin Inventory */}
          {user?.role === 'admin' && (
            <>
              <span className="sidebar-nav-title">Administration</span>
              <NavLink to="/inventory" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
                <Package className="sidebar-icon" />
                <span>Inventory Mgt</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
      
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={logout} className="scan-action-btn" style={{ padding: '0.5rem', background: 'rgba(var(--accent-danger-rgb), 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(var(--accent-danger-rgb), 0.2)', boxShadow: 'none' }}>
          <LogOut size={16} /> Logout
        </button>
        <span style={{ fontSize: '0.65rem' }}>Strucureo Biomedical v2.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
