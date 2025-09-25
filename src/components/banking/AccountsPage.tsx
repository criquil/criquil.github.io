import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { AccountService, TransactionService } from '../../services/api';
import { Account, Transaction } from '../../types';
import { LoadingSpinner, AccountCard, TransactionList } from '../shared';
import NavigationBar from '../NavigationBar';

const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        try {
          const userAccounts = await AccountService.getAccounts(user.id);
          setAccounts(userAccounts);
        } catch (error) {
          console.error('Failed to fetch accounts:', error);
        }
      }
      setLoading(false);
    };

    fetchAccounts();
  }, [user]);

  const handleAccountClick = async (account: Account) => {
    setSelectedAccount(account);
    try {
      const accountTransactions = await TransactionService.getTransactions(account.id);
      setTransactions(accountTransactions);
      setShowTransactions(true);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleCloseTransactions = () => {
    setShowTransactions(false);
    setSelectedAccount(null);
    setTransactions([]);
  };

  const getTotalBalance = (currency: string) => {
    return accounts
      .filter(account => account.currency === currency)
      .reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-4">
          <LoadingSpinner />
        </Container>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Container>
        <h2 className="mb-4">Your Accounts</h2>

        <Row className="mb-4">
          {['USD', 'EUR', 'ARS'].map(currency => (
            <Col key={currency} md={4}>
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-muted">Total in {currency}</h6>
                  <h3 className="mb-0">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency
                    }).format(getTotalBalance(currency))}
                  </h3>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <Row>
          {accounts.map(account => (
            <Col key={account.id} md={6} lg={4} className="mb-4">
              <AccountCard
                account={account}
                onClick={() => handleAccountClick(account)}
              />
            </Col>
          ))}
        </Row>

        <Modal
          show={showTransactions}
          onHide={handleCloseTransactions}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedAccount?.type} Account Transactions - {selectedAccount?.currency}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TransactionList transactions={transactions} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseTransactions}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AccountsPage;