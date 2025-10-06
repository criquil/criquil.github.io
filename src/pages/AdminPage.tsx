import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BankingService } from '../utils/bankingService';

interface AdminPageProps {
  user: User;
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'accounts' | 'transactions' | 'admin-tools' | 'generate-transactions' | 'cancel-transactions'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [adminMoneyAmount, setAdminMoneyAmount] = useState('');
  const [selectedAdminAccount, setSelectedAdminAccount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Transaction generation state
  const [transactionTargetUser, setTransactionTargetUser] = useState('');
  const [transactionTargetAccount, setTransactionTargetAccount] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'bill_payment' | 'credit_payment'>('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionCurrency, setTransactionCurrency] = useState('USD');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionFromAccount, setTransactionFromAccount] = useState('');
  const [transactionPayeeName, setTransactionPayeeName] = useState('');

  // Transaction cancellation state
  const [selectedTransactionForCancel, setSelectedTransactionForCancel] = useState<{
    userId: string;
    accountId: string;
    transactionId: string;
    transaction: any;
  } | null>(null);

  const bankingService = BankingService.getInstance();
  const allUsers = bankingService.getAllUsers();

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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) {
      setMessage('Please select a user and enter a new password');
      setMessageType('error');
      return;
    }

    const success = bankingService.changePassword(selectedUser.id, newPassword);
    if (success) {
      setMessage(`Password changed successfully for ${selectedUser.firstName} ${selectedUser.lastName}`);
      setMessageType('success');
      setNewPassword('');
    } else {
      setMessage('Failed to change password');
      setMessageType('error');
    }
  };

