import React from 'react';
import { Card } from 'react-bootstrap';
import { Account } from '../../types';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onClick }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card 
      className={`h-100 account-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <Card.Body>
        <Card.Title className="d-flex justify-content-between">
          <span>{account.type} Account</span>
          <span className="badge bg-primary">{account.currency}</span>
        </Card.Title>
        <Card.Text className="h3 mb-3">
          {formatCurrency(account.balance, account.currency)}
        </Card.Text>
        <Card.Text className="text-muted small">
          Account ID: {account.id.slice(-4)}
        </Card.Text>
        {account.transactions && account.transactions.length > 0 && (
          <Card.Text className="text-muted small">
            Last transaction: {new Date(account.transactions[0].date).toLocaleDateString()}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default AccountCard;