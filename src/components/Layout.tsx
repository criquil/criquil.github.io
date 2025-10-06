import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <div className="main-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">TB</div>
            <span className="sidebar-brand">Testing Bank</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">🏠</span>
            Dashboard
          </Link>
          <Link 
            to="/transfer" 
            className={`nav-item ${isActive('/transfer') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">💸</span>
            Transfer Money
          </Link>
          <Link 
            to="/bills" 
            className={`nav-item ${isActive('/bills') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">🧾</span>
            Pay Bills
          </Link>
          <Link 
            to="/credit-cards" 
            className={`nav-item ${isActive('/credit-cards') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">💳</span>
            Credit Cards
          </Link>
          <Link 
            to="/currency-exchange" 
            className={`nav-item ${isActive('/currency-exchange') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">💱</span>
            Currency Exchange
          </Link>
          {user.isAdmin && (
            <Link 
              to="/admin" 
              className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            >
              <span className="nav-item-icon">⚙️</span>
              Admin Panel
            </Link>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getUserInitials(user.firstName, user.lastName)}
            </div>
            <div className="user-details">
              <h4>{user.firstName} {user.lastName}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="logout-button">
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;