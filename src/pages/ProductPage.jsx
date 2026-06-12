import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, Calendar, Truck, Clipboard, Check, Eye, Package, ExternalLink, HelpCircle } from 'lucide-react';
import AvailabilityBadge from '../components/Product/AvailabilityBadge';
import ProductCard from '../components/Product/ProductCard';
import { vendors } from '../data/products';
import { useAppContext } from '../context/AppContext';

const ProductPage = () => {
  const { inventory: products } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedUdi, setCopiedUdi] = useState('');
  const [selectedVariantRef, setSelectedVariantRef] = useState('');

  // Find the current product
  const product = useMemo(() => {
    return products.find(p => p.id === id);
  }, [id]);

  // Find related products (same category, same catalog, excluding current)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.catalog === product.catalog && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  // Find vendors for this product
  const productVendors = useMemo(() => {
    if (!product) return [];
    return vendors.filter(v => product.vendors.includes(v.id));
  }, [product]);

  // If product not found
  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <HelpCircle size={64} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
        <h2>Instrument Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The requested surgical instrument does not exist in IMPL's parsed catalog.</p>
        <Link to="/" className="scan-action-btn" style={{ padding: '0.6rem 1.2rem' }}>Back to Dashboard</Link>
      </div>
    );
  }

  // Handle UDI copy feedback
  const handleCopyUdi = (udi) => {
    navigator.clipboard.writeText(udi);
    setCopiedUdi(udi);
    setTimeout(() => setCopiedUdi(''), 2000);
  };

  const handleSimulateScan = (udi) => {
    navigate(`/scan?udi=${encodeURIComponent(udi)}`);
  };

  const primaryRef = product.primaryRef || product.refNumbers[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back navigation and title */}
      <div>
        <button 
          onClick={() => window.history.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', background: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`catalog-tag ${product.catalog}`}>
                {product.catalog === 'general-surgery' ? 'General Surgery' : 'Neurosurgery'}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Tag size={12} /> {product.category}
              </span>
            </div>
            <h1 className="product-detail-title">{product.name}</h1>
          </div>
          <AvailabilityBadge status={product.availability.status} />
        </div>
      </div>

      {/* Main product detail grid */}
      <div className="product-detail-layout">
        {/* Left Side: General Info, Description, Variants Table */}
        <div className="product-detail-main">
          {/* Overview & Description Card */}
          <div className="detail-section-card glass-panel">
            <h3 className="detail-desc-title">Description & Intended Use</h3>
            <p className="detail-desc-text">{product.description}</p>
            
            <div className="specs-grid" style={{ marginTop: '2rem' }}>
              <div className="spec-item">
                <span className="spec-label">Brand</span>
                <span className="spec-value">{product.brand}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Manufacturer</span>
                <span className="spec-value">{product.manufacturer}</span>
              </div>
              {product.eponymousName && (
                <div className="spec-item">
                  <span className="spec-label">Eponymous Name</span>
                  <span className="spec-value">{product.eponymousName}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Catalog Pages</span>
                <span className="spec-value">Pages {product.catalogPages.join(', ')}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Primary REF Code</span>
                <span className="spec-value" style={{ fontFamily: 'monospace' }}>{primaryRef}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Total Variants</span>
                <span className="spec-value">{product.totalVariants} sizes/types</span>
              </div>
            </div>
          </div>

          {/* Variants and Sizes Table */}
          <div className="detail-section-card glass-panel">
            <h3 className="detail-desc-title" style={{ marginBottom: '1.25rem' }}>
              Catalog Variants & Stock Levels
            </h3>
            
            <div className="variant-table-container">
              <table className="variant-table">
                <thead>
                  <tr>
                    <th>REF Number</th>
                    <th>Size / Type</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>UDI / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v, idx) => (
                    <tr 
                      key={v.refNumber}
                      style={{ 
                        background: selectedVariantRef === v.refNumber ? 'rgba(0, 229, 163, 0.03)' : 'none' 
                      }}
                      onClick={() => setSelectedVariantRef(v.refNumber)}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <span className="ref-code-link">{v.refNumber}</span>
                      </td>
                      <td>{v.size}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>${v.price.toFixed(2)}</td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: v.status === 'in-stock' ? 'var(--accent-primary)' 
                                 : v.status === 'low-stock' ? 'var(--accent-warning)'
                                 : v.status === 'ordered' ? '#818cf8'
                                 : 'var(--accent-danger)' 
                        }}>
                          {v.status === 'in-stock' ? `In Stock (${v.quantity})`
                           : v.status === 'low-stock' ? `Low Stock (${v.quantity})`
                           : v.status === 'ordered' ? 'On Backorder'
                           : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUdi(v.udi);
                            }}
                            className="view-toggle-btn"
                            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
                            title="Copy GS1 UDI Barcode string"
                          >
                            {copiedUdi === v.udi ? <Check size={12} style={{ color: 'var(--accent-primary)' }} /> : <Clipboard size={12} />}
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateScan(v.udi);
                            }}
                            style={{ 
                              padding: '0.2rem 0.5rem', 
                              background: 'rgba(255,255,255,0.03)', 
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            title="Simulate Scanner Lookup"
                          >
                            Scan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Stock details, warehouse info, suppliers */}
        <div className="product-detail-panel">
          {/* Quick Stats Panel */}
          <div className="action-card glass-panel">
            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)' }}>Inventory Summary</h4>
            <div className="action-card-price">
              ${product.priceRange.min.toFixed(2)} - ${product.priceRange.max.toFixed(2)}
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '0.25rem' }}>Estimated Unit Price</span>
            </div>

            <div className="inventory-grid">
              <div className="inventory-item">
                <span className="inventory-label">Total Units</span>
                <div className="inventory-value">{product.availability.totalQuantity}</div>
              </div>
              <div className="inventory-item">
                <span className="inventory-label">Logistics Status</span>
                <div className="inventory-value" style={{ 
                  color: product.availability.status === 'in-stock' ? 'var(--accent-primary)' 
                         : product.availability.status === 'low-stock' ? 'var(--accent-warning)'
                         : 'var(--accent-danger)' 
                }}>
                  {product.availability.status === 'in-stock' ? 'Optimal' : product.availability.status === 'low-stock' ? 'Warning' : 'Critical'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                  <span style={{ fontWeight: 600 }}>{product.availability.warehouseLocation}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Calendar size={16} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Last Restocked: </span>
                  <span>{product.availability.lastRestocked}</span>
                </div>
              </div>

              {product.availability.status === 'ordered' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Truck size={16} style={{ color: 'var(--accent-warning)', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Incoming Order: </span>
                    <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>ETA {product.availability.backorderDays} Days</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleSimulateScan(product.primaryUdi)}
              className="scan-action-btn"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Simulate Primary Scan
            </button>
          </div>

          {/* Suppliers Panel */}
          <div className="panel glass-panel">
            <h3 className="panel-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              <Truck size={18} style={{ color: 'var(--accent-primary)' }} />
              Approved Suppliers
            </h3>
            
            <div className="vendor-list">
              {productVendors.map(vendor => (
                <div key={vendor.id} className="vendor-item">
                  <div className="vendor-details">
                    <span className="vendor-name">{vendor.name}</span>
                    <span className="vendor-rating">★ {vendor.rating.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Supplier Score</span></span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{vendor.leadTime}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Est. Lead Time</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
          <h3 className="detail-desc-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Package size={18} style={{ color: 'var(--accent-primary)' }} />
            Related {product.category} Instruments
          </h3>
          <div className="products-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
