import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, CheckCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillingPage = () => {
  const { cart, updateCartQty, removeFromCart, checkoutCart } = useAppContext();
  const [success, setSuccess] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [taxExempt, setTaxExempt] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = taxExempt ? 0 : subtotal * 0.08;
  const total = subtotal + tax;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Brand Blue
    doc.text('IMPL Group', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Biomedical Instrument Invoice', 14, 27);
    
    // Order Details
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`PO Number: ${poNumber || 'N/A'}`, 14, 46);
    doc.text(`Department: ${department || 'General'}`, 14, 52);
    doc.text(`Tax Status: ${taxExempt ? 'Exempt' : 'Standard (8%)'}`, 14, 58);

    // Table
    const tableColumn = ["REF", "Description", "Unit Price", "Qty", "Amount"];
    const tableRows = [];

    cart.forEach(item => {
      const amount = (item.price * item.qty).toFixed(2);
      const rowData = [
        item.variantRef,
        item.name,
        `$${item.price.toFixed(2)}`,
        item.qty.toString(),
        `$${amount}`
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Tax: $${tax.toFixed(2)}`, 140, finalY + 16);
    doc.setFontSize(14);
    doc.setTextColor(14, 165, 233);
    doc.text(`Total: $${total.toFixed(2)}`, 140, finalY + 24);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for choosing IMPL Group.', 14, 280);

    // Download
    const filename = `KLS_Invoice_${poNumber ? poNumber : Date.now()}.pdf`;
    doc.save(filename);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Generate PDF Invoice First
    generatePDF();

    // Then process the checkout
    checkoutCart(cart);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/');
    }, 3000);
  };

  if (success) {
    return (
      <div className="mobile-checkout-success">
        <CheckCircle size={64} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h2>Order Processed!</h2>
        <p>Inventory updated. Your PDF invoice has been downloaded.</p>
      </div>
    );
  }

  return (
    <div className="mobile-billing-container">
      <div className="mobile-billing-header">
        <ShoppingCart size={24} color="var(--accent-primary)" />
        <h1>Checkout Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="mobile-empty-cart">
          <p>Your cart is empty.</p>
          <button className="scan-action-btn" onClick={() => navigate('/')}>Return to Assistant</button>
        </div>
      ) : (
        <>
          <div className="mobile-cart-list">
            {cart.map(item => (
              <div key={item.variantRef} className="mobile-cart-item glass-panel">
                <div className="mci-info">
                  <span className="mci-name">{item.name}</span>
                  <span className="mci-ref">REF: {item.variantRef}</span>
                  <span className="mci-price">${item.price.toFixed(2)}</span>
                </div>
                <div className="mci-actions">
                  <div className="mci-qty-controls">
                    <button onClick={() => updateCartQty(item.variantRef, -1)}><Minus size={14} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.variantRef, 1)}><Plus size={14} /></button>
                  </div>
                  <button className="mci-remove" onClick={() => removeFromCart(item.variantRef)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="billing-details-card glass-panel" style={{ padding: '1rem', borderRadius: '12px', marginTop: '1rem', background: 'white' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Order Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PO Number (Optional)</label>
                  <input 
                    type="text" 
                    value={poNumber}
                    onChange={e => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-2026-88"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department / Surgeon</label>
                  <input 
                    type="text" 
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Dr. Smith (Neurosurgery)"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="taxExempt"
                    checked={taxExempt}
                    onChange={e => setTaxExempt(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="taxExempt" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hospital Tax Exempt</label>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-billing-footer glass-panel">
            <div className="mbf-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {!taxExempt && (
              <div className="mbf-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            {taxExempt && (
              <div className="mbf-row" style={{ color: '#059669' }}>
                <span>Tax</span>
                <span>Exempt ($0.00)</span>
              </div>
            )}
            <div className="mbf-row mbf-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="scan-action-btn mbf-checkout-btn" onClick={handleCheckout}>
              <CreditCard size={20} /> Checkout & Generate PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingPage;
