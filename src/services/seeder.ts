import { db } from './db';
import { User, Account, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_USERS: Omit<User, 'id'>[] = [
  {
    username: 'admin',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    accounts: [],
    loginAttempts: 0,
    isLocked: false
  },
  // Regular users
  ...Array.from({ length: 20 }, (_, i) => ({
    username: `user${i + 1}`,
    password: `pass${i + 1}`,
    firstName: `User`,
    lastName: `${i + 1}`,
    isAdmin: false,
    accounts: [],
    loginAttempts: 0,
    isLocked: false
  }))
];

const CURRENCIES = ['USD', 'EUR', 'ARS'] as const;
const ACCOUNT_TYPES = ['SAVINGS', 'CHECKING'] as const;

export class DatabaseSeeder {
  static async seed(): Promise<void> {
    // Clear existing data
    await db.transaction('rw', 
      [db.users, db.accounts, db.transactions, db.notifications, db.currencyRates],
      async () => {
        await Promise.all([
          db.users.clear(),
          db.accounts.clear(),
          db.transactions.clear(),
          db.notifications.clear(),
          db.currencyRates.clear()
        ]);

        // Create users
        const userPromises = INITIAL_USERS.map(async (userData) => {
          const user = { ...userData, id: uuidv4() };
          await db.users.add(user);
          
          // Create accounts for each user
          const accountPromises = CURRENCIES.map(async (currency) => {
            ACCOUNT_TYPES.forEach(async (type) => {
              const account: Account = {
                id: uuidv4(),
                userId: user.id,
                type,
                currency,
                balance: Math.floor(Math.random() * 10000),
                transactions: []
              };
              await db.accounts.add(account);

              // Create some sample transactions
              const transactions: Omit<Transaction, 'id'>[] = [
                {
                  accountId: account.id,
                  type: 'DEPOSIT',
                  amount: Math.floor(Math.random() * 1000),
                  currency,
                  description: 'Initial deposit',
                  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                  status: 'COMPLETED'
                },
                {
                  accountId: account.id,
                  type: 'WITHDRAWAL',
                  amount: Math.floor(Math.random() * 500),
                  currency,
                  description: 'ATM withdrawal',
                  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                  status: 'COMPLETED'
                }
              ];

              await Promise.all(transactions.map(async (tx) => {
                const transaction = { ...tx, id: uuidv4() };
                await db.transactions.add(transaction);
              }));
            });
          });

          await Promise.all(accountPromises);
        });

        await Promise.all(userPromises);

        // Initialize currency rates
        const rates = [
          { from: 'USD', to: 'EUR', rate: 0.85, lastUpdated: new Date() },
          { from: 'USD', to: 'ARS', rate: 350.45, lastUpdated: new Date() },
          { from: 'EUR', to: 'USD', rate: 1.18, lastUpdated: new Date() },
          { from: 'EUR', to: 'ARS', rate: 412.30, lastUpdated: new Date() },
          { from: 'ARS', to: 'USD', rate: 0.0029, lastUpdated: new Date() },
          { from: 'ARS', to: 'EUR', rate: 0.0024, lastUpdated: new Date() }
        ];

        await Promise.all(rates.map(rate => db.currencyRates.add(rate)));
      }
    );
  }
}