import { db } from './db';
import { User, Account, Transaction, CurrencyRate, Notification } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async login(username: string, password: string): Promise<User | null> {
    const user = await db.users.where('username').equals(username).first();
    
    if (!user) {
      return null;
    }

    if (user.isLocked) {
      throw new Error('Account is locked. Please contact administrator.');
    }

    if (user.password !== password) {
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const isLocked = loginAttempts >= 3;
      await db.users.update(user.id, { loginAttempts, isLocked });
      throw new Error(`Invalid password. ${3 - (user.loginAttempts || 0)} attempts remaining.`);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await db.users.update(user.id, { loginAttempts: 0 });
    }

    return user;
  }

  static async logout(): Promise<void> {
    // Clear session storage or any other cleanup
    sessionStorage.removeItem('currentUser');
  }
}

export class AccountService {
  static async getAccounts(userId: string): Promise<Account[]> {
    return db.accounts.where('userId').equals(userId).toArray();
  }

  static async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    const newAccount = { ...account, id: uuidv4() };
    await db.accounts.add(newAccount);
    return newAccount;
  }

  static async getBalance(accountId: string): Promise<number> {
    const account = await db.accounts.get(accountId);
    return account?.balance || 0;
  }
}

export class TransactionService {
  static async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction = { ...transaction, id: uuidv4(), date: new Date() };
    
    // Start a transaction to update both accounts
    await db.transaction('rw', db.transactions, db.accounts, async () => {
      await db.transactions.add(newTransaction);
      
      const sourceAccount = await db.accounts.get(transaction.accountId);
      if (!sourceAccount) throw new Error('Source account not found');
      
      if (transaction.type === 'TRANSFER' && transaction.recipientId) {
        const recipientAccount = await db.accounts.get(transaction.recipientId);
        if (!recipientAccount) throw new Error('Recipient account not found');
        
        // Update source account
        await db.accounts.update(sourceAccount.id, {
          balance: sourceAccount.balance - transaction.amount
        });
        
        // Update recipient account
        await db.accounts.update(recipientAccount.id, {
          balance: recipientAccount.balance + transaction.amount
        });
      } else {
        // Handle deposits and withdrawals
        const balanceChange = transaction.type === 'DEPOSIT' ? transaction.amount : -transaction.amount;
        await db.accounts.update(sourceAccount.id, {
          balance: sourceAccount.balance + balanceChange
        });
      }
    });
    
    return newTransaction;
  }

  static async getTransactions(accountId: string): Promise<Transaction[]> {
    return db.transactions
      .where('accountId')
      .equals(accountId)
      .reverse()
      .sortBy('date');
  }
}

export class NotificationService {
  static async createNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Promise<Notification> {
    const newNotification = {
      ...notification,
      id: uuidv4(),
      date: new Date(),
      read: false
    };
    await db.notifications.add(newNotification);
    return newNotification;
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    return db.notifications
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('date');
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await db.notifications.update(notificationId, { read: true });
  }
}