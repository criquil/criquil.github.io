import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';

interface TransferPageProps {
  user: User;
  onLogout: () => void;
}

const TransferPage: React.FC<TransferPageProps> = ({ user, onLogout }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);

  const bankingService = BankingService.getInstance();

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const transferAmount = parseFloat(amount);
      
      if (isNaN(transferAmount) || transferAmount <= 0) {
        setMessage('Please enter a valid amount');
        setMessageType('error');
        return;
      }

      const fromAcc = user.accounts.find(acc => acc.id === fromAccount);
      if (!fromAcc) {
        setMessage('Please select a valid account');
        setMessageType('error');
        return;
      }

      if (fromAcc.balance < transferAmount) {
        setMessage('Insufficient funds');
        setMessageType('error');
        return;
      }

      // Find the destination account
      const destination = bankingService.findUserByAccountNumber(toAccountNumber);
      if (!destination) {
        setMessage('Destination account not found');
        setMessageType('error');
        return;
      }

      // Perform the transfer
      const success = bankingService.transfer(
        user.id,
        fromAccount,
        destination.user.id,
        destination.account.id,
        transferAmount,
        description || 'Money Transfer'
      );

      if (success) {
        setMessage(`Successfully transferred ${formatCurrency(transferAmount)} to ${destination.user.firstName} ${destination.user.lastName}`);
        setMessageType('success');
        // Reset form
        setFromAccount('');
        setToAccountNumber('');
        setAmount('');
        setDescription('');
        // Refresh user data
        window.location.reload();
      } else {
        setMessage('Transfer failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during the transfer');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Transfer Money</h1>
        <p className="page-subtitle">Send money to other accounts</p>
      </div>
      
      <div className="page-content">
        <div className="grid grid-cols-2">
          {/* Transfer Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">New Transfer</h2>
              <p className="card-subtitle">Send money to another account</p>
            </div>
            <div className="card-content">
              {message && (
                <div className={`alert alert-${messageType}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleTransfer} className="form">
                <div className="form-group">
                  <label htmlFor="fromAccount" className="form-label">
                    From Account
                  </label>
                  <select
                    id="fromAccount"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Select an account</option>
                    {user.accounts
                      .filter(acc => acc.accountType !== 'credit' && acc.isActive)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountType.toUpperCase()} - {account.accountNumber} 
                          ({formatCurrency(account.balance, account.currency)})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="toAccountNumber" className="form-label">
                    To Account Number
                  </label>
                  <input
                    type="text"
                    id="toAccountNumber"
                    value={toAccountNumber}
                    onChange={(e) => setToAccountNumber(e.target.value)}
                    className="form-input"
                    placeholder="Enter destination account number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                    placeholder="What's this transfer for?"
                  />
                </div>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Transfer Money'}
                </button>
              </form>
            </div>
          </div>

          {/* Account Balances */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Accounts</h2>
              <p className="card-subtitle">Available balances</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1">
                {user.accounts
                  .filter(acc => acc.accountType !== 'credit')
                  .map((account) => (
                    <div key={account.id} className="account-card">
                      <div className="account-type">
                        {account.accountType.toUpperCase()} ACCOUNT
                      </div>
                      <div className="account-balance">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                      <div className="account-number">
                        {account.accountNumber}
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="demo-credentials">
                <h3 className="demo-title">Test Account Numbers</h3>
                <div className="demo-user">
                  <span>John Smith:</span>
                  <span>1000000002</span>
                </div>
                <div className="demo-user">
                  <span>Jane Johnson:</span>
                  <span>1000000003</span>
                </div>
                <div className="demo-user">
                  <span>Admin:</span>
                  <span>1000000001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransferPage;