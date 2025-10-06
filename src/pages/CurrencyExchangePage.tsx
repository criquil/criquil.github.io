import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';
import { mockCurrencyRates } from '../data/mockData';

interface CurrencyExchangePageProps {
  user: User;
  onLogout: () => void;
}

const CurrencyExchangePage: React.FC<CurrencyExchangePageProps> = ({ user, onLogout }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);

  const bankingService = BankingService.getInstance();

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'ARS'];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get exchange rate between two currencies
  const getExchangeRate = (from: string, to: string): number => {
    if (from === to) return 1;
    
    const rate = mockCurrencyRates.find(r => r.from === from && r.to === to);
    if (rate) return rate.rate;
    
    // Try reverse rate
    const reverseRate = mockCurrencyRates.find(r => r.from === to && r.to === from);
    if (reverseRate) return 1 / reverseRate.rate;
    
    return 0;
  };

  // Update exchange rate and converted amount when currencies or amount change
  useEffect(() => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    setExchangeRate(rate);
    
    const amountNum = parseFloat(amount) || 0;
    setConvertedAmount(amountNum * rate);
  }, [fromCurrency, toCurrency, amount]);

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const exchangeAmount = parseFloat(amount);
      
      if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
        setMessage('Please enter a valid amount');
        setMessageType('error');
        return;
      }

      if (!fromAccount || !toAccount) {
        setMessage('Please select both source and destination accounts');
        setMessageType('error');
        return;
      }

      if (fromAccount === toAccount) {
        setMessage('Source and destination accounts must be different');
        setMessageType('error');
        return;
      }

      const fromAcc = user.accounts.find(acc => acc.id === fromAccount);
      const toAcc = user.accounts.find(acc => acc.id === toAccount);
      
      if (!fromAcc || !toAcc) {
        setMessage('Invalid account selection');
        setMessageType('error');
        return;
      }

      if (fromAcc.balance < exchangeAmount) {
        setMessage('Insufficient funds in source account');
        setMessageType('error');
        return;
      }

      if (exchangeRate === 0) {
        setMessage('Exchange rate not available for this currency pair');
        setMessageType('error');
        return;
      }

      const success = bankingService.exchangeCurrency(
        user.id,
        fromAccount,
        toAccount,
        exchangeAmount,
        fromCurrency,
        toCurrency,
        exchangeRate
      );

      if (success) {
        setMessage(
          `Successfully exchanged ${formatCurrency(exchangeAmount, fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)} at rate ${exchangeRate.toFixed(4)}`
        );
        setMessageType('success');
        // Reset form
        setFromAccount('');
        setToAccount('');
        setAmount('');
        // Refresh user data
        window.location.reload();
      } else {
        setMessage('Exchange failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during the exchange');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getAccountsByCurrency = (currency: string) => {
    return user.accounts.filter(acc => acc.currency === currency && acc.accountType !== 'credit' && acc.isActive);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Currency Exchange</h1>
        <p className="page-subtitle">Buy and sell foreign currencies</p>
      </div>
      
      <div className="page-content">
        <div className="grid grid-cols-2">
          {/* Exchange Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Currency Exchange</h2>
              <p className="card-subtitle">Exchange between different currencies</p>
            </div>
            <div className="card-content">
              {message && (
                <div className={`alert alert-${messageType}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleExchange} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fromCurrency" className="form-label">
                      From Currency
                    </label>
                    <select
                      id="fromCurrency"
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="select"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="toCurrency" className="form-label">
                      To Currency
                    </label>
                    <select
                      id="toCurrency"
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="select"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fromAccount" className="form-label">
                    From Account ({fromCurrency})
                  </label>
                  <select
                    id="fromAccount"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Select source account</option>
                    {getAccountsByCurrency(fromCurrency).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountType.toUpperCase()} - {account.accountNumber} 
                        ({formatCurrency(account.balance, account.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="toAccount" className="form-label">
                    To Account ({toCurrency})
                  </label>
                  <select
                    id="toAccount"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Select destination account</option>
                    {getAccountsByCurrency(toCurrency).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountType.toUpperCase()} - {account.accountNumber} 
                        ({formatCurrency(account.balance, account.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount ({fromCurrency})
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

                {/* Exchange Rate Display */}
                {exchangeRate > 0 && (
                  <div className="card">
                    <div className="card-content">
                      <h4 className="card-title">Exchange Details</h4>
                      <div className="table">
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span>Exchange Rate:</span>
                          <span className="badge badge-success">
                            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span>You will receive:</span>
                          <span style={{ fontWeight: '600', color: '#059669' }}>
                            {formatCurrency(convertedAmount, toCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading || exchangeRate === 0}
                >
                  {loading ? 'Processing Exchange...' : 'Exchange Currency'}
                </button>
              </form>
            </div>
          </div>

          {/* Exchange Rates */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Current Exchange Rates</h2>
              <p className="card-subtitle">Live currency exchange rates</p>
            </div>
            <div className="card-content">
              <div className="table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Rate</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCurrencyRates.map((rate, index) => (
                      <tr key={index}>
                        <td>
                          <span className="badge badge-success">{rate.from}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">{rate.to}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {rate.rate.toFixed(4)}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(rate.lastUpdated).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="demo-credentials">
                <h3 className="demo-title">Exchange Information</h3>
                <div className="demo-user">
                  <span>💡 Tip:</span>
                  <span>Rates update in real-time</span>
                </div>
                <div className="demo-user">
                  <span>📊 Spread:</span>
                  <span>Competitive rates</span>
                </div>
                <div className="demo-user">
                  <span>⚡ Speed:</span>
                  <span>Instant transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CurrencyExchangePage;