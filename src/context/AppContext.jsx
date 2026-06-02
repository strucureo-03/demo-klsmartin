import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // --- Auth State ---
  // If localStorage has a user, load it
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kls_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    // Mock authentication
    if (email === 'admin@klsmartin.com' && password === 'admin') {
      const adminUser = { email, role: 'admin', name: 'Inventory Manager' };
      setUser(adminUser);
      localStorage.setItem('kls_user', JSON.stringify(adminUser));
      return true;
    }
    if (email === 'staff@klsmartin.com' && password === 'staff') {
      const staffUser = { email, role: 'staff', name: 'Sales Representative' };
      setUser(staffUser);
      localStorage.setItem('kls_user', JSON.stringify(staffUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kls_user');
  };

  // --- Inventory State ---
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('kls_inventory');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Sync to local storage whenever inventory changes
  useEffect(() => {
    localStorage.setItem('kls_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // --- Cart State ---
  const [cart, setCart] = useState([]);

  const addToCart = (product, variantRef) => {
    const variant = product.variants.find(v => v.refNumber === variantRef);
    if (!variant || variant.quantity === 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.variantRef === variantRef);
      if (existing) {
        if (existing.qty >= variant.quantity) return prev;
        return prev.map(item => item.variantRef === variantRef ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        variantRef: variant.refNumber, 
        price: variant.price, 
        qty: 1,
        maxQty: variant.quantity
      }];
    });
  };

  const updateCartQty = (variantRef, delta) => {
    setCart(prev => prev.map(item => {
      if (item.variantRef === variantRef) {
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= item.maxQty) return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (variantRef) => {
    setCart(prev => prev.filter(item => item.variantRef !== variantRef));
  };

  const clearCart = () => setCart([]);

  // CRUD Operations
  const addProduct = (newProduct) => {
    // Basic ID generation
    const id = `GS-${String(inventory.length + 1).padStart(3, '0')}`;
    const productWithId = { ...newProduct, id };
    setInventory(prev => [productWithId, ...prev]);
  };

  const updateProduct = (id, updatedFields) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (id) => {
    setInventory(prev => prev.filter(p => p.id !== id));
  };

  // Billing Operation
  const checkoutCart = (cartItems) => {
    // cartItems is an array of { productId, variantRef, qty }
    setInventory(prev => prev.map(product => {
      // Find if this product is in the cart
      const cartItem = cartItems.find(item => item.productId === product.id);
      if (!cartItem) return product;

      // Decrement the variant stock
      const updatedVariants = product.variants.map(v => {
        if (v.refNumber === cartItem.variantRef) {
          const newQty = Math.max(0, v.quantity - cartItem.qty);
          return {
            ...v,
            quantity: newQty,
            status: newQty > 5 ? 'in-stock' : newQty > 0 ? 'low-stock' : 'out-of-stock'
          };
        }
        return v;
      });

      // Recalculate total quantity for the product
      const totalQty = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);

      return {
        ...product,
        variants: updatedVariants,
        availability: {
          ...product.availability,
          totalQuantity: totalQty,
          status: totalQty > 15 ? 'in-stock' : totalQty > 0 ? 'low-stock' : 'out-of-stock'
        }
      };
    }));
    
    // Clear global cart after checkout
    clearCart();
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      inventory,
      addProduct,
      updateProduct,
      deleteProduct,
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      checkoutCart
    }}>
      {children}
    </AppContext.Provider>
  );
};
