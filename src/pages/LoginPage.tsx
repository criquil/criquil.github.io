import React, { useState } from 'react';
import { BankingService } from '../utils/bankingService';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bankingService = BankingService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = bankingService.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="bank-logo">
          <div className="logo-icon">TB</div>
          <h1 className="bank-name">Testing Bank</h1>
          <p className="bank-tagline">Professional Banking Solutions</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <h3 className="demo-title">Demo Credentials</h3>
          <div className="demo-user">
            <span>Admin:</span>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin', 'admin123')}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              admin / admin123
            </button>
          </div>
          <div className="demo-user">
            <span>User:</span>
            <button
              type="button"
              onClick={() => handleDemoLogin('john.smith', 'password123')}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              john.smith / password123
            </button>
          </div>
          <div className="demo-user">
            <span>User:</span>
            <button
              type="button"
              onClick={() => handleDemoLogin('jane.johnson', 'password123')}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              jane.johnson / password123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;