import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { products } from '../../data/products';

const StatsCards = () => {
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.availability.status === 'in-stock').length;
  const lowStockCount = products.filter(p => p.availability.status === 'low-stock').length;
  const outOfStockCount = products.filter(p => p.availability.status === 'out-of-stock').length;
  const orderedCount = products.filter(p => p.availability.status === 'ordered').length;

  const cards = [
    {
      title: 'Total Catalog Products',
      value: totalProducts,
      icon: Layers,
      colorRgb: '90, 120, 255', // Indigo
      footerText: 'General & Neurosurgery items',
      trend: { type: 'up', text: 'Real data from PDF' }
    },
    {
      title: 'Available In Stock',
      value: inStockCount,
      icon: CheckCircle2,
      colorRgb: '0, 229, 163', // Neon Teal
      footerText: 'Ready for operation room',
      trend: { type: 'up', text: `${Math.round((inStockCount / totalProducts) * 100)}% of catalog` }
    },
    {
      title: 'Low Stock Warnings',
      value: lowStockCount,
      icon: AlertTriangle,
      colorRgb: '255, 184, 0', // Amber
      footerText: 'Reorder triggered',
      trend: { type: 'down', text: 'Requires attention' }
    },
    {
      title: 'Out of Stock / Backorder',
      value: outOfStockCount + orderedCount,
      icon: XCircle,
      colorRgb: '255, 71, 87', // Red
      footerText: `${orderedCount} currently on backorder`,
      trend: { type: 'down', text: 'Critical inventory gaps' }
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="stats-card glass-panel" 
            style={{ '--card-accent-rgb': card.colorRgb } }
          >
            <div className="stats-card-header">
              <span className="stats-card-title">{card.title}</span>
              <div className="stats-card-icon-container">
                <Icon size={20} />
              </div>
            </div>
            
            <div>
              <div className="stats-card-value">{card.value}</div>
              <div className="stats-card-footer">
                {card.trend.type === 'up' ? (
                  <span className="stats-card-trend-up">{card.trend.text}</span>
                ) : (
                  <span className="stats-card-trend-down">{card.trend.text}</span>
                )}
                <span className="stats-card-trend-text">{card.footerText}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
