import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { AccountService, TransactionService, NotificationService } from '../../services/api';
import { Account } from '../../types';
import { FormField, LoadingSpinner } from '../shared';
import NavigationBar from '../NavigationBar';

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        try {
          const userAccounts = await AccountService.getAccounts(user.id);
          setAccounts(userAccounts);
        } catch (err) {
          setError('Failed to load accounts');
        }
      }
      setLoading(false);
    };

    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const sourceAccount = accounts.find(a => a.id === fromAccount);
      if (!sourceAccount) throw new Error('Source account not found');

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amountNum > sourceAccount.balance) {
        throw new Error('Insufficient funds');
      }

      await TransactionService.createTransaction({
        accountId: fromAccount,
        type: 'TRANSFER',
        amount: amountNum,
        currency: sourceAccount.currency,
        description: description || 'Transfer',
        date: new Date(),
        status: 'COMPLETED',
        recipientId: toAccount
      });

      await NotificationService.createNotification({
        userId: user!.id,
        message: `Successfully transferred ${sourceAccount.currency} ${amountNum} to account ending in ${toAccount.slice(-4)}`,
        type: 'SUCCESS'
      });

      setSuccess('Transfer completed successfully');
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Container>
        <h2 className="mb-4">Transfer Money</h2>
        
        {loading && <LoadingSpinner />}
        
        <Card className="mb-4">
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>From Account</Form.Label>
                <Form.Select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  required
                  data-testid="from-account-select"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.type} - {account.currency} {account.balance}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>To Account</Form.Label>
                <Form.Select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  required
                  data-testid="to-account-select"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter(account => account.id !== fromAccount)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.type} - {account.currency} {account.balance}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <FormField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="Enter amount"
                testId="amount-input"
              />

              <FormField
                label="Description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                testId="description-input"
              />

              <Button
                type="submit"
                disabled={loading}
                data-testid="submit-transfer"
              >
                {loading ? 'Processing...' : 'Transfer'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default TransferPage;