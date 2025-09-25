import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { DatabaseSeeder } from './services/seeder';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AccountsPage from './components/banking/AccountsPage';
import TransferPage from './components/banking/TransferPage';
import CurrencyExchangePage from './components/banking/CurrencyExchangePage';
import AdminDashboard from './components/admin/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected Route component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (accessible only when not authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize database with seed data
      try {
        await DatabaseSeeder.seed();
        console.log('Database seeded successfully');
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route 
              path="/accounts" 
              element={
                <PrivateRoute>
                  <AccountsPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/transfers" 
              element={
                <PrivateRoute>
                  <TransferPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/exchange" 
              element={
                <PrivateRoute>
                  <CurrencyExchangePage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
