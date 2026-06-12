import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Shield, Lock, Mail, AlertTriangle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password.');
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@klsmartin.com');
    setPassword('admin');
  };

  const autofillStaff = () => {
    setEmail('staff@klsmartin.com');
    setPassword('staff');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ 
        maxWidth: '450px', 
        width: '100%',
        padding: '3rem 2rem',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, rgba(var(--accent-primary-rgb), 0.7) 100%)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 16px rgba(var(--accent-primary-rgb), 0.2)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            IMPL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Biomedical Logistics & Inventory System
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(var(--accent-danger-rgb), 0.1)', 
            color: 'var(--accent-danger)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem', fontWeight: 500
          }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.8)', fontSize: '0.95rem'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.8)', fontSize: '0.95rem'
                }}
                required
              />
            </div>
          </div>

          <button type="submit" className="scan-action-btn" style={{ marginTop: '0.5rem' }}>
            Secure Login
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>Demo Accounts</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              onClick={autofillAdmin}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(var(--accent-primary-rgb), 0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Fill Admin
            </button>
            <button 
              onClick={autofillStaff}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(var(--accent-secondary-rgb), 0.1)', color: 'var(--accent-secondary)', border: '1px solid rgba(var(--accent-secondary-rgb), 0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Fill Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
