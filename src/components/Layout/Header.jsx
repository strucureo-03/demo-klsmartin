import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, inventory: products } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Calculate low stock and out of stock items
  const alertItems = products
    .filter(p => p.availability.status === 'low-stock' || p.availability.status === 'out-of-stock')
    .slice(0, 5); // Keep top 5 for notifications dropdown

  const totalAlerts = products.filter(p => p.availability.status === 'low-stock' || p.availability.status === 'out-of-stock').length;

  return (
    <header className="header glass-panel">
      <button 
        className="header-search-trigger" 
        onClick={() => navigate('/search')}
      >
        <Search size={16} className="search-icon" />
        <span>Search REF, instrument name...</span>
        <span className="header-search-shortcut">/</span>
      </button>

      <div className="header-actions">
        {/* Notification Center */}
        <div style={{ position: 'relative' }}>
          <button 
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {totalAlerts > 0 && <span className="header-notification-badge" />}
          </button>
          
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '320px',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              zIndex: '150',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>System Alerts</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255, 71, 87, 0.1)', color: 'var(--accent-danger)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {totalAlerts} critical
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {alertItems.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/product/${p.id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <AlertTriangle 
                      size={16} 
                      style={{ 
                        color: p.availability.status === 'out-of-stock' ? 'var(--accent-danger)' : 'var(--accent-warning)', 
                        flexShrink: 0,
                        marginTop: '2px' 
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        REF: {p.primaryRef} - {p.availability.status === 'out-of-stock' ? 'Out of Stock' : `${p.availability.totalQuantity} Units Left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/search?filter=critical');
                }}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.5rem 0',
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  marginTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                View All Alert Instruments
              </button>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="header-profile">
          <div className="header-profile-avatar">{user?.name ? user.name.substring(0,2).toUpperCase() : 'BM'}</div>
          <div className="header-profile-info">
            <span className="header-profile-name">{user?.name || 'Guest User'}</span>
            <span className="header-profile-role">{user?.role === 'admin' ? 'System Administrator' : 'Staff Member'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
