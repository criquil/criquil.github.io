import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';
import { mockCreditCards } from '../data/mockData';

interface CreditCardPageProps {
  user: User;
  onLogout: () => void;
}

const CreditCardPage: React.FC<CreditCardPageProps> = ({ user, onLogout }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'minimum' | 'full' | 'custom'>('minimum');
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

  const getSelectedCardData = () => {
    return mockCreditCards.find(card => card.id === selectedCard);
  };

  const getPaymentAmount = () => {
    const card = getSelectedCardData();
    if (!card) return 0;

    switch (paymentType) {
      case 'minimum':
        return card.minimumPayment;
      case 'full':
        return card.currentBalance;
      case 'custom':
        return parseFloat(paymentAmount) || 0;
      default:
        return 0;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!selectedAccount || !selectedCard) {
        setMessage('Please select an account and a credit card');
        setMessageType('error');
        return;
      }

      const account = user.accounts.find(acc => acc.id === selectedAccount);
      const card = getSelectedCardData();
      
      if (!account || !card) {
        setMessage('Invalid account or credit card selected');
        setMessageType('error');
        return;
      }

      const amount = getPaymentAmount();
      
      if (isNaN(amount) || amount <= 0) {
        setMessage('Please enter a valid payment amount');
        setMessageType('error');
        return;
      }

      if (amount > card.currentBalance) {
        setMessage('Payment amount cannot exceed current balance');
        setMessageType('error');
        return;
      }

      if (account.balance < amount) {
        setMessage('Insufficient funds in selected account');
        setMessageType('error');
        return;
      }

      const success = bankingService.payCreditCard(user.id, selectedAccount, card.id, amount);

      if (success) {
        setMessage(`Successfully paid ${formatCurrency(amount)} to ${card.cardNumber}`);
        setMessageType('success');
        // Reset form
        setSelectedAccount('');
        setSelectedCard('');
        setPaymentAmount('');
        setPaymentType('minimum');
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

  const getCreditUtilization = (card: any) => {
    return ((card.currentBalance / card.creditLimit) * 100).toFixed(1);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return '#059669';
    if (utilization <= 70) return '#d97706';
    return '#dc2626';
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Credit Cards</h1>
        <p className="page-subtitle">Manage your credit card payments</p>
      </div>
      
      <div className="page-content">
        <div className="grid grid-cols-2">
          {/* Payment Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Credit Card Payment</h2>
              <p className="card-subtitle">Pay your credit card balance</p>
            </div>
            <div className="card-content">
              {message && (
                <div className={`alert alert-${messageType}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handlePayment} className="form">
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
                  <label htmlFor="selectedCard" className="form-label">
                    Select Credit Card
                  </label>
                  <select
                    id="selectedCard"
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Choose a credit card</option>
                    {mockCreditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.cardNumber} - {card.cardHolder} (Balance: {formatCurrency(card.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCard && (
                  <div className="form-group">
                    <label className="form-label">Payment Type</label>
                    <div className="grid grid-cols-1">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="minimum"
                          checked={paymentType === 'minimum'}
                          onChange={(e) => setPaymentType(e.target.value as 'minimum')}
                        />
                        <div>
                          <div style={{ fontWeight: '600' }}>Minimum Payment</div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            {getSelectedCardData() && formatCurrency(getSelectedCardData()!.minimumPayment)}
                          </div>
                        </div>
                      </label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="full"
                          checked={paymentType === 'full'}
                          onChange={(e) => setPaymentType(e.target.value as 'full')}
                        />
                        <div>
                          <div style={{ fontWeight: '600' }}>Pay Full Balance</div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            {getSelectedCardData() && formatCurrency(getSelectedCardData()!.currentBalance)}
                          </div>
                        </div>
                      </label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="custom"
                          checked={paymentType === 'custom'}
                          onChange={(e) => setPaymentType(e.target.value as 'custom')}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>Custom Amount</div>
                          {paymentType === 'custom' && (
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="form-input"
                              placeholder="Enter amount"
                              min="0.01"
                              step="0.01"
                              style={{ marginTop: '8px' }}
                              required
                            />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {selectedCard && (
                  <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="card-content">
                      <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Payment Summary</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Payment Amount:</span>
                        <span style={{ fontWeight: '600' }}>{formatCurrency(getPaymentAmount())}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Remaining Balance:</span>
                        <span style={{ fontWeight: '600' }}>
                          {getSelectedCardData() && formatCurrency(getSelectedCardData()!.currentBalance - getPaymentAmount())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing Payment...' : 'Make Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Credit Cards Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Credit Cards</h2>
              <p className="card-subtitle">Credit card details and balances</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1">
                {mockCreditCards.map((card) => {
                  const utilization = parseFloat(getCreditUtilization(card));
                  return (
                    <div key={card.id} className="card">
                      <div className="card-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{card.cardNumber}</h3>
                            <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>{card.cardHolder}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Expires</div>
                            <div style={{ fontWeight: '600' }}>{card.expiryDate}</div>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Current Balance</span>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                              {formatCurrency(card.currentBalance)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Credit Limit</span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                              {formatCurrency(card.creditLimit)}
                            </span>
                          </div>
                          
                          {/* Credit Utilization Bar */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Credit Utilization</span>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: getUtilizationColor(utilization) }}>
                                {utilization}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${Math.min(utilization, 100)}%`, 
                                  height: '100%', 
                                  backgroundColor: getUtilizationColor(utilization),
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Minimum Payment</div>
                            <div style={{ fontWeight: '600' }}>{formatCurrency(card.minimumPayment)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Due Date</div>
                            <div style={{ fontWeight: '600', color: new Date(card.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? '#dc2626' : '#374151' }}>
                              {formatDate(card.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreditCardPage;