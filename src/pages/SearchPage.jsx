import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertTriangle, Layers, ShieldAlert, SlidersHorizontal, Trash2, BrainCircuit } from 'lucide-react';
import Fuse from 'fuse.js';
import ProductCard from '../components/Product/ProductCard';
import { parseNLPQuery, CATEGORY_MAP } from '../utils/nlpSearchEngine';
import { useAppContext } from '../context/AppContext';

const SearchPage = () => {
  const { inventory: products } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering and configuration states
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isNlpMode, setIsNlpMode] = useState(false);
  const [nlpAnalysis, setNlpAnalysis] = useState(null);

  // Initialize from search URL parameters
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setSearchQuery(qParam);
      addToHistory(qParam);
    } else {
      setSearchQuery('');
    }

    const filterParam = searchParams.get('filter');
    if (filterParam === 'critical') {
      setAvailabilityFilter('critical');
    }
  }, [searchParams]);

  // List of all categories for dropdown
  const allCategories = useMemo(() => {
    const cats = products.map(p => p.category);
    return ['all', ...new Set(cats)].sort();
  }, []);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.35 },
        { name: 'primaryRef', weight: 0.25 },
        { name: 'refNumbers', weight: 0.15 },
        { name: 'category', weight: 0.1 },
        { name: 'eponymousName', weight: 0.2 },
        { name: 'productType', weight: 0.15 },
        { name: 'availableSizes', weight: 0.2 },
        { name: 'description', weight: 0.05 }
      ],
      threshold: 0.35,
      ignoreLocation: true
    });
  }, []);

  // Add term to recent searches history in localStorage
  const addToHistory = (term) => {
    if (!term || term.trim().length < 2) return;
    try {
      const history = JSON.parse(localStorage.getItem('kls_recent_searches') || '[]');
      const cleanTerm = term.trim();
      const filtered = history.filter(h => h.term.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [
        { term: cleanTerm, timestamp: 'Just now', count: 1 },
        ...filtered
      ].slice(0, 5);
      localStorage.setItem('kls_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Run search and apply secondary filters
  const searchResults = useMemo(() => {
    let baseProducts = [...products];
    let queryToUse = searchQuery;

    // Reset NLP analysis
    setNlpAnalysis(null);

    // 1. NLP Processing
    if (isNlpMode && searchQuery.trim() !== '') {
      const parsed = parseNLPQuery(searchQuery);
      if (parsed) {
        setNlpAnalysis(parsed);
        
        // Apply parsed catalog
        if (parsed.catalog) {
          baseProducts = baseProducts.filter(p => p.catalog === parsed.catalog);
        }
        
        // Apply parsed categories
        if (parsed.categories && parsed.categories.length > 0) {
          baseProducts = baseProducts.filter(p => parsed.categories.includes(p.category));
        }

        // Apply size requirement
        if (parsed.sizes && parsed.sizes.length > 0) {
          baseProducts = baseProducts.filter(p => {
            if (!p.availableSizes) return false;
            // Check if any available size matches our parsed sizes
            return p.availableSizes.some(availSize => 
              parsed.sizes.some(parsedSize => 
                availSize.toLowerCase().includes(parsedSize) || parsedSize.includes(availSize.toLowerCase())
              )
            );
          });
        }

        // Pass remaining query for fuzzy search
        queryToUse = parsed.remainingQuery;
      }
    }

    // 2. Fuzzy Search Fallback
    if (queryToUse && queryToUse.trim() !== '') {
      // Create a temporary fuse instance if we reduced baseProducts significantly
      const currentFuse = (baseProducts.length < products.length) 
        ? new Fuse(baseProducts, fuse.options) 
        : fuse;
        
      const fuseResults = currentFuse.search(queryToUse);
      baseProducts = fuseResults.map(r => r.item);
    } else if (searchQuery.trim() !== '' && !isNlpMode) {
      const fuseResults = fuse.search(searchQuery);
      baseProducts = fuseResults.map(r => r.item);
    } else if (searchQuery.trim() !== '' && isNlpMode && queryToUse === '') {
      // NLP completely parsed the intent, no fuzzy text left. Don't fuzzy search.
    }

    // Apply Catalog Filter
    if (catalogFilter !== 'all') {
      baseProducts = baseProducts.filter(p => p.catalog === catalogFilter);
    }

    // Apply Category Filter
    if (categoryFilter !== 'all') {
      baseProducts = baseProducts.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Apply Availability Filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'critical') {
        baseProducts = baseProducts.filter(p => p.availability.status === 'low-stock' || p.availability.status === 'out-of-stock');
      } else {
        baseProducts = baseProducts.filter(p => p.availability.status === availabilityFilter);
      }
    }

    return baseProducts;
  }, [searchQuery, catalogFilter, availabilityFilter, categoryFilter, fuse, isNlpMode]);

  // Compute fallback recommendations when search yields 0 results
  const fallbackRecommendations = useMemo(() => {
    if (searchResults.length > 0) return null;
    
    let fallbacks = [];
    let reason = '';

    // If we used NLP and extracted constraints that caused 0 results, loosen them
    if (isNlpMode && nlpAnalysis) {
      if (nlpAnalysis.categories && nlpAnalysis.categories.length > 0) {
        // Show other items in the requested category, ignoring size constraints
        fallbacks = products.filter(p => nlpAnalysis.categories.includes(p.category)).slice(0, 4);
        reason = `We couldn't find the exact match (e.g., specific size or vendor), but here are other ${nlpAnalysis.categories.join(' / ')} options:`;
      } else if (nlpAnalysis.catalog) {
         // Show other items in the requested department
        fallbacks = products.filter(p => p.catalog === nlpAnalysis.catalog).slice(0, 4);
        reason = `No exact matches. Here are some alternatives from the ${nlpAnalysis.catalog === 'neurosurgery' ? 'Neurosurgery' : 'General Surgery'} department:`;
      }
    }
    
    // If we still have no fallbacks (e.g. fuzzy search failed completely)
    if (fallbacks.length === 0) {
      // Show popular in-stock items
      fallbacks = products.filter(p => p.availability.status === 'in-stock').slice(0, 4);
      reason = "No exact matches found. Here are some popular available instruments you might need:";
    }

    // Filter out duplicates just in case
    const uniqueFallbacks = Array.from(new Set(fallbacks.map(f => f.id)))
      .map(id => fallbacks.find(f => f.id === id));

    return { items: uniqueFallbacks, reason };
  }, [searchResults, nlpAnalysis, isNlpMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      searchParams.set('q', searchQuery);
      setSearchParams(searchParams);
      addToHistory(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCatalogFilter('all');
    setCategoryFilter('all');
    setAvailabilityFilter('all');
    searchParams.delete('q');
    searchParams.delete('filter');
    setSearchParams(searchParams);
  };

  return (
    <div className="search-page-container">
      <div className="page-header">
        <h1 className="page-title">Fuzzy Inventory Lookup</h1>
        <p className="page-subtitle">Type partial name, eponym, surgical category, or REF key to lookup live availability.</p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="main-search-bar">
        <div className="main-search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text"
            placeholder={isNlpMode ? "E.g., '18cm cutting tools for neuro'..." : "Type search terms (e.g. Mayo, Metzenbaum, 11-100)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          type="button" 
          onClick={() => setShowFilters(!showFilters)}
          className={`view-toggle-btn ${showFilters ? 'active' : ''}`}
          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)' }}
          title="Toggle Filter Options"
        >
          <SlidersHorizontal size={20} />
        </button>

        <button 
          type="submit" 
          className="scan-action-btn"
          style={{ borderRadius: 'var(--radius-lg)', padding: '0 1.5rem', height: '48px' }}
        >
          Search
        </button>
      </form>

      {/* NLP Mode Toggle */}
      <div className="nlp-toggle-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
          <span style={{ fontSize: '0.8rem', color: isNlpMode ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: isNlpMode ? 600 : 400 }}>
            ✨ Semantic NLP Search
          </span>
          <div 
            className={`toggle-switch ${isNlpMode ? 'on' : 'off'}`}
            onClick={() => setIsNlpMode(!isNlpMode)}
            style={{
              width: '36px', height: '20px', borderRadius: '10px', 
              background: isNlpMode ? 'var(--accent-primary)' : 'var(--border-color)',
              position: 'relative', transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '2px', left: isNlpMode ? '18px' : '2px',
              transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
        </label>
      </div>

      {/* NLP Reasoning Panel */}
      {isNlpMode && nlpAnalysis && (
        <div className="nlp-reasoning-panel glass-panel" style={{
          marginBottom: '1.5rem', 
          borderLeft: '4px solid var(--accent-primary)',
          background: 'rgba(var(--accent-primary-rgb), 0.03)',
          animation: 'fade-in 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
            <BrainCircuit size={16} />
            <h4 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NLP Intent Analysis</h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {nlpAnalysis.intentReasoning.length > 0 && (
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>DETECTED INTENT</span>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {nlpAnalysis.intentReasoning.map(i => (
                    <span key={i} className="nlp-pill">"{i}" → {CATEGORY_MAP[i]?.[0] || i}</span>
                  ))}
                </div>
              </div>
            )}
            
            {nlpAnalysis.sizes.length > 0 && (
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>REQUIRED SIZE</span>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {nlpAnalysis.sizes.map(s => <span key={s} className="nlp-pill size-pill">{s}</span>)}
                </div>
              </div>
            )}

            {nlpAnalysis.catalog && (
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>DEPARTMENT</span>
                <span className="nlp-pill catalog-pill">"{nlpAnalysis.catalogReasoning}" → {nlpAnalysis.catalog === 'neurosurgery' ? 'Neurosurgery' : 'General Surgery'}</span>
              </div>
            )}

            {nlpAnalysis.remainingQuery && (
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>KEYWORD FALLBACK</span>
                <span className="nlp-pill fallback-pill">"{nlpAnalysis.remainingQuery}"</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="panel glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', animation: 'modal-enter 0.2s ease-out' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Catalog</label>
            <select 
              className="sort-select" 
              value={catalogFilter} 
              onChange={(e) => setCatalogFilter(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="all">All Catalogs</option>
              <option value="general-surgery">General Surgery</option>
              <option value="neurosurgery">Neurosurgery</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Availability</label>
            <select 
              className="sort-select" 
              value={availabilityFilter} 
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="ordered">On Backorder</option>
              <option value="critical">Critical (Low / Out)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Category</label>
            <select 
              className="sort-select" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="all">All Categories</option>
              {allCategories.filter(cat => cat !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filter Pill Row for Quick Operations */}
      <div className="search-filter-pill-row">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Quick Filters:</span>
        <button 
          onClick={() => { setAvailabilityFilter('all'); setCatalogFilter('all'); }} 
          className={`filter-pill ${availabilityFilter === 'all' && catalogFilter === 'all' ? 'active' : ''}`}
        >
          All Items
        </button>
        <button 
          onClick={() => setAvailabilityFilter('in-stock')} 
          className={`filter-pill ${availabilityFilter === 'in-stock' ? 'active' : ''}`}
        >
          In Stock Only
        </button>
        <button 
          onClick={() => setAvailabilityFilter('critical')} 
          className={`filter-pill ${availabilityFilter === 'critical' ? 'active' : ''}`}
        >
          Critical Stock Gaps
        </button>
        <button 
          onClick={() => setCatalogFilter('general-surgery')} 
          className={`filter-pill ${catalogFilter === 'general-surgery' ? 'active' : ''}`}
        >
          General Surgery
        </button>
        <button 
          onClick={() => setCatalogFilter('neurosurgery')} 
          className={`filter-pill ${catalogFilter === 'neurosurgery' ? 'active' : ''}`}
        >
          Neurosurgery
        </button>
      </div>

      {/* Results Header Info */}
      <div className="search-results-info">
        <span>
          Found {searchResults.length} surgical instruments 
          {searchQuery && ` for query "${searchQuery}"`}
          {catalogFilter !== 'all' && ` in ${catalogFilter === 'general-surgery' ? 'General Surgery' : 'Neurosurgery'}`}
          {availabilityFilter !== 'all' && ` matching availability status`}
          {categoryFilter !== 'all' && ` in category "${categoryFilter}"`}
        </span>
        
        {(searchQuery || catalogFilter !== 'all' || availabilityFilter !== 'all' || categoryFilter !== 'all') && (
          <button 
            onClick={handleClearSearch}
            className="clear-search-btn"
            style={{ background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Trash2 size={12} /> Clear Results
          </button>
        )}
      </div>

      {/* Search Grid */}
      {searchResults.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <ShieldAlert size={48} style={{ color: 'var(--accent-warning)', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Matches Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.4 }}>
              We scanned 316 surgical items but found no exact matches for your strict criteria. Try loosening your search terms or using Semantic NLP mode.
            </p>
            <button onClick={handleClearSearch} className="scan-action-btn" style={{ margin: '0 auto', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
              Reset Search Form
            </button>
          </div>

          {fallbackRecommendations && fallbackRecommendations.items.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Suggested Alternatives</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {fallbackRecommendations.reason}
              </p>
              <div className="products-grid">
                {fallbackRecommendations.items.map(p => (
                  <ProductCard key={`fallback-${p.id}`} product={p} searchQuery="" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {searchResults.map(p => (
            <ProductCard key={p.id} product={p} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
