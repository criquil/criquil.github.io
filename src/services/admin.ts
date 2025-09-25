import { db } from './db';
import { User, Account, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AdminService {
  static async getAllUsers(): Promise<User[]> {
    return db.users.toArray();
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser = { ...user, id: uuidv4() };
    await db.users.add(newUser);
    return newUser;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await db.users.update(userId, updates);
  }

  static async deleteUser(userId: string): Promise<void> {
    await db.transaction('rw', [db.users, db.accounts, db.transactions], async () => {
      // Delete user's transactions
      const accounts = await db.accounts.where('userId').equals(userId).toArray();
      for (const account of accounts) {
        await db.transactions.where('accountId').equals(account.id).delete();
      }
      
      // Delete user's accounts
      await db.accounts.where('userId').equals(userId).delete();
      
      // Delete user
      await db.users.delete(userId);
    });
  }

  static async getUserStatistics(): Promise<{
    totalUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    totalBalance: { [key: string]: number };
  }> {
    const [users, accounts, transactions] = await Promise.all([
      db.users.count(),
      db.accounts.toArray(),
      db.transactions.count()
    ]);

    const totalBalance = accounts.reduce((acc, account) => {
      acc[account.currency] = (acc[account.currency] || 0) + account.balance;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalUsers: users,
      totalAccounts: accounts.length,
      totalTransactions: transactions,
      totalBalance
    };
  }

  static async unlockUser(userId: string): Promise<void> {
    await db.users.update(userId, {
      isLocked: false,
      loginAttempts: 0
    });
  }

  static async getTransactionStatistics(): Promise<{
    transactionsByType: { [key: string]: number };
    transactionsByStatus: { [key: string]: number };
    transactionsByDay: { [key: string]: number };
  }> {
    const transactions = await db.transactions.toArray();
    
    const transactionsByType = transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const transactionsByStatus = transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const transactionsByDay = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      transactionsByType,
      transactionsByStatus,
      transactionsByDay
    };
  }
}