import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ScanLine, Scissors, Brain, Compass } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Fuzzy Lookup',
      desc: 'Fuzzy search by name, REF code, size, eponymous surgeon, or surgical category.',
      icon: Search,
      colorRgb: '0, 229, 163', // Neon Teal
      path: '/search'
    },
    {
      title: 'Scan Barcode / UDI',
      desc: 'Simulate barcode scanners or input raw GS1-128 UDI strings to retrieve product logs.',
      icon: ScanLine,
      colorRgb: '255, 71, 87', // Coral Red
      path: '/scan'
    },
    {
      title: 'General Surgery',
      desc: 'Browse general operating instruments, forceps, scissors, scalpels, and retractors.',
      icon: Scissors,
      colorRgb: '90, 120, 255', // Indigo
      path: '/catalog/general-surgery'
    },
    {
      title: 'Neurosurgery Catalog',
      desc: 'Access specialized neurological retractors, pituitary micro-forceps, and rongeurs.',
      icon: Brain,
      colorRgb: '168, 85, 247', // Purple
      path: '/catalog/neurosurgery'
    }
  ];

  return (
    <div className="panel glass-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <Compass size={18} style={{ color: 'var(--accent-primary)' }} />
          Quick Operations
        </h3>
      </div>
      
      <div className="quick-actions-grid">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              className="quick-action-btn"
              style={{ '--btn-accent-rgb': act.colorRgb }}
              onClick={() => navigate(act.path)}
            >
              <div className="quick-action-icon-wrapper">
                <Icon size={20} />
              </div>
              <div className="quick-action-btn-title">{act.title}</div>
              <div className="quick-action-btn-desc">{act.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