  const handleBalanceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedAccount || !balanceAmount) {
      setMessage('Please select a user, account, and enter a balance amount');
      setMessageType('error');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      setMessage('Please enter a valid balance amount');
      setMessageType('error');
      return;
    }

    const success = bankingService.updateAccountBalance(selectedUser.id, selectedAccount, amount);
    if (success) {
      setMessage(`Account balance updated successfully`);
      setMessageType('success');
      setBalanceAmount('');
      window.location.reload(); // Refresh to show updated balance
    } else {
      setMessage('Failed to update account balance');
      setMessageType('error');
    }
  };

  const handleAdminMoneyCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminAccount || !adminMoneyAmount) {
      setMessage('Please select an admin account and enter an amount');
      setMessageType('error');
      return;
    }

    const amount = parseFloat(adminMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    const success = bankingService.createMoneyForAdmin(user.id, selectedAdminAccount, amount);
    if (success) {
      setMessage(`Successfully created ${formatCurrency(amount)} for admin account`);
      setMessageType('success');
      setAdminMoneyAmount('');
      window.location.reload(); // Refresh to show updated balance
    } else {
      setMessage('Failed to create money. Only admin users can create money.');
      setMessageType('error');
    }
  };

  const handleTransactionGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionTargetUser || !transactionTargetAccount || !transactionAmount || !transactionDescription) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    // Validate transfer specific fields
    if (transactionType === 'transfer' && !transactionFromAccount) {
      setMessage('Please select a source account for transfer');
      setMessageType('error');
      return;
    }

    // Validate bill payment specific fields
    if (transactionType === 'bill_payment' && !transactionPayeeName) {
      setMessage('Please enter a payee name for bill payment');
      setMessageType('error');
      return;
    }

    const transactionData = {
      type: transactionType,
      amount,
      currency: transactionCurrency,
      description: transactionDescription,
      fromAccountId: transactionFromAccount || undefined,
      payeeName: transactionPayeeName || undefined
    };

    const success = bankingService.generateAdminTransaction(
      user.id,
      transactionTargetUser,
      transactionTargetAccount,
      transactionData
    );

    if (success) {
      setMessage(`Successfully generated ${transactionType} transaction`);
      setMessageType('success');
      // Reset form
      setTransactionTargetUser('');
      setTransactionTargetAccount('');
      setTransactionAmount('');
      setTransactionDescription('');
      setTransactionFromAccount('');
      setTransactionPayeeName('');
      window.location.reload(); // Refresh to show updated data
    } else {
      setMessage('Failed to generate transaction');
      setMessageType('error');
    }
  };

  const handleTransactionCancellation = () => {
    if (!selectedTransactionForCancel) {
      setMessage('Please select a transaction to cancel');
      setMessageType('error');
      return;
    }

    const success = bankingService.cancelTransaction(
      user.id,
      selectedTransactionForCancel.userId,
      selectedTransactionForCancel.accountId,
      selectedTransactionForCancel.transactionId
    );

    if (success) {
      console.log('Transaction cancelled successfully from AdminPage');
      setMessage('Transaction cancelled successfully and reversal applied');
      setMessageType('success');
      setSelectedTransactionForCancel(null);
      console.log('About to reload page to refresh data...');
      window.location.reload(); // Refresh to show updated data
    } else {
      console.log('Failed to cancel transaction from AdminPage');
      setMessage('Failed to cancel transaction');
      setMessageType('error');
    }
  };

  const generateTransaction = (userId: string, accountId: string, type: 'deposit' | 'withdrawal', amount: number, description: string) => {
    const transactionAmount = type === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount);
    const success = bankingService.createTransaction(userId, accountId, {
      type: type,
      amount: transactionAmount,
      currency: 'USD',
      description: description,
      status: 'completed'
    });

    if (success) {
      setMessage(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${formatCurrency(Math.abs(amount))} created successfully`);
      setMessageType('success');
      window.location.reload();
    } else {
      setMessage('Failed to create transaction');
      setMessageType('error');
    }
  };

  const getAllTransactions = () => {
    const allTransactions: any[] = [];
    allUsers.forEach(user => {
      user.accounts.forEach(account => {
        account.transactions.forEach(tx => {
          allTransactions.push({
            ...tx,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            accountNumber: account.accountNumber,
            accountType: account.accountType
          });
        });
      });
    });
    return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 100);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage users, accounts, and system settings</p>
      </div>
      
      <div className="page-content">
        {/* Admin Tabs */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setActiveTab('users')}
                className={`button ${activeTab === 'users' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`button ${activeTab === 'accounts' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                Account Management
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`button ${activeTab === 'transactions' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                Transaction History
              </button>
              <button
                onClick={() => setActiveTab('admin-tools')}
                className={`button ${activeTab === 'admin-tools' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                Admin Tools
              </button>
              <button
                onClick={() => setActiveTab('generate-transactions')}
                className={`button ${activeTab === 'generate-transactions' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                Generate Transactions
              </button>
              <button
                onClick={() => setActiveTab('cancel-transactions')}
                className={`button ${activeTab === 'cancel-transactions' ? 'button-primary' : 'button-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
              >
                Cancel Transactions
              </button>
            </div>
          </div>
          
          <div className="card-content">
            {message && (
              <div className={`alert alert-${messageType}`}>
                {message}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="card-title">User Management</h3>
                <div className="grid grid-cols-2">
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>All Users</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Accounts</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.map((u) => (
                            <tr key={u.id} style={{ backgroundColor: selectedUser?.id === u.id ? '#eff6ff' : 'transparent' }}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: '600' }}>{u.firstName} {u.lastName}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {u.isAdmin ? '👑 Admin' : '👤 User'}
                                  </div>
                                </div>
                              </td>
                              <td>{u.email}</td>
                              <td>{u.accounts.length}</td>
                              <td>
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="button button-secondary"
                                  style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Change Password</h4>
                    {selectedUser ? (
                      <form onSubmit={handlePasswordChange} className="form">
                        <div className="form-group">
                          <label className="form-label">Selected User</label>
                          <div className="card">
                            <div className="card-content">
                              <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                              <br />
                              <small style={{ color: '#64748b' }}>{selectedUser.email}</small>
                            </div>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="newPassword" className="form-label">New Password</label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                        <button type="submit" className="button button-primary">
                          Change Password
                        </button>
                      </form>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                        Select a user to change their password
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div>
                <h3 className="card-title">Account Management</h3>
                <div className="grid grid-cols-2">
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>User Accounts</h4>
                    {selectedUser ? (
                      <div>
                        <div className="card">
                          <div className="card-content">
                            <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                            <br />
                            <small style={{ color: '#64748b' }}>{selectedUser.email}</small>
                          </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                          {selectedUser.accounts.map((account) => (
                            <div key={account.id} className="card" style={{ marginBottom: '8px' }}>
                              <div className="card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: '600' }}>
                                      {account.accountType.toUpperCase()} - {account.accountNumber}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                      Balance: {formatCurrency(account.balance, account.currency)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedAccount(account.id)}
                                    className={`button ${selectedAccount === account.id ? 'button-primary' : 'button-secondary'}`}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    {selectedAccount === account.id ? 'Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                        Select a user from the Users tab first
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Account Actions</h4>
                    {selectedUser && selectedAccount ? (
                      <div className="form">
                        <div className="form-group">
                          <label className="form-label">Update Account Balance</label>
                          <form onSubmit={handleBalanceUpdate} className="form">
                            <div className="form-group">
                              <input
                                type="number"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                className="form-input"
                                placeholder="New balance amount"
                                step="0.01"
                                required
                              />
                            </div>
                            <button type="submit" className="button button-primary">
                              Update Balance
                            </button>
                          </form>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Generate Transactions</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => generateTransaction(selectedUser.id, selectedAccount, 'deposit', 100, 'Admin deposit')}
                              className="button button-primary"
                              style={{ fontSize: '12px' }}
                            >
                              +$100 Deposit
                            </button>
                            <button
                              onClick={() => generateTransaction(selectedUser.id, selectedAccount, 'deposit', 500, 'Admin deposit')}
                              className="button button-primary"
                              style={{ fontSize: '12px' }}
                            >
                              +$500 Deposit
                            </button>
                            <button
                              onClick={() => generateTransaction(selectedUser.id, selectedAccount, 'withdrawal', 50, 'Admin withdrawal')}
                              className="button button-danger"
                              style={{ fontSize: '12px' }}
                            >
                              -$50 Withdrawal
                            </button>
                            <button
                              onClick={() => generateTransaction(selectedUser.id, selectedAccount, 'withdrawal', 200, 'Admin withdrawal')}
                              className="button button-danger"
                              style={{ fontSize: '12px' }}
                            >
                              -$200 Withdrawal
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                        Select a user and account to perform actions
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h3 className="card-title">Recent Transactions (Last 100)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Account</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllTransactions().map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ fontSize: '12px' }}>{formatDate(tx.date)}</td>
                          <td style={{ fontSize: '12px' }}>{tx.userName}</td>
                          <td style={{ fontSize: '12px' }}>
                            {tx.accountType.toUpperCase()}<br />
                            ****{tx.accountNumber.slice(-4)}
                          </td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ 
                            fontWeight: '600',
                            color: tx.amount >= 0 ? '#059669' : '#dc2626'
                          }}>
                            {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                          </td>
                          <td style={{ fontSize: '12px', maxWidth: '200px' }}>{tx.description}</td>
                          <td>
                            <span className={`badge ${
                              tx.status === 'completed' ? 'badge-success' : 
                              tx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                            }`} style={{ fontSize: '10px' }}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Tools Tab */}
            {activeTab === 'admin-tools' && (
              <div>
                <h3 className="card-title">Admin Tools</h3>
                <div className="grid grid-cols-2">
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Admin Accounts</h4>
                    <div>
                      {user.accounts.map((account) => (
                        <div key={account.id} className="card" style={{ marginBottom: '8px' }}>
                          <div className="card-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: '600' }}>
                                  {account.accountType.toUpperCase()} - {account.accountNumber}
                                </div>
                                <div style={{ fontSize: '14px', color: '#64748b' }}>
                                  Balance: {formatCurrency(account.balance, account.currency)}
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedAdminAccount(account.id)}
                                className={`button ${selectedAdminAccount === account.id ? 'button-primary' : 'button-secondary'}`}
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                              >
                                {selectedAdminAccount === account.id ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Create Money (Admin Only)</h4>
                    <div className="card">
                      <div className="card-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                          <span style={{ fontSize: '24px' }}>🏦</span>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e40af' }}>Money Creation Tool</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              As an admin, you can create money and add it to your accounts
                            </div>
                          </div>
                        </div>
                        
                        {selectedAdminAccount ? (
                          <form onSubmit={handleAdminMoneyCreation} className="form">
                            <div className="form-group">
                              <label className="form-label">Selected Admin Account</label>
                              <div className="card">
                                <div className="card-content">
                                  <strong>
                                    {user.accounts.find(a => a.id === selectedAdminAccount)?.accountType.toUpperCase()} - 
                                    {user.accounts.find(a => a.id === selectedAdminAccount)?.accountNumber}
                                  </strong>
                                  <br />
                                  <small style={{ color: '#64748b' }}>
                                    Current Balance: {formatCurrency(user.accounts.find(a => a.id === selectedAdminAccount)?.balance || 0)}
                                  </small>
                                </div>
                              </div>
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="adminMoneyAmount" className="form-label">
                                Amount to Create
                              </label>
                              <input
                                type="number"
                                id="adminMoneyAmount"
                                value={adminMoneyAmount}
                                onChange={(e) => setAdminMoneyAmount(e.target.value)}
                                className="form-input"
                                placeholder="Enter amount to create"
                                min="0.01"
                                step="0.01"
                                required
                              />
                            </div>
                            
                            <button type="submit" className="button button-primary">
                              💰 Create Money
                            </button>
                          </form>
                        ) : (
                          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                            Select an admin account to create money
                          </p>
                        )}
                        
                        <div className="demo-credentials" style={{ marginTop: '20px' }}>
                          <h3 className="demo-title">💡 Quick Actions</h3>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setAdminMoneyAmount('1000')}
                              className="button button-secondary"
                              style={{ fontSize: '12px' }}
                            >
                              $1,000
                            </button>
                            <button
                              onClick={() => setAdminMoneyAmount('5000')}
                              className="button button-secondary"
                              style={{ fontSize: '12px' }}
                            >
                              $5,000
                            </button>
                            <button
                              onClick={() => setAdminMoneyAmount('10000')}
                              className="button button-secondary"
                              style={{ fontSize: '12px' }}
                            >
                              $10,000
                            </button>
                            <button
                              onClick={() => setAdminMoneyAmount('50000')}
                              className="button button-secondary"
                              style={{ fontSize: '12px' }}
                            >
                              $50,000
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Transactions Tab */}
            {activeTab === 'generate-transactions' && (
              <div>
                <h3 className="card-title">Generate Transactions</h3>
                <div className="grid grid-cols-2">
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Select Target User</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' }}>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          {allUsers.filter(u => !u.isAdmin).map((u) => (
                            <tr key={u.id} style={{ backgroundColor: transactionTargetUser === u.id ? '#eff6ff' : 'transparent' }}>
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontWeight: '600' }}>{u.firstName} {u.lastName}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  {u.username} • {u.email}
                                </div>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                <button
                                  onClick={() => {
                                    setTransactionTargetUser(u.id);
                                    setTransactionTargetAccount(''); // Reset account selection
                                  }}
                                  className={`button ${transactionTargetUser === u.id ? 'button-primary' : 'button-secondary'}`}
                                  style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                  {transactionTargetUser === u.id ? 'Selected' : 'Select'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {transactionTargetUser && (
                      <div>
                        <h4 style={{ marginBottom: '16px' }}>Select Target Account</h4>
                        <div style={{ marginBottom: '16px' }}>
                          {allUsers.find(u => u.id === transactionTargetUser)?.accounts.map((account) => (
                            <div key={account.id} className="card" style={{ marginBottom: '8px' }}>
                              <div className="card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: '600' }}>
                                      {account.accountType.toUpperCase()} - {account.accountNumber}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                      Balance: {formatCurrency(account.balance, account.currency)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setTransactionTargetAccount(account.id)}
                                    className={`button ${transactionTargetAccount === account.id ? 'button-primary' : 'button-secondary'}`}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    {transactionTargetAccount === account.id ? 'Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Transaction Details</h4>
                    {transactionTargetUser && transactionTargetAccount ? (
                      <form onSubmit={handleTransactionGeneration} className="form">
                        <div className="form-group">
                          <label>Transaction Type:</label>
                          <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value as any)}
                            className="form-input"
                          >
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer">Transfer</option>
                            <option value="payment">Payment</option>
                            <option value="bill_payment">Bill Payment</option>
                            <option value="credit_payment">Credit Payment</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Amount:</label>
                          <input
                            type="number"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            className="form-input"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Currency:</label>
                          <select
                            value={transactionCurrency}
                            onChange={(e) => setTransactionCurrency(e.target.value)}
                            className="form-input"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                            <option value="CAD">CAD</option>
                            <option value="ARS">ARS</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Description:</label>
                          <input
                            type="text"
                            value={transactionDescription}
                            onChange={(e) => setTransactionDescription(e.target.value)}
                            className="form-input"
                            placeholder="Transaction description"
                            required
                          />
                        </div>

                        {transactionType === 'transfer' && (
                          <div className="form-group">
                            <label>From Account:</label>
                            <select
                              value={transactionFromAccount}
                              onChange={(e) => setTransactionFromAccount(e.target.value)}
                              className="form-input"
                              required
                            >
                              <option value="">Select source account</option>
                              {allUsers.find(u => u.id === transactionTargetUser)?.accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.accountType.toUpperCase()} - {account.accountNumber} ({formatCurrency(account.balance, account.currency)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {transactionType === 'bill_payment' && (
                          <div className="form-group">
                            <label>Payee Name:</label>
                            <input
                              type="text"
                              value={transactionPayeeName}
                              onChange={(e) => setTransactionPayeeName(e.target.value)}
                              className="form-input"
                              placeholder="Enter payee name"
                              required
                            />
                          </div>
                        )}
                        
                        <button type="submit" className="button button-primary">
                          ⚡ Generate Transaction
                        </button>
                      </form>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                        Select a user and account to generate transactions
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Transactions Tab */}
            {activeTab === 'cancel-transactions' && (
              <div>
                <h3 className="card-title">Cancel Transactions</h3>
                <div className="grid grid-cols-2">
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>All Transactions</h4>
                    <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>User</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Account</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Transaction</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bankingService.getAllTransactions()
                            .filter(({ transaction }) => transaction.status === 'completed') // Only show completed transactions
                            .slice(0, 50) // Limit to 50 most recent
                            .map(({ user: txUser, account, transaction }) => (
                            <tr 
                              key={`${txUser.id}-${account.id}-${transaction.id}`}
                              style={{ 
                                backgroundColor: selectedTransactionForCancel?.transactionId === transaction.id ? '#eff6ff' : 'transparent',
                                borderBottom: '1px solid #f1f5f9'
                              }}
                            >
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600' }}>
                                  {txUser.firstName} {txUser.lastName}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{txUser.username}</div>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontSize: '12px' }}>
                                  {account.accountType.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{account.accountNumber}</div>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600' }}>
                                  {formatCurrency(transaction.amount, transaction.currency)}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  {transaction.type} • {formatDate(new Date(transaction.date))}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                  {transaction.description}
                                </div>
                              </td>
                              <td style={{ padding: '8px' }}>
                                {transaction.status === 'completed' ? (
                                  <button
                                    onClick={() => setSelectedTransactionForCancel({
                                      userId: txUser.id,
                                      accountId: account.id,
                                      transactionId: transaction.id,
                                      transaction: transaction
                                    })}
                                    className={`button ${selectedTransactionForCancel?.transactionId === transaction.id ? 'button-primary' : 'button-secondary'}`}
                                    style={{ fontSize: '10px', padding: '4px 8px' }}
                                  >
                                    {selectedTransactionForCancel?.transactionId === transaction.id ? 'Selected' : 'Select'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    {transaction.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Cancel Transaction</h4>
                    {selectedTransactionForCancel ? (
                      <div className="card">
                        <div className="card-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <div>
                              <div style={{ fontWeight: '600', color: '#dc2626' }}>Cancel Transaction</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                This will create a reversal transaction to offset the original amount
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>Selected Transaction</h5>
                            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                              <div><strong>Amount:</strong> {formatCurrency(selectedTransactionForCancel.transaction.amount, selectedTransactionForCancel.transaction.currency)}</div>
                              <div><strong>Type:</strong> {selectedTransactionForCancel.transaction.type}</div>
                              <div><strong>Description:</strong> {selectedTransactionForCancel.transaction.description}</div>
                              <div><strong>Date:</strong> {formatDate(new Date(selectedTransactionForCancel.transaction.date))}</div>
                              <div><strong>Reference:</strong> {selectedTransactionForCancel.transaction.reference || 'N/A'}</div>
                            </div>
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>Reversal Details</h5>
                            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '6px', fontSize: '12px', border: '1px solid #bbf7d0' }}>
                              <div><strong>Reversal Amount:</strong> {formatCurrency(-selectedTransactionForCancel.transaction.amount, selectedTransactionForCancel.transaction.currency)}</div>
                              <div><strong>New Description:</strong> Cancellation of: {selectedTransactionForCancel.transaction.description}</div>
                              <div><strong>Effect:</strong> The original transaction will be marked as cancelled and a new reversal transaction will be created</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={handleTransactionCancellation}
                              className="button button-primary"
                              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                            >
                              🚫 Cancel Transaction
                            </button>
                            <button 
                              onClick={() => setSelectedTransactionForCancel(null)}
                              className="button button-secondary"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                        Select a transaction to cancel from the list on the left
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;