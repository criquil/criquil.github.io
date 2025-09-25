import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return '↔️';
      case 'DEPOSIT':
        return '⬇️';
      case 'WITHDRAWAL':
        return '⬆️';
      case 'PAYMENT':
        return '💳';
      case 'EXCHANGE':
        return '💱';
      default:
        return '📝';
    }
  };

  return (
    <div className="transaction-list">
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <span title={transaction.type}>
                  {getTransactionIcon(transaction.type)}
                </span>
              </td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.description}</td>
              <td className={transaction.type === 'WITHDRAWAL' || transaction.type === 'TRANSFER' ? 'text-danger' : 'text-success'}>
                {formatCurrency(transaction.amount, transaction.currency)}
              </td>
              <td>
                <Badge bg={getStatusVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {transactions.length === 0 && (
        <p className="text-center text-muted">No transactions to display</p>
      )}
    </div>
  );
};

export default TransactionList;