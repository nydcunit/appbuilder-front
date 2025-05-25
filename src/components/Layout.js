import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #34495e' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            <h2>AppBuilder</h2>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'block',
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              backgroundColor: isActive('/dashboard') ? '#34495e' : 'transparent',
              borderLeft: isActive('/dashboard') ? '3px solid white' : '3px solid transparent'
            }}
          >
            📱 Dashboard
          </Link>
          <Link
            to="/databases"
            style={{
              display: 'block',
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              backgroundColor: isActive('/databases') ? '#34495e' : 'transparent',
              borderLeft: isActive('/databases') ? '3px solid white' : '3px solid transparent'
            }}
          >
            🗄️ Databases
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #34495e' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user?.email}</div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', flex: 1, backgroundColor: '#f8f9fa' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;