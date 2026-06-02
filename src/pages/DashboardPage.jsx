import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import StatsCards from '../components/Dashboard/StatsCards';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentSearches from '../components/Dashboard/RecentSearches';
import AvailabilityBadge from '../components/Product/AvailabilityBadge';
import { useAppContext } from '../context/AppContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { inventory: products } = useAppContext();

  // Get top 5 critical stock items (out of stock, then low stock)
  const criticalItems = products
    .filter(p => p.availability.status === 'out-of-stock' || p.availability.status === 'low-stock')
    .sort((a, b) => {
      if (a.availability.status === 'out-of-stock' && b.availability.status !== 'out-of-stock') return -1;
      if (a.availability.status !== 'out-of-stock' && b.availability.status === 'out-of-stock') return 1;
      return a.availability.totalQuantity - b.availability.totalQuantity;
    })
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">Biomedical Inventory Hub</h1>
        <p className="page-subtitle">KLS Martin Surgical Instrument Availability & Tracking System</p>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards />

      {/* Grid Layout for Quick Operations, Recent Searches, and Critical Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Critical Items Panel */}
          <div className="panel glass-panel">
            <div className="panel-header">
              <h3 className="panel-title" style={{ color: 'var(--accent-danger)' }}>
                <AlertOctagon size={18} />
                Critical Inventory Gaps
              </h3>
              <button 
                onClick={() => navigate('/search?filter=critical')}
                style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {criticalItems.map(p => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  className="critical-stock-row"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      REF: <span style={{ fontFamily: 'monospace' }}>{p.primaryRef}</span> | {p.category} | {p.catalog === 'general-surgery' ? 'General Surgery' : 'Neurosurgery'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.availability.status === 'out-of-stock' ? '0 units' : `${p.availability.totalQuantity} units`}
                    </span>
                    <AvailabilityBadge status={p.availability.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recent Searches */}
          <RecentSearches />
          
          {/* System Health Card */}
          <div className="panel glass-panel" style={{ 
            background: 'linear-gradient(135deg, rgba(0, 229, 163, 0.03) 0%, rgba(90, 120, 255, 0.03) 100%)',
            border: '1px solid rgba(0, 229, 163, 0.1)'
          }}>
            <h3 className="panel-title" style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
              Scanner Interface Status
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
              Biomedical scanning gateways are fully operational. Simulated UDI matching engine running successfully on 316 unique medical instruments.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: 'rgba(0, 229, 163, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Cpu size={10} /> Gateway: Online
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: 'rgba(90, 120, 255, 0.1)', color: '#a5b4fc', borderRadius: '4px' }}>
                DB Sync: 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
