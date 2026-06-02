import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Grid, List, Search, FilterX, HelpCircle, Activity, Scissors, Brain } from 'lucide-react';
import ProductCard from '../components/Product/ProductCard';
import { useAppContext } from '../context/AppContext';

const CatalogPage = () => {
  const { inventory: products } = useAppContext();
  const { type } = useParams(); // 'general-surgery' or 'neurosurgery'
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);

  // Synchronize URL search params (e.g. if category is passed in url)
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('all');
    }
    // Reset page size on catalog type or category change
    setVisibleCount(12);
  }, [type, searchParams]);

  // Filter products by current catalog type
  const catalogProducts = useMemo(() => {
    return products.filter(p => p.catalog === type);
  }, [type]);

  // Calculate category lists and counts for the sidebar dynamically
  const categoriesList = useMemo(() => {
    const counts = catalogProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(catName => ({
      name: catName,
      count: counts[catName]
    })).sort((a, b) => b.count - a.count); // sort by product count
  }, [catalogProducts]);

  // Filter and Sort products
  const processedProducts = useMemo(() => {
    let result = [...catalogProducts];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.primaryRef.toLowerCase().includes(q) ||
        (p.eponymousName && p.eponymousName.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.refNumbers.some(ref => ref.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'ref') {
        return a.primaryRef.localeCompare(b.primaryRef);
      } else if (sortBy === 'variants-desc') {
        return b.totalVariants - a.totalVariants;
      } else if (sortBy === 'availability') {
        const order = { 'in-stock': 0, 'low-stock': 1, 'ordered': 2, 'out-of-stock': 3 };
        return order[a.availability.status] - order[b.availability.status];
      }
      return 0;
    });

    return result;
  }, [catalogProducts, selectedCategory, searchQuery, sortBy]);

  // Load more handler
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const catalogTitle = type === 'general-surgery' ? 'General Surgery' : 'Neurosurgery';
  const catalogSubtitle = type === 'general-surgery' 
    ? 'Access general operating instruments, diagnostic forceps, surgical scissors, and retractors.' 
    : 'Browse specialized neurosurgical retractors, spinal laminectomy punches, and micro-scissors.';

  const CatalogIcon = type === 'general-surgery' ? Scissors : Brain;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: type === 'general-surgery' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(90, 120, 255, 0.15)',
          border: type === 'general-surgery' ? '1px solid var(--border-color)' : '1px solid rgba(90, 120, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: type === 'general-surgery' ? 'var(--text-primary)' : 'var(--accent-secondary)'
        }}>
          <CatalogIcon size={28} />
        </div>
        <div>
          <h1 className="page-title">{catalogTitle} Catalog</h1>
          <p className="page-subtitle">{catalogSubtitle}</p>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Category Sidebar */}
        <aside className="catalog-sidebar">
          <div className="catalog-filter-group">
            <span className="catalog-filter-title">Instruments Category</span>
            <div className="category-list">
              <div 
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('all')}
              >
                <span>All Categories</span>
                <span className="category-count">{catalogProducts.length}</span>
              </div>
              
              {categoriesList.map(cat => (
                <div 
                  key={cat.name}
                  className={`category-item ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <span>{cat.name}</span>
                  <span className="category-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Main Grid */}
        <main className="catalog-main">
          {/* Controls Bar */}
          <div className="catalog-controls glass-panel">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search within this catalog..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(12); // Reset count on search
                }}
              />
            </div>
            
            <div className="controls-right">
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="ref">Primary REF Code</option>
                <option value="variants-desc">Variant Count (High)</option>
                <option value="availability">Availability Status</option>
              </select>

              <button 
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={18} />
              </button>

              <button 
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              Showing {Math.min(visibleCount, processedProducts.length)} of {processedProducts.length} products
              {selectedCategory !== 'all' && ` in category "${selectedCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {(selectedCategory !== 'all' || searchQuery !== '') && (
              <button 
                onClick={clearFilters}
                style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <FilterX size={12} /> Clear Filters
              </button>
            )}
          </div>

          {/* Catalog Grid/List */}
          {processedProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Instruments Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                We couldn't find any instruments matching your filters. Try clearing your search query or selecting a different category.
              </p>
              <button onClick={clearFilters} className="scan-action-btn" style={{ margin: '0 auto', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
                {processedProducts.slice(0, visibleCount).map(p => (
                  <ProductCard key={p.id} product={p} viewMode={viewMode} searchQuery={searchQuery} />
                ))}
              </div>
              
              {/* Load More Button */}
              {visibleCount < processedProducts.length && (
                <button 
                  onClick={handleLoadMore} 
                  className="glass-panel-interactive"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: '1rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Load More Instruments ({processedProducts.length - visibleCount} remaining)
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
