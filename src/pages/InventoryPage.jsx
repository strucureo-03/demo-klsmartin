import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit2, Package, Search, X, PlusCircle } from 'lucide-react';

const InventoryPage = () => {
  const { inventory, deleteProduct, addProduct, updateProduct } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Detailed Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'IMPL',
    manufacturer: 'IMPL Group',
    catalog: 'general-surgery',
    category: '',
    description: '',
    variants: [
      { refNumber: '', size: '', price: 0, quantity: 0 }
    ]
  });

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.primaryRef && p.primaryRef.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '', brand: 'IMPL', manufacturer: 'IMPL Group', 
      catalog: 'general-surgery', category: '', description: '',
      variants: [{ refNumber: '', size: '', price: 0, quantity: 0 }]
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      manufacturer: product.manufacturer,
      catalog: product.catalog,
      category: product.category,
      description: product.description,
      variants: product.variants.map(v => ({ ...v }))
    });
    setShowModal(true);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariantRow = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { refNumber: '', size: '', price: 0, quantity: 0 }]
    });
  };

  const removeVariantRow = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Calculate derived data
    const totalQty = formData.variants.reduce((sum, v) => sum + Number(v.quantity), 0);
    const minPrice = Math.min(...formData.variants.map(v => Number(v.price)));
    const maxPrice = Math.max(...formData.variants.map(v => Number(v.price)));
    const primaryRef = formData.variants[0]?.refNumber || '';
    
    const formattedProduct = {
      name: formData.name,
      brand: formData.brand,
      manufacturer: formData.manufacturer,
      catalog: formData.catalog,
      category: formData.category,
      productType: formData.category,
      description: formData.description,
      primaryRef: primaryRef,
      refNumbers: formData.variants.map(v => v.refNumber),
      availableSizes: formData.variants.map(v => v.size),
      totalVariants: formData.variants.length,
      priceRange: { min: minPrice, max: maxPrice },
      availability: {
        status: totalQty > 15 ? 'in-stock' : totalQty > 0 ? 'low-stock' : 'out-of-stock',
        totalQuantity: totalQty,
        warehouseLocation: 'Main',
        lastRestocked: new Date().toISOString().split('T')[0]
      },
      vendors: ['V-001'],
      variants: formData.variants.map(v => ({
        ...v,
        price: Number(v.price),
        quantity: Number(v.quantity),
        status: Number(v.quantity) > 0 ? 'in-stock' : 'out-of-stock'
      }))
    };

    if (isEditing) {
      updateProduct(editId, formattedProduct);
    } else {
      addProduct(formattedProduct);
    }
    setShowModal(false);
  };

  return (
    <div className="mobile-inventory-container">
      <div className="mobile-inventory-header">
        <div>
          <h1>Inventory Master</h1>
          <p>Manage catalog and stock.</p>
        </div>
        <button onClick={openAddModal} className="scan-action-btn">
          <Plus size={18} /> Add
        </button>
      </div>

      <div className="mobile-search-bar glass-panel">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search by name or REF..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mobile-inventory-list">
        {filteredInventory.map(product => (
          <div key={product.id} className="mobile-inventory-card glass-panel">
            <div className="mic-header">
              <span className="mic-name">{product.name}</span>
              <span className={`mic-stock ${product.availability.totalQuantity > 10 ? 'in-stock' : 'out-of-stock'}`}>
                {product.availability.totalQuantity} units
              </span>
            </div>
            <div className="mic-body">
              <span>REF: {product.primaryRef || 'N/A'}</span>
              <span>&bull;</span>
              <span>{product.category}</span>
              <span>&bull;</span>
              <span>{product.totalVariants} Sizes</span>
            </div>
            <div className="mic-actions">
              <button onClick={() => openEditModal(product)} className="mic-btn edit">
                <Edit2 size={16} /> Edit
              </button>
              <button onClick={() => deleteProduct(product.id)} className="mic-btn delete">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="drawer-overlay mobile-modal-overlay">
          <div className="mobile-modal glass-panel">
            <div className="mobile-modal-header">
              <h2>
                <Package size={20} color="var(--accent-primary)" />
                {isEditing ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="icon-btn-small"><X size={24} /></button>
            </div>
            
            <div className="mobile-modal-body">
              <form onSubmit={handleSave} id="inventory-form">
                <div className="form-section">
                  <h3>General Info</h3>
                  <label>Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  
                  <div className="form-row">
                    <div className="form-col">
                      <label>Catalog</label>
                      <select value={formData.catalog} onChange={e => setFormData({...formData, catalog: e.target.value})}>
                        <option value="general-surgery">General Surgery</option>
                        <option value="neurosurgery">Neurosurgery</option>
                      </select>
                    </div>
                    <div className="form-col">
                      <label>Category</label>
                      <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Scalpels" />
                    </div>
                  </div>
                  
                  <label>Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <h3>Variants (Sizes)</h3>
                    <button type="button" onClick={addVariantRow} className="add-variant-btn">
                      <PlusCircle size={14} /> Add Size
                    </button>
                  </div>
                  
                  {formData.variants.map((v, i) => (
                    <div key={i} className="variant-row">
                      <div className="variant-inputs">
                        <div>
                          <label>REF</label>
                          <input required type="text" value={v.refNumber} onChange={e => handleVariantChange(i, 'refNumber', e.target.value)} />
                        </div>
                        <div>
                          <label>Size</label>
                          <input required type="text" value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)} />
                        </div>
                        <div>
                          <label>Price</label>
                          <input required type="number" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} />
                        </div>
                        <div>
                          <label>Stock</label>
                          <input required type="number" value={v.quantity} onChange={e => handleVariantChange(i, 'quantity', e.target.value)} />
                        </div>
                      </div>
                      {formData.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariantRow(i)} className="remove-variant-btn">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </form>
            </div>
            <div className="mobile-modal-footer">
              <button form="inventory-form" type="submit" className="scan-action-btn full-width">
                {isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
