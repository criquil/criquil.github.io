import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { AccountService, TransactionService, NotificationService } from '../../services/api';
import { Account } from '../../types';
import { FormField } from '../shared';
import NavigationBar from '../NavigationBar';
import { db } from '../../services/db';

const CurrencyExchangePage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

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

  useEffect(() => {
    const updateExchangeRate = async () => {
      const fromAcc = accounts.find(a => a.id === fromAccount);
      const toAcc = accounts.find(a => a.id === toAccount);

      if (fromAcc && toAcc && fromAcc.currency !== toAcc.currency) {
        try {
          const rate = await db.currencyRates
            .where(['from', 'to'])
            .equals([fromAcc.currency, toAcc.currency])
            .first();

          if (rate) {
            setExchangeRate(rate.rate);
          } else {
            setError('Exchange rate not available');
          }
        } catch (err) {
          setError('Failed to fetch exchange rate');
        }
      } else {
        setExchangeRate(null);
      }
    };

    updateExchangeRate();
  }, [fromAccount, toAccount, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const sourceAccount = accounts.find(a => a.id === fromAccount);
      const targetAccount = accounts.find(a => a.id === toAccount);

      if (!sourceAccount || !targetAccount || !exchangeRate) {
        throw new Error('Invalid account selection or exchange rate');
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amountNum > sourceAccount.balance) {
        throw new Error('Insufficient funds');
      }

      // Create withdrawal from source account
      await TransactionService.createTransaction({
        accountId: fromAccount,
        type: 'EXCHANGE',
        amount: amountNum,
        currency: sourceAccount.currency,
        description: `Exchange to ${targetAccount.currency}`,
        date: new Date(),
        status: 'COMPLETED'
      });

      // Create deposit to target account
      await TransactionService.createTransaction({
        accountId: toAccount,
        type: 'EXCHANGE',
        amount: amountNum * exchangeRate,
        currency: targetAccount.currency,
        description: `Exchange from ${sourceAccount.currency}`,
        date: new Date(),
        status: 'COMPLETED'
      });

      await NotificationService.createNotification({
        userId: user!.id,
        message: `Successfully exchanged ${sourceAccount.currency} ${amountNum} to ${targetAccount.currency} ${(amountNum * exchangeRate).toFixed(2)}`,
        type: 'SUCCESS'
      });

      setSuccess('Currency exchange completed successfully');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Container>
        <h2 className="mb-4">Currency Exchange</h2>

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
                placeholder="Enter amount to exchange"
              />

              {exchangeRate && (
                <Alert variant="info">
                  Exchange Rate: 1 {accounts.find(a => a.id === fromAccount)?.currency} = {exchangeRate} {accounts.find(a => a.id === toAccount)?.currency}
                  <br />
                  {amount && !isNaN(parseFloat(amount)) && (
                    <strong>
                      You will receive: {(parseFloat(amount) * exchangeRate).toFixed(2)} {accounts.find(a => a.id === toAccount)?.currency}
                    </strong>
                  )}
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !exchangeRate}
              >
                {loading ? 'Processing...' : 'Exchange'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CurrencyExchangePage;