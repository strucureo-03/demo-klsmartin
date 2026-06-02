import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, FileText, Ruler } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

const ProductCard = ({ product, viewMode = 'grid', searchQuery = '' }) => {
  const isList = viewMode === 'list';
  const displayRef = product.primaryRef || (product.refNumbers && product.refNumbers[0]) || 'N/A';
  const sizes = product.availableSizes || [];

  // Determine if a size matches the search query (highlight it)
  const getMatchedSizes = () => {
    if (!searchQuery || sizes.length === 0) return { matched: [], others: sizes };
    const q = searchQuery.toLowerCase().trim();
    const matched = sizes.filter(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()));
    const others = sizes.filter(s => !matched.includes(s));
    return { matched, others };
  };
  const { matched: matchedSizes, others: otherSizes } = getMatchedSizes();
  
  return (
    <div className={`product-card glass-panel-interactive ${isList ? 'list-view' : ''}`}>
      <div className="product-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span className={`catalog-tag ${product.catalog}`}>
            {product.catalog === 'general-surgery' ? 'General Surgery' : 'Neurosurgery'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {product.category}
          </span>
        </div>
        <AvailabilityBadge status={product.availability.status} />
      </div>

      <div className="product-info-body" style={{ flex: 1 }}>
        <h3 className="product-card-title">{product.name}</h3>
        
        <div className="product-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={12} />
            REF: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{displayRef}</span>
          </span>
          {product.totalVariants > 1 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
              <Layers size={12} />
              {product.totalVariants} variants
            </span>
          )}
        </div>

        {/* Available Sizes Row */}
        {sizes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <Ruler size={12} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
            {/* Show matched sizes first, highlighted */}
            {matchedSizes.map((s, i) => (
              <span key={`m-${i}`} style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: 'rgba(var(--accent-primary-rgb), 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(var(--accent-primary-rgb), 0.3)',
                fontWeight: 700
              }}>
                {s} ✓
              </span>
            ))}
            {/* Then remaining sizes, muted */}
            {otherSizes.slice(0, isList ? 8 : 5).map((s, i) => (
              <span key={`o-${i}`} style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.03)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)'
              }}>
                {s}
              </span>
            ))}
            {otherSizes.length > (isList ? 8 : 5) && (
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                +{otherSizes.length - (isList ? 8 : 5)} more
              </span>
            )}
          </div>
        )}
        
        {!isList && <p className="product-desc">{product.description}</p>}
      </div>

      {isList && <p className="product-desc" style={{ flex: 1 }}>{product.description}</p>}

      <div className="product-card-footer">
        <div className="product-price-range">
          <span className="price-label">Price Est.</span>
          <span className="price-value">
            ${product.priceRange.min} - ${product.priceRange.max}
          </span>
        </div>
        
        <Link 
          to={`/product/${product.id}`}
          className="scan-action-btn"
          style={{ 
            padding: '0.45rem 1rem', 
            fontSize: '0.8rem', 
            boxShadow: 'none', 
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none' 
          }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
