import React from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const bankingService = BankingService.getInstance();

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getRecentTransactions = () => {
    const allTransactions = user.accounts.flatMap(account => 
      account.transactions.map(tx => ({ ...tx, accountId: account.id, accountNumber: account.accountNumber }))
    );
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getTotalBalance = () => {
    return user.accounts
      .filter(acc => acc.accountType !== 'credit')
      .reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'checking': 'Checking Account',
      'savings': 'Savings Account',
      'credit': 'Credit Card'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      'completed': 'badge-success',
      'pending': 'badge-warning',
      'failed': 'badge-danger'
    };
    return `badge ${statusClasses[status] || 'badge-warning'}`;
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user.firstName}!</h1>
        <p className="page-subtitle">Here's your account overview</p>
      </div>
      
      <div className="page-content">
        {/* Account Summary */}
        <div className="grid grid-cols-1" style={{ marginBottom: '32px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Total Balance</h2>
              <p className="card-subtitle">Across all accounts (excluding credit cards)</p>
            </div>
            <div className="card-content">
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                {formatCurrency(getTotalBalance())}
              </div>
            </div>
          </div>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
          {user.accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-type">{getAccountTypeDisplay(account.accountType)}</div>
              <div className="account-balance">{formatCurrency(account.balance, account.currency)}</div>
              <div className="account-number">**** **** **** {account.accountNumber.slice(-4)}</div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Transactions</h2>
            <p className="card-subtitle">Your latest account activity</p>
          </div>
          <div className="card-content">
            {getRecentTransactions().length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRecentTransactions().map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{transaction.description}</td>
                        <td>****{transaction.accountNumber.slice(-4)}</td>
                        <td>
                          <span style={{ 
                            color: transaction.amount >= 0 ? '#059669' : '#dc2626',
                            fontWeight: '600'
                          }}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                No transactions found
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4" style={{ marginTop: '32px' }}>
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💸</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Transfer Money</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Send money to other accounts</p>
              <a href="/transfer" className="button button-primary" style={{ textDecoration: 'none' }}>
                Transfer
              </a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Pay Bills</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Pay your monthly bills</p>
              <a href="/bills" className="button button-primary" style={{ textDecoration: 'none' }}>
                Pay Bills
              </a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Credit Cards</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Manage credit card payments</p>
              <a href="/credit-cards" className="button button-primary" style={{ textDecoration: 'none' }}>
                Manage
              </a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💱</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Exchange</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Buy and sell currencies</p>
              <a href="/currency-exchange" className="button button-primary" style={{ textDecoration: 'none' }}>
                Exchange
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;