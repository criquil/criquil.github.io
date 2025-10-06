import { User, BankAccount, Transaction } from '../types';
import { mockUsers } from '../data/mockData';

const STORAGE_KEY = 'testingBankData';

export class BankingService {
  private static instance: BankingService;
  private users: User[] = [];
  private currentUser: User | null = null;

  private constructor() {
    this.loadData();
  }

  static getInstance(): BankingService {
    if (!BankingService.instance) {
      BankingService.instance = new BankingService();
    }
    return BankingService.instance;
  }

  private loadData(): void {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        this.users = parsedData.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          accounts: user.accounts.map((account: any) => ({
            ...account,
            transactions: account.transactions.map((tx: any) => ({
              ...tx,
              date: new Date(tx.date)
            }))
          }))
        }));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        this.users = mockUsers;
        this.saveData();
      }
    } else {
      this.users = mockUsers;
      this.saveData();
    }
  }

  private saveData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
  }

  // Authentication
  login(username: string, password: string): User | null {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.saveCurrentUserSession(user);
      return user;
    }
    return null;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUserId');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Session persistence
  saveCurrentUserSession(user: User): void {
    this.currentUser = user;
    localStorage.setItem('currentUserId', user.id);
  }

  loadCurrentUserSession(): User | null {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const user = this.users.find(u => u.id === savedUserId);
      if (user) {
        this.currentUser = user;
        return user;
      }
    }
    return null;
  }

  // User Management (Admin functions)
  getAllUsers(): User[] {
    return this.users;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date()
    };
    this.users.push(newUser);
    this.saveData();
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveData();
      return this.users[userIndex];
    }
    return null;
  }

  deleteUser(userId: string): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  changePassword(userId: string, newPassword: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      this.saveData();
      return true;
    }
    return false;
  }

  // Account Management
  updateAccountBalance(userId: string, accountId: string, newBalance: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const account = user.accounts.find(a => a.id === accountId);
      if (account) {
        account.balance = newBalance;
        this.saveData();
        return true;
      }
    }
    return false;
  }

  // Transactions
  createTransaction(userId: string, accountId: string, transaction: Omit<Transaction, 'id' | 'date'>): Transaction | null {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const account = user.accounts.find(a => a.id === accountId);
      if (account) {
        const newTransaction: Transaction = {
          ...transaction,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date()
        };
        
        account.transactions.unshift(newTransaction);
        
        // Update account balance
        if (transaction.status === 'completed') {
          account.balance += transaction.amount;
        }
        
        this.saveData();
        return newTransaction;
      }
    }
    return null;
  }

  // Transfer money between accounts
  transfer(fromUserId: string, fromAccountId: string, toUserId: string, toAccountId: string, amount: number, description: string): boolean {
    const fromUser = this.users.find(u => u.id === fromUserId);
    const toUser = this.users.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser) return false;
    
    const fromAccount = fromUser.accounts.find(a => a.id === fromAccountId);
    const toAccount = toUser.accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) return false;
    
    if (fromAccount.balance < amount) return false;
    
    const reference = `TRF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create debit transaction
    this.createTransaction(fromUserId, fromAccountId, {
      type: 'transfer',
      amount: -amount,
      currency: fromAccount.currency,
      description: `Transfer to ${toAccount.accountNumber} - ${description}`,
      status: 'completed',
      toAccount: toAccount.accountNumber,
      reference
    });
    
    // Create credit transaction
    this.createTransaction(toUserId, toAccountId, {
      type: 'transfer',
      amount: amount,
      currency: toAccount.currency,
      description: `Transfer from ${fromAccount.accountNumber} - ${description}`,
      status: 'completed',
      fromAccount: fromAccount.accountNumber,
      reference
    });
    
    return true;
  }

  // Bill payment
  payBill(userId: string, accountId: string, billId: string, amount: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    const account = user.accounts.find(a => a.id === accountId);
    if (!account || account.balance < amount) return false;
    
    const transaction = this.createTransaction(userId, accountId, {
      type: 'bill_payment',
      amount: -amount,
      currency: account.currency,
      description: `Bill Payment - ${billId}`,
      status: 'completed',
      reference: `BILL${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
    
    return transaction !== null;
  }

  // Credit card payment
  payCreditCard(userId: string, accountId: string, cardId: string, amount: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    const account = user.accounts.find(a => a.id === accountId);
    if (!account || account.balance < amount) return false;
    
    const transaction = this.createTransaction(userId, accountId, {
      type: 'credit_payment',
      amount: -amount,
      currency: account.currency,
      description: `Credit Card Payment - ${cardId}`,
      status: 'completed',
      reference: `CC${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
    
    return transaction !== null;
  }

  // Currency exchange
  exchangeCurrency(userId: string, fromAccountId: string, toAccountId: string, amount: number, fromCurrency: string, toCurrency: string, rate: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    const fromAccount = user.accounts.find(a => a.id === fromAccountId);
    const toAccount = user.accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) return false;
    if (fromAccount.balance < amount) return false;
    
    const convertedAmount = amount * rate;
    const reference = `FX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Debit from source account
    this.createTransaction(userId, fromAccountId, {
      type: 'currency_exchange',
      amount: -amount,
      currency: fromCurrency,
      description: `Currency Exchange: ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
      status: 'completed',
      reference
    });
    
    // Credit to destination account
    this.createTransaction(userId, toAccountId, {
      type: 'currency_exchange',
      amount: convertedAmount,
      currency: toCurrency,
      description: `Currency Exchange: ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
      status: 'completed',
      reference
    });
    
    return true;
  }

  // Admin functions - Create money for admin accounts
  createMoneyForAdmin(adminId: string, accountId: string, amount: number): boolean {
    const admin = this.users.find(u => u.id === adminId && u.isAdmin);
    if (!admin) return false;

    const account = admin.accounts.find(a => a.id === accountId);
    if (!account) return false;

    // Create a "money creation" transaction
    const transaction = this.createTransaction(adminId, accountId, {
      type: 'deposit',
      amount: amount,
      currency: account.currency,
      description: 'Money Creation',
      status: 'completed',
      reference: `ADMIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    return transaction !== null;
  }

  // Get user by account number
  findUserByAccountNumber(accountNumber: string): { user: User; account: BankAccount } | null {
    for (const user of this.users) {
      const account = user.accounts.find(a => a.accountNumber === accountNumber);
      if (account) {
        return { user, account };
      }
    }
    return null;
  }

  // Admin transaction generation capabilities
  generateAdminTransaction(adminId: string, targetUserId: string, targetAccountId: string, transactionData: {
    type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'bill_payment' | 'credit_payment';
    amount: number;
    currency: string;
    description: string;
    reference?: string;
    fromAccountId?: string; // For transfers
    payeeName?: string; // For bill payments
  }): boolean {
    const admin = this.users.find(u => u.id === adminId && u.isAdmin);
    if (!admin) return false;

    const targetUser = this.users.find(u => u.id === targetUserId);
    if (!targetUser) return false;

    const targetAccount = targetUser.accounts.find(a => a.id === targetAccountId);
    if (!targetAccount) return false;

    // Generate reference if not provided
    const reference = transactionData.reference || `ADMIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    let transaction: Transaction | null = null;

    switch (transactionData.type) {
      case 'deposit':
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'deposit',
          amount: transactionData.amount,
          currency: transactionData.currency,
          description: transactionData.description,
          status: 'completed',
          reference
        });
        break;

      case 'withdrawal':
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'withdrawal',
          amount: transactionData.amount,
          currency: transactionData.currency,
          description: transactionData.description,
          status: 'completed',
          reference
        });
        break;

      case 'transfer':
        if (!transactionData.fromAccountId) return false;
        const fromAccount = targetUser.accounts.find(a => a.id === transactionData.fromAccountId);
        if (!fromAccount) return false;

        // Create debit transaction
        this.createTransaction(targetUserId, transactionData.fromAccountId, {
          type: 'transfer',
          amount: -transactionData.amount,
          currency: transactionData.currency,
          description: `Transfer to ${targetAccount.accountNumber}`,
          status: 'completed',
          reference,
          toAccount: targetAccount.accountNumber
        });

        // Create credit transaction
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'transfer',
          amount: transactionData.amount,
          currency: transactionData.currency,
          description: `Transfer from ${fromAccount.accountNumber}`,
          status: 'completed',
          reference,
          fromAccount: fromAccount.accountNumber
        });
        break;

      case 'payment':
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'payment',
          amount: -transactionData.amount,
          currency: transactionData.currency,
          description: transactionData.description,
          status: 'completed',
          reference
        });
        break;

      case 'bill_payment':
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'bill_payment',
          amount: -transactionData.amount,
          currency: transactionData.currency,
          description: `Bill Payment to ${transactionData.payeeName || 'Unknown'}`,
          status: 'completed',
          reference
        });
        break;

      case 'credit_payment':
        transaction = this.createTransaction(targetUserId, targetAccountId, {
          type: 'credit_payment',
          amount: transactionData.amount, // Credit payments reduce debt (positive for account)
          currency: transactionData.currency,
          description: transactionData.description,
          status: 'completed',
          reference
        });
        break;
    }

    return transaction !== null;
  }

  // Get specific user by ID for admin
  getUserById(userId: string): User | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.isAdmin) return null;
    return this.users.find(u => u.id === userId) || null;
  }

  // Cancel transaction functionality (Admin only)
  cancelTransaction(adminId: string, targetUserId: string, targetAccountId: string, transactionId: string): boolean {
    const admin = this.users.find(u => u.id === adminId && u.isAdmin);
    if (!admin) return false;

    const targetUser = this.users.find(u => u.id === targetUserId);
    if (!targetUser) return false;

    const targetAccount = targetUser.accounts.find(a => a.id === targetAccountId);
    if (!targetAccount) return false;

    const transactionIndex = targetAccount.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return false;

    const originalTransaction = targetAccount.transactions[transactionIndex];
    
    // Don't allow cancellation of already cancelled transactions
    if (originalTransaction.status === 'cancelled') return false;

    // Mark the original transaction as cancelled
    originalTransaction.status = 'cancelled';

    // Create a reversal transaction with opposite amount
    const reversalAmount = -originalTransaction.amount;
    const reversalDescription = `Cancellation of: ${originalTransaction.description}`;
    const reversalRef = `REV${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Store original balance for verification
    const originalBalance = targetAccount.balance;
    
    let success = false;

    // Handle transfer cancellations - need to reverse both sides
    if (originalTransaction.type === 'transfer' && (originalTransaction.fromAccount || originalTransaction.toAccount)) {
      if (originalTransaction.fromAccount) {
        // This is the credit side of a transfer, find and cancel the debit side too
        const fromAccountNumber = originalTransaction.fromAccount;
        let debitTransactionFound = false;
        
        // Find the corresponding debit transaction in the same user's other account
        for (const otherAccount of targetUser.accounts) {
          if (otherAccount.id !== targetAccountId) {
            const debitTransaction = otherAccount.transactions.find(t => 
              t.reference === originalTransaction.reference && 
              t.type === 'transfer' && 
              t.amount < 0 && 
              t.status === 'completed'
            );
            if (debitTransaction) {
              debitTransaction.status = 'cancelled';
              // Create reversal for the debit side
              this.createTransaction(targetUserId, otherAccount.id, {
                type: 'transfer',
                amount: -debitTransaction.amount,
                currency: debitTransaction.currency,
                description: `Cancellation of: ${debitTransaction.description}`,
                status: 'completed',
                reference: reversalRef,
                toAccount: debitTransaction.toAccount
              });
              debitTransactionFound = true;
              break;
            }
          }
        }
      }
      
      if (originalTransaction.toAccount) {
        // This is the debit side of a transfer, find and cancel the credit side too
        const toAccountNumber = originalTransaction.toAccount;
        let creditTransactionFound = false;
        
        // Find the corresponding credit transaction in the same user's other account
        for (const otherAccount of targetUser.accounts) {
          if (otherAccount.id !== targetAccountId) {
            const creditTransaction = otherAccount.transactions.find(t => 
              t.reference === originalTransaction.reference && 
              t.type === 'transfer' && 
              t.amount > 0 && 
              t.status === 'completed'
            );
            if (creditTransaction) {
              creditTransaction.status = 'cancelled';
              // Create reversal for the credit side
              this.createTransaction(targetUserId, otherAccount.id, {
                type: 'transfer',
                amount: -creditTransaction.amount,
                currency: creditTransaction.currency,
                description: `Cancellation of: ${creditTransaction.description}`,
                status: 'completed',
                reference: reversalRef,
                fromAccount: creditTransaction.fromAccount
              });
              creditTransactionFound = true;
              break;
            }
          }
        }
      }
    }

    // Create the reversal transaction for the selected transaction
    const reversalTransaction = this.createTransaction(targetUserId, targetAccountId, {
      type: originalTransaction.type,
      amount: reversalAmount,
      currency: originalTransaction.currency,
      description: reversalDescription,
      status: 'completed',
      reference: reversalRef,
      // Copy related fields if they exist
      ...(originalTransaction.fromAccount && { fromAccount: originalTransaction.fromAccount }),
      ...(originalTransaction.toAccount && { toAccount: originalTransaction.toAccount })
    });

    success = reversalTransaction !== null;

    // Verify the balance was updated correctly
    if (success) {
      console.log(`=== TRANSACTION CANCELLATION DEBUG ===`);
      console.log(`Original transaction amount: ${originalTransaction.amount}`);
      console.log(`Original transaction type: ${originalTransaction.type}`);
      console.log(`Balance before cancellation: ${originalBalance}`);
      console.log(`Reversal amount: ${reversalAmount}`);
      console.log(`Balance after cancellation: ${targetAccount.balance}`);
      console.log(`Expected balance: ${originalBalance + reversalAmount}`);
      console.log(`Balance difference: ${targetAccount.balance - originalBalance}`);
      console.log(`=== END DEBUG ===`);
      
      // Force save to localStorage again
      this.saveData();
      console.log('Data force-saved to localStorage after cancellation');
    }

    this.saveData();
    return success;
  }

  // Get transactions for admin management
  getAllTransactions(): { user: User; account: any; transaction: any }[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.isAdmin) return [];

    const allTransactions: { user: User; account: any; transaction: any }[] = [];
    
    this.users.forEach(user => {
      user.accounts.forEach(account => {
        account.transactions.forEach(transaction => {
          allTransactions.push({ user, account, transaction });
        });
      });
    });

    // Sort by date, newest first
    return allTransactions.sort((a, b) => 
      new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime()
    );
  }
}