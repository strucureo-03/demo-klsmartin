import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ScanBarcode, AlertCircle, CheckCircle, Info, Clipboard, Barcode, Calendar, FileText, Sparkles, Navigation } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AvailabilityBadge from '../components/Product/AvailabilityBadge';

const ScanPage = () => {
  const { inventory: products } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  // Extract a few interesting samples from our database for the user to try easily
  const samples = useMemo(() => {
    const list = [];
    
    // 1. In Stock item from General Surgery (Mayo Scissors)
    const p1 = products.find(p => p.id === 'GS-018');
    if (p1) {
      list.push({
        label: 'GS-018 Variant UDI (In Stock)',
        value: p1.variants[0].udi,
        type: 'udi'
      });
    }

    // 2. Low Stock item from Neurosurgery (Metzenbaum Scissors)
    const p2 = products.find(p => p.id === 'NS-009');
    if (p2) {
      list.push({
        label: 'NS-009 Variant UDI (Low Stock)',
        value: p2.variants[0].udi,
        type: 'udi'
      });
    }

    // 3. Out of stock / Backorder item
    const p3 = products.find(p => p.availability.status === 'out-of-stock');
    if (p3) {
      list.push({
        label: 'Out of Stock Variant UDI',
        value: p3.variants[0].udi,
        type: 'udi'
      });
    }

    // 4. Raw REF code
    list.push({
      label: 'Raw REF (Adson Forceps)',
      value: '15-776-31-07',
      type: 'ref'
    });

    return list;
  }, []);

  // Listen to incoming UDI in the search parameters (e.g. from Product detail scan link)
  useEffect(() => {
    const udiParam = searchParams.get('udi');
    if (udiParam) {
      setScanInput(udiParam);
      handlePerformScan(udiParam);
    }
  }, [searchParams]);

  // GS1 UDI Parser
  const parseUdi = (udiStr) => {
    const parsed = {
      gtin: 'N/A',
      expiry: 'N/A',
      lot: 'N/A',
      refCode: 'N/A'
    };
    
    const gtinMatch = udiStr.match(/\(01\)(\d+)/);
    if (gtinMatch) parsed.gtin = gtinMatch[1];
    
    const expiryMatch = udiStr.match(/\(17\)(\d+)/);
    if (expiryMatch) {
      const rawExp = expiryMatch[1];
      if (rawExp.length === 6) {
        parsed.expiry = `20${rawExp.substring(0, 2)}-${rawExp.substring(2, 4)}-${rawExp.substring(4, 6)}`;
      } else {
        parsed.expiry = rawExp;
      }
    }
    
    const lotMatch = udiStr.match(/\(10\)([A-Za-z0-9]+)/);
    if (lotMatch) parsed.lot = lotMatch[1];
    
    const serialMatch = udiStr.match(/\(21\)([A-Za-z0-9\-]+)/);
    if (serialMatch) parsed.refCode = serialMatch[1];
    
    return parsed;
  };

  // Perform Scan function
  const handlePerformScan = (inputVal) => {
    const query = inputVal || scanInput;
    if (!query || query.trim() === '') return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning delay (e.g. 800ms) for premium feel
    setTimeout(() => {
      const targetQuery = query.trim();
      const isUdi = targetQuery.includes('(01)');
      
      let matchedProduct = null;
      let matchedVariant = null;
      let udiDetails = null;

      if (isUdi) {
        udiDetails = parseUdi(targetQuery);
        // Find product. The (21) code is the REF code without hyphens, or with hyphens.
        const cleanRefCode = udiDetails.refCode.replace(/-/g, '').toLowerCase();
        
        matchedProduct = products.find(p => {
          if (p.primaryRef.replace(/-/g, '').toLowerCase() === cleanRefCode) return true;
          return p.refNumbers.some(ref => ref.replace(/-/g, '').toLowerCase() === cleanRefCode);
        });

        if (matchedProduct) {
          matchedVariant = matchedProduct.variants.find(v => 
            v.refNumber.replace(/-/g, '').toLowerCase() === cleanRefCode || v.udi === targetQuery
          ) || matchedProduct.variants[0];
        }
      } else {
        // Raw REF number lookup
        const cleanQuery = targetQuery.replace(/-/g, '').toLowerCase();
        matchedProduct = products.find(p => {
          if (p.primaryRef.replace(/-/g, '').toLowerCase() === cleanQuery) return true;
          return p.refNumbers.some(ref => ref.replace(/-/g, '').toLowerCase() === cleanQuery);
        });

        if (matchedProduct) {
          matchedVariant = matchedProduct.variants.find(v => 
            v.refNumber.replace(/-/g, '').toLowerCase() === cleanQuery
          ) || matchedProduct.variants[0];
        }
      }

      setIsScanning(false);
      
      if (matchedProduct) {
        setScanResult({
          success: true,
          isUdi,
          udiDetails,
          product: matchedProduct,
          variant: matchedVariant,
          rawCode: targetQuery
        });
      } else {
        setScanResult({
          success: false,
          rawCode: targetQuery
        });
      }
    }, 800);
  };

  const handleSampleClick = (val) => {
    setScanInput(val);
    handlePerformScan(val);
  };

  return (
    <div className="scanner-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Barcode & UDI Gateway</h1>
        <p className="page-subtitle">Simulate clinical scanning of medical instruments utilizing GS1-128 parsing rules</p>
      </div>

      {/* Simulated Scanner Viewport */}
      <div className="scanner-viewport glass-panel" style={{ border: isScanning ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)' }}>
        {isScanning ? (
          <>
            <div className="scanner-laser" />
            <div className="scanner-overlay" />
            <div style={{ zIndex: 10, textAlign: 'center' }}>
              <ScanBarcode size={48} style={{ color: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
              <p style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Parsing barcode parameters...</p>
            </div>
          </>
        ) : scanResult && scanResult.success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
            <CheckCircle size={56} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Scan Successful</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matched REF: {scanResult.variant.refNumber}</p>
          </div>
        ) : scanResult && !scanResult.success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
            <AlertCircle size={56} style={{ color: 'var(--accent-danger)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-danger)' }}>Verification Failed</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code not found in inventory catalog</p>
          </div>
        ) : (
          <>
            <div className="scanner-overlay">
              <div className="scanner-target-box">
                <div className="scanner-corner tl" />
                <div className="scanner-corner tr" />
                <div className="scanner-corner bl" />
                <div className="scanner-corner br" />
              </div>
            </div>
            <div className="scanner-instructions">
              Position UDI barcode or type instrument REF below
            </div>
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text"
            placeholder="Type GS1-128 UDI barcode or raw REF code..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              transition: 'var(--transition-fast)'
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePerformScan(); }}
          />
          <button 
            onClick={() => handlePerformScan()}
            className="scan-action-btn"
            style={{ padding: '0 1.5rem' }}
            disabled={isScanning}
          >
            Submit Scan
          </button>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="scanner-sample-refs glass-panel">
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          Select Sample Barcodes to Test
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Click any pill below to simulate scanning a real instrument barcode.
        </p>
        <div className="scanner-sample-grid">
          {samples.map((samp, idx) => (
            <div 
              key={idx}
              className="sample-ref-pill"
              onClick={() => handleSampleClick(samp.value)}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {samp.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
                {samp.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results View */}
      {scanResult && (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', animation: 'modal-enter 0.25s ease-out' }}>
          {scanResult.success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* UDI Parsing Header */}
              {scanResult.isUdi && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} /> GS1-128 Decoded Parameters
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <Barcode size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GTIN (Global Trade Number)</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{scanResult.udiDetails.gtin}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Expiration Date</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{scanResult.udiDetails.expiry}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lot / Batch Code</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{scanResult.udiDetails.lot}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <ScanBarcode size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Serial / REF String</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{scanResult.variant.refNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Product Details Summary */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Matched Inventory Item</h4>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(var(--accent-primary-rgb), 0.2)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {scanResult.product.category} | {scanResult.product.catalog === 'general-surgery' ? 'General Surgery' : 'Neurosurgery'}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{scanResult.product.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span>Size: <strong>{scanResult.variant.size}</strong></span>
                      <span>Stock Location: <strong>{scanResult.product.availability.warehouseLocation}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <AvailabilityBadge status={scanResult.variant.status} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>${scanResult.variant.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action button */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <Link 
                  to={`/product/${scanResult.product.id}`}
                  className="scan-action-btn"
                  style={{ textDecoration: 'none', flex: 1 }}
                >
                  <Navigation size={16} /> Open Complete Tracking File
                </Link>
                
                <button 
                  onClick={() => { setScanResult(null); setScanInput(''); }}
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear Results
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--accent-danger)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Barcode Verification Failure</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '380px' }}>
                  The code <strong>"{scanResult.rawCode}"</strong> does not map to any active GTIN, serial number, or catalog REF code in the KLS Martin inventory system.
                </p>
              </div>
              <button 
                onClick={() => { setScanResult(null); setScanInput(''); }}
                className="scan-action-btn"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}
              >
                Try Another Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanPage;
