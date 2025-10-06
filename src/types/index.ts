export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  accounts: BankAccount[];
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'ARS';
  isActive: boolean;
  creditLimit?: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'currency_exchange' | 'bill_payment' | 'credit_payment';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  fromAccount?: string;
  toAccount?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface Bill {
  id: string;
  name: string;
  category: 'utilities' | 'internet' | 'phone' | 'insurance' | 'other';
  amount: number;
  dueDate: Date;
  isRecurring: boolean;
  payeeAccount: string;
}

export interface CreditCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  currentBalance: number;
  creditLimit: number;
  minimumPayment: number;
  dueDate: Date;
}