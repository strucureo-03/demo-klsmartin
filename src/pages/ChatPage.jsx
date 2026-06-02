import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, PlusCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseNLPQuery } from '../utils/nlpSearchEngine';
import Fuse from 'fuse.js';

const ChatProductCard = ({ product, addToCart, searchedSizes }) => {
  const [expanded, setExpanded] = useState(false);
  
  const sortedVariants = [...product.variants].sort((a, b) => {
    if (!searchedSizes || searchedSizes.length === 0) return 0;
    
    const isMatch = (v) => {
      const vSizeLower = v.size.toLowerCase();
      return searchedSizes.some(size => {
        const sizeLower = size.toLowerCase();
        if (vSizeLower.includes(sizeLower)) return true;
        const searchNum = sizeLower.match(/[\d.,]+/)?.[0];
        const variantNum = vSizeLower.match(/[\d.,]+/)?.[0];
        return searchNum && variantNum && searchNum === variantNum;
      });
    };

    const aMatch = isMatch(a);
    const bMatch = isMatch(b);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const visibleVariants = expanded ? sortedVariants : sortedVariants.slice(0, 3);
  
  return (
    <div className="chat-product-card glass-panel">
      <div className="cpc-header">
        <span className="cpc-name">{product.name}</span>
        <span className={`cpc-stock ${product.availability.totalQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
          {product.availability.totalQuantity > 0 ? `${product.availability.totalQuantity} in stock` : 'Out of Stock'}
        </span>
      </div>
      <div className="cpc-desc">{product.category} &bull; {product.catalog === 'general-surgery' ? 'Gen. Surg' : 'Neuro'}</div>
      
      <div className="cpc-variants">
        {visibleVariants.map(v => (
          <div key={v.refNumber} className="cpc-variant-row">
            <div className="cpc-v-info">
              <span className="cpc-v-ref">{v.refNumber}</span>
              <span className="cpc-v-size">{v.size}</span>
            </div>
            <div className="cpc-v-action">
              <span className="cpc-v-price">${v.price}</span>
              <button 
                className="icon-btn-small" 
                disabled={v.quantity === 0}
                onClick={() => addToCart(product, v.refNumber)}
                title="Add to Cart"
              >
                <PlusCircle size={16} color={v.quantity > 0 ? 'var(--accent-primary)' : '#ccc'} />
              </button>
            </div>
          </div>
        ))}
        {product.variants.length > 3 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{ 
              fontSize: '0.75rem', color: 'var(--accent-primary)', textAlign: 'center', 
              marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, width: '100%', padding: '0.5rem', borderRadius: '8px'
            }}
          >
            {expanded ? 'Show less' : `+ ${product.variants.length - 3} more variants`}
          </button>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { inventory, addToCart } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hello! I'm the KLS Martin Inventory Assistant. What surgical instruments do you need to find today?",
      products: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = (query) => {
    if (!query.trim()) return [];

    const nlpAnalysis = parseNLPQuery(query) || { categories: [], sizes: [], catalog: null, remainingQuery: query };
    const queryToUse = nlpAnalysis.remainingQuery.trim() !== '' ? nlpAnalysis.remainingQuery : query;

    let baseProducts = [...inventory];

    // Fuzzy matching
    if (queryToUse.trim() !== '') {
      const fuse = new Fuse(baseProducts, {
        keys: [
          { name: 'name', weight: 2 },
          { name: 'primaryRef', weight: 1.5 },
          { name: 'refNumbers', weight: 1.2 },
          { name: 'category', weight: 1 },
          { name: 'description', weight: 0.5 },
          { name: 'availableSizes', weight: 1.5 }
        ],
        threshold: 0.3,
        ignoreLocation: true,
      });
      const results = fuse.search(queryToUse);
      baseProducts = results.map(r => r.item);
    }

    // Apply NLP Filters
    if (nlpAnalysis.catalog) {
      baseProducts = baseProducts.filter(p => p.catalog === nlpAnalysis.catalog);
    }
    if (nlpAnalysis.categories.length > 0) {
      baseProducts = baseProducts.filter(p => nlpAnalysis.categories.includes(p.category));
    }
    if (nlpAnalysis.sizes.length > 0) {
      baseProducts = baseProducts.filter(p => {
        return p.variants.some(v => {
          const vSizeLower = v.size.toLowerCase();
          return nlpAnalysis.sizes.some(size => {
            const sizeLower = size.toLowerCase();
            // Direct substring match (e.g. "17 cm" found in "17 cm")
            if (vSizeLower.includes(sizeLower)) return true;
            // Extract just the number from both and compare
            const searchNum = sizeLower.match(/[\d.,]+/)?.[0];
            const variantNum = vSizeLower.match(/[\d.,]+/)?.[0];
            if (searchNum && variantNum && searchNum === variantNum) return true;
            return false;
          });
        });
      });
    }

    return baseProducts.slice(0, 5); // Return top 5 matches
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      products: []
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');

    // Simulate network delay for AI feel
    setTimeout(() => {
      let results = handleSearch(currentQuery);
      
      let botText = "";
      const nlpAnalysis = parseNLPQuery(currentQuery) || { categories: [], sizes: [], catalog: null, remainingQuery: currentQuery };

      if (results.length > 0) {
        botText = `I found ${results.length} matching instruments in the inventory. Here they are:`;
      } else {
        if (nlpAnalysis.categories && nlpAnalysis.categories.length > 0) {
          results = inventory.filter(p => nlpAnalysis.categories.includes(p.category)).slice(0, 4);
          botText = `I couldn't find the exact size/spec you requested, but here are other related ${nlpAnalysis.categories.join(' / ')} options:`;
        } else if (nlpAnalysis.catalog) {
          results = inventory.filter(p => p.catalog === nlpAnalysis.catalog).slice(0, 4);
          botText = `No exact matches. Here are some alternatives from the ${nlpAnalysis.catalog === 'neurosurgery' ? 'Neurosurgery' : 'General Surgery'} department:`;
        } else {
          results = inventory.filter(p => p.availability.status === 'in-stock').slice(0, 4);
          botText = "No exact matches found. Here are some popular available instruments you might need:";
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        products: results,
        searchedSizes: nlpAnalysis.sizes
      }]);
    }, 600);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-area">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
            {msg.sender === 'bot' && (
              <div className="chat-avatar bot-avatar">
                <Sparkles size={16} />
              </div>
            )}
            
            <div className="chat-bubble-container">
              <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                {msg.text}
              </div>

              {msg.products && msg.products.length > 0 && (
                <div className="chat-products-carousel">
                  {msg.products.map(product => (
                    <ChatProductCard key={product.id} product={product} addToCart={addToCart} searchedSizes={msg.searchedSizes} />
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="chat-avatar user-avatar">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form className="chat-input-form glass-panel" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="E.g., '18cm standard scalpels' or 'GS-001'"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
            <Send size={20} />
          </button>
        </form>
        <div className="chat-footer-text">KLS Martin NLP Assistant can make mistakes. Check inventory levels.</div>
      </div>
    </div>
  );
};

export default ChatPage;
