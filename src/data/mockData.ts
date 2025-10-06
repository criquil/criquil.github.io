import { User, BankAccount, Transaction, CurrencyRate, Bill, CreditCard } from '../types';

// Mock currency rates (in a real app, this would come from an API)
export const mockCurrencyRates: CurrencyRate[] = [
  { from: 'USD', to: 'EUR', rate: 0.85, lastUpdated: new Date() },
  { from: 'USD', to: 'GBP', rate: 0.73, lastUpdated: new Date() },
  { from: 'USD', to: 'JPY', rate: 110.5, lastUpdated: new Date() },
  { from: 'USD', to: 'CAD', rate: 1.25, lastUpdated: new Date() },
  { from: 'USD', to: 'AUD', rate: 1.35, lastUpdated: new Date() },
  { from: 'USD', to: 'ARS', rate: 350.75, lastUpdated: new Date() },
  { from: 'EUR', to: 'USD', rate: 1.18, lastUpdated: new Date() },
  { from: 'GBP', to: 'USD', rate: 1.37, lastUpdated: new Date() },
  { from: 'JPY', to: 'USD', rate: 0.009, lastUpdated: new Date() },
  { from: 'CAD', to: 'USD', rate: 0.80, lastUpdated: new Date() },
  { from: 'AUD', to: 'USD', rate: 0.74, lastUpdated: new Date() },
  { from: 'ARS', to: 'USD', rate: 0.00285, lastUpdated: new Date() },
];

// Mock bills for payment
export const mockBills: Bill[] = [
  {
    id: 'bill-1',
    name: 'Electric Company',
    category: 'utilities',
    amount: 120.50,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRecurring: true,
    payeeAccount: 'ELEC001'
  },
  {
    id: 'bill-2',
    name: 'Internet Provider',
    category: 'internet',
    amount: 79.99,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isRecurring: true,
    payeeAccount: 'INET001'
  },
  {
    id: 'bill-3',
    name: 'Phone Company',
    category: 'phone',
    amount: 65.00,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isRecurring: true,
    payeeAccount: 'PHONE001'
  },
  {
    id: 'bill-4',
    name: 'Car Insurance',
    category: 'insurance',
    amount: 145.75,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    payeeAccount: 'INS001'
  }
];

// Mock credit cards
export const mockCreditCards: CreditCard[] = [
  {
    id: 'cc-1',
    cardNumber: '**** **** **** 1234',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    currentBalance: 1250.00,
    creditLimit: 5000.00,
    minimumPayment: 125.00,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'cc-2',
    cardNumber: '**** **** **** 5678',
    cardHolder: 'Jane Smith',
    expiryDate: '08/26',
    currentBalance: 750.50,
    creditLimit: 3000.00,
    minimumPayment: 75.00,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  }
];

// Generate random transactions
const generateRandomTransactions = (accountId: string, count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment', 'bill_payment'];
  const descriptions = [
    'ATM Withdrawal',
    'Direct Deposit',
    'Online Transfer',
    'Bill Payment',
    'Purchase',
    'Refund',
    'Interest Payment',
    'Fee Charge'
  ];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.round((Math.random() * 1000 + 10) * 100) / 100;
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: `tx-${accountId}-${i}`,
      type,
      amount: type === 'withdrawal' || type === 'payment' || type === 'bill_payment' ? -amount : amount,
      currency: 'USD',
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date,
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Generate 15 test users
export const generateMockUsers = (): User[] => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'William', 'Maria', 'James', 'Anna', 'Daniel', 'Jennifer', 'Thomas'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  
  const users: User[] = [];

  // Admin user
  users.push({
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    email: 'admin@testingbank.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1-555-0000',
    isAdmin: true,
    accounts: [
      {
        id: 'acc-admin-1',
        accountNumber: '1000000001',
        accountType: 'checking',
        balance: 50000.00,
        currency: 'USD',
        isActive: true,
        transactions: generateRandomTransactions('acc-admin-1', 20)
      },
      {
        id: 'acc-admin-2',
        accountNumber: '1100000001',
        accountType: 'savings',
        balance: 17500000.00,
        currency: 'ARS',
        isActive: true,
        transactions: generateRandomTransactions('acc-admin-2', 15)
      }
    ],
    createdAt: new Date('2024-01-01')
  });

  // Generate 15 regular users
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const userId = `user-${i + 1}`;
    
    const checkingBalance = Math.round((Math.random() * 10000 + 500) * 100) / 100;
    const savingsBalance = Math.round((Math.random() * 25000 + 1000) * 100) / 100;
    const creditBalance = Math.round((Math.random() * 3000) * 100) / 100;

    const accounts: BankAccount[] = [
      {
        id: `acc-${userId}-checking`,
        accountNumber: `100000${String(i + 2).padStart(4, '0')}`,
        accountType: 'checking' as const,
        balance: checkingBalance,
        currency: 'USD' as const,
        isActive: true,
        transactions: generateRandomTransactions(`acc-${userId}-checking`, 15)
      },
      {
        id: `acc-${userId}-savings`,
        accountNumber: `200000${String(i + 2).padStart(4, '0')}`,
        accountType: 'savings' as const,
        balance: savingsBalance,
        currency: 'USD' as const,
        isActive: true,
        transactions: generateRandomTransactions(`acc-${userId}-savings`, 8)
      },
      {
        id: `acc-${userId}-credit`,
        accountNumber: `300000${String(i + 2).padStart(4, '0')}`,
        accountType: 'credit' as const,
        balance: -creditBalance,
        currency: 'USD' as const,
        isActive: true,
        creditLimit: 5000,
        transactions: generateRandomTransactions(`acc-${userId}-credit`, 10)
      }
    ];

    // Add ARS account to some users
    if (i < 5) {
      const arsBalance = Math.round((Math.random() * 5000000 + 100000) * 100) / 100;
      accounts.push({
        id: `acc-${userId}-ars`,
        accountNumber: `400000${String(i + 2).padStart(4, '0')}`,
        accountType: 'savings' as const,
        balance: arsBalance,
        currency: 'ARS' as const,
        isActive: true,
        transactions: generateRandomTransactions(`acc-${userId}-ars`, 12)
      });
    }

    users.push({
      id: userId,
      username,
      password: 'password123',
      email: `${username}@email.com`,
      firstName,
      lastName,
      phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      isAdmin: false,
      accounts: accounts,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    });
  }

  return users;
};

export const mockUsers = generateMockUsers();