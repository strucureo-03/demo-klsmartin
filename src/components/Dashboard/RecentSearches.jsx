import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowRight } from 'lucide-react';

const RecentSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('kls_recent_searches');
    if (saved) {
      try {
        setSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default placeholder searches for demo if empty
      const defaultSearches = [
        { term: 'Mayo Scissors', timestamp: '10 mins ago', count: 12 },
        { term: '15-776-31-07', timestamp: '1 hour ago', count: 1 },
        { term: 'Cushing Pituitary Rongeur', timestamp: '2 hours ago', count: 4 },
        { term: 'Forceps', timestamp: '4 hours ago', count: 117 }
      ];
      setSearches(defaultSearches);
      localStorage.setItem('kls_recent_searches', JSON.stringify(defaultSearches));
    }
  }, []);

  const handleSearchClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearAll = () => {
    localStorage.removeItem('kls_recent_searches');
    setSearches([]);
  };

  return (
    <div className="panel glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <History size={18} style={{ color: 'var(--accent-primary)' }} />
          Recent Searches
        </h3>
        {searches.length > 0 && (
          <button 
            onClick={handleClearAll}
            style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: 600 }}
          >
            Clear History
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No search history yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {searches.slice(0, 5).map((s, idx) => (
            <div
              key={idx}
              onClick={() => handleSearchClick(s.term)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              className="recent-search-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <Search size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.term}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {s.timestamp}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {s.count && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {s.count} hits
                  </span>
                )}
                <ArrowRight size={14} className="arrow-icon" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearches;
