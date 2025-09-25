export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  accounts: Account[];
  loginAttempts: number;
  isLocked: boolean;
}

export interface Account {
  id: string;
  userId: string;
  type: 'SAVINGS' | 'CHECKING' | 'CREDIT';
  currency: 'USD' | 'EUR' | 'ARS';
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'EXCHANGE';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  recipientId?: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  date: Date;
  read: boolean;
}