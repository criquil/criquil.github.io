import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';
import { mockBills } from '../data/mockData';

interface BillPaymentPageProps {
  user: User;
  onLogout: () => void;
}

const BillPaymentPage: React.FC<BillPaymentPageProps> = ({ user, onLogout }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedBill, setSelectedBill] = useState('');
  const [customAmount, setCustomAmount] = useState('');
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'utilities': '⚡',
      'internet': '🌐',
      'phone': '📱',
      'insurance': '🛡️',
      'other': '📄'
    };
    return icons[category] || '📄';
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!selectedAccount || !selectedBill) {
        setMessage('Please select an account and a bill');
        setMessageType('error');
        return;
      }

      const account = user.accounts.find(acc => acc.id === selectedAccount);
      const bill = mockBills.find(b => b.id === selectedBill);
      
      if (!account || !bill) {
        setMessage('Invalid account or bill selected');
        setMessageType('error');
        return;
      }

      const paymentAmount = customAmount ? parseFloat(customAmount) : bill.amount;
      
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        setMessage('Please enter a valid payment amount');
        setMessageType('error');
        return;
      }

      if (account.balance < paymentAmount) {
        setMessage('Insufficient funds in selected account');
        setMessageType('error');
        return;
      }

      const success = bankingService.payBill(user.id, selectedAccount, bill.id, paymentAmount);

      if (success) {
        setMessage(`Successfully paid ${formatCurrency(paymentAmount)} to ${bill.name}`);
        setMessageType('success');
        // Reset form
        setSelectedAccount('');
        setSelectedBill('');
        setCustomAmount('');
        // Refresh user data
        window.location.reload();
      } else {
        setMessage('Payment failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during payment');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const selectedBillData = mockBills.find(b => b.id === selectedBill);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Pay Bills</h1>
        <p className="page-subtitle">Pay your monthly bills and services</p>
      </div>
      
      <div className="page-content">
        <div className="grid grid-cols-2">
          {/* Payment Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Bill Payment</h2>
              <p className="card-subtitle">Select a bill to pay</p>
            </div>
            <div className="card-content">
              {message && (
                <div className={`alert alert-${messageType}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handlePayBill} className="form">
                <div className="form-group">
                  <label htmlFor="selectedAccount" className="form-label">
                    Pay From Account
                  </label>
                  <select
                    id="selectedAccount"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
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
                  <label htmlFor="selectedBill" className="form-label">
                    Select Bill
                  </label>
                  <select
                    id="selectedBill"
                    value={selectedBill}
                    onChange={(e) => setSelectedBill(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Choose a bill to pay</option>
                    {mockBills.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {bill.name} - {formatCurrency(bill.amount)} (Due: {formatDate(bill.dueDate)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBillData && (
                  <div className="form-group">
                    <label htmlFor="customAmount" className="form-label">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      id="customAmount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="form-input"
                      placeholder={`Default: ${formatCurrency(selectedBillData.amount)}`}
                      min="0.01"
                      step="0.01"
                    />
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Leave empty to pay the full amount ({formatCurrency(selectedBillData.amount)})
                    </small>
                  </div>
                )}

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing Payment...' : 'Pay Bill'}
                </button>
              </form>
            </div>
          </div>

          {/* Available Bills */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Bills</h2>
              <p className="card-subtitle">Bills you can pay</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1">
                {mockBills.map((bill) => (
                  <div key={bill.id} className="card">
                    <div className="card-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{getCategoryIcon(bill.category)}</span>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{bill.name}</h3>
                          <p style={{ fontSize: '14px', color: '#64748b', margin: '0', textTransform: 'capitalize' }}>
                            {bill.category.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                            {formatCurrency(bill.amount)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Due: {formatDate(bill.dueDate)}
                          </div>
                        </div>
                        {bill.isRecurring && (
                          <span className="badge badge-success">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillPaymentPage;