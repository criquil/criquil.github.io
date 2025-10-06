import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BankingService } from './utils/bankingService';
import { User } from './types';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TransferPage from './pages/TransferPage';
import BillPaymentPage from './pages/BillPaymentPage';
import CreditCardPage from './pages/CreditCardPage';
import CurrencyExchangePage from './pages/CurrencyExchangePage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const bankingService = BankingService.getInstance();

  useEffect(() => {
    // Check if user is already logged in from previous session
    const savedUser = bankingService.loadCurrentUserSession();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setLoading(false);
  }, [bankingService]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    bankingService.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Testing Bank...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? 
                <Dashboard user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/transfer" 
            element={
              currentUser ? 
                <TransferPage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/bills" 
            element={
              currentUser ? 
                <BillPaymentPage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/credit-cards" 
            element={
              currentUser ? 
                <CreditCardPage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/currency-exchange" 
            element={
              currentUser ? 
                <CurrencyExchangePage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              currentUser && currentUser.isAdmin ? 
                <AdminPage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;