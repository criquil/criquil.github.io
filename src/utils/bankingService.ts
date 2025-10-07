'''
import { User, BankAccount, Transaction } from '../types';
import { mockUsers } from '../data/mockData';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';

const USERS_COLLECTION = 'users';

export class BankingService {
  private static instance: BankingService;
  private currentUser: FirebaseUser | null = null;

  private constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  static getInstance(): BankingService {
    if (!BankingService.instance) {
      BankingService.instance = new BankingService();
    }
    return BankingService.instance;
  }

  // Authentication
  async login(email: string, password: string): Promise<User | null> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userCredential.user.uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
    }
    return null;
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  // User Management (Admin functions)
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, USERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const newUser: User = {
      ...userData,
      id: userCredential.user.uid,
      createdAt: new Date(),
    };
    await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), newUser);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, updates);
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.exists() ? ({ id: updatedDoc.id, ...updatedDoc.data() } as User) : null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Deleting user from Firestore
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      // Note: Deleting user from Firebase Auth is a sensitive operation and is handled separately for security reasons.
      // Implement a secure way to do this, for example, through a callable function.
      return true;
    } catch (error) {
      console.error("Error deleting user: ", error);
      return false;
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    // This is a sensitive operation and should be done with care.
    // The current implementation assumes you have the user's credentials or are using an admin SDK.
    // The following is a placeholder for the client-side, which is not the recommended way.
    // For a real app, use a server-side environment (e.g., Cloud Functions) to manage password changes for other users.
    if (auth.currentUser?.uid === userId) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        return true;
      } catch (error) {
        console.error("Error changing password: ", error);
        return false;
      }
    }
    return false;
  }


  // Account Management
  async updateAccountBalance(userId: string, accountId: string, newBalance: number): Promise<boolean> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const user = userDoc.data() as User;
      const accountIndex = user.accounts.findIndex(a => a.id === accountId);
      if (accountIndex !== -1) {
        user.accounts[accountIndex].balance = newBalance;
        await updateDoc(userRef, { accounts: user.accounts });
        return true;
      }
    }
    return false;
  }

  // Transactions
  async createTransaction(userId: string, accountId: string, transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction | null> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const user = userDoc.data() as User;
      const account = user.accounts.find(a => a.id === accountId);
      if (account) {
        const newTransaction: Transaction = {
          ...transaction,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date(),
        };

        account.transactions.unshift(newTransaction);

        if (transaction.status === 'completed') {
          account.balance += transaction.amount;
        }

        await updateDoc(userRef, { accounts: user.accounts });
        return newTransaction;
      }
    }
    return null;
  }

  // Transfer money between accounts
  async transfer(fromUserId: string, fromAccountId: string, toUserId: string, toAccountId: string, amount: number, description: string): Promise<boolean> {
    const fromUserRef = doc(db, USERS_COLLECTION, fromUserId);
    const toUserRef = doc(db, USERS_COLLECTION, toUserId);

    const fromUserDoc = await getDoc(fromUserRef);
    const toUserDoc = await getDoc(toUserRef);

    if (!fromUserDoc.exists() || !toUserDoc.exists()) return false;

    const fromUser = fromUserDoc.data() as User;
    const toUser = toUserDoc.data() as User;

    const fromAccount = fromUser.accounts.find(a => a.id === fromAccountId);
    const toAccount = toUser.accounts.find(a => a.id === toAccountId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) return false;

    const reference = `TRF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Debit
    await this.createTransaction(fromUserId, fromAccountId, {
      type: 'transfer',
      amount: -amount,
      currency: fromAccount.currency,
      description: `Transfer to ${toAccount.accountNumber} - ${description}`,
      status: 'completed',
      toAccount: toAccount.accountNumber,
      reference,
    });

    // Credit
    await this.createTransaction(toUserId, toAccountId, {
      type: 'transfer',
      amount: amount,
      currency: toAccount.currency,
      description: `Transfer from ${fromAccount.accountNumber} - ${description}`,
      status: 'completed',
fromAccount: fromAccount.accountNumber,
      reference,
    });

    return true;
  }

    // Bill payment
  async payBill(userId: string, accountId: string, billId: string, amount: number): Promise<boolean> {
    const transaction = await this.createTransaction(userId, accountId, {
      type: 'bill_payment',
      amount: -amount,
      currency: (await this.getAccount(userId, accountId))?.currency || 'USD',
      description: `Bill Payment - ${billId}`,
      status: 'completed',
      reference: `BILL${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    return transaction !== null;
  }

  // Credit card payment
  async payCreditCard(userId: string, accountId: string, cardId: string, amount: number): Promise<boolean> {
    const transaction = await this.createTransaction(userId, accountId, {
      type: 'credit_payment',
      amount: -amount,
      currency: (await this.getAccount(userId, accountId))?.currency || 'USD',
      description: `Credit Card Payment - ${cardId}`,
      status: 'completed',
      reference: `CC${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    return transaction !== null;
  }

  // Currency exchange
  async exchangeCurrency(userId: string, fromAccountId: string, toAccountId: string, amount: number, fromCurrency: string, toCurrency: string, rate: number): Promise<boolean> {
    const fromAccount = await this.getAccount(userId, fromAccountId);
    const toAccount = await this.getAccount(userId, toAccountId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) return false;

    const convertedAmount = amount * rate;
    const reference = `FX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Debit from source account
    await this.createTransaction(userId, fromAccountId, {
      type: 'currency_exchange',
      amount: -amount,
      currency: fromCurrency,
      description: `Currency Exchange: ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
      status: 'completed',
      reference
    });

    // Credit to destination account
    await this.createTransaction(userId, toAccountId, {
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
  async createMoneyForAdmin(adminId: string, accountId: string, amount: number): Promise<boolean> {
    const adminDoc = await getDoc(doc(db, USERS_COLLECTION, adminId));
    if (!adminDoc.exists() || !adminDoc.data().isAdmin) return false;

    const transaction = await this.createTransaction(adminId, accountId, {
      type: 'deposit',
      amount: amount,
      currency: (await this.getAccount(adminId, accountId))?.currency || 'USD',
      description: 'Money Creation',
      status: 'completed',
      reference: `ADMIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    return transaction !== null;
  }

    // Get user by account number
  async findUserByAccountNumber(accountNumber: string): Promise<{ user: User; account: BankAccount } | null> {
    const q = query(collection(db, USERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    for (const doc of querySnapshot.docs) {
      const user = { id: doc.id, ...doc.data() } as User;
      const account = user.accounts.find(a => a.accountNumber === accountNumber);
      if (account) {
        return { user, account };
      }
    }
    return null;
  }

    // Admin transaction generation capabilities
  async generateAdminTransaction(adminId: string, targetUserId: string, targetAccountId: string, transactionData: any): Promise<boolean> {
        const adminDoc = await getDoc(doc(db, USERS_COLLECTION, adminId));
        if (!adminDoc.exists() || !adminDoc.data().isAdmin) return false;

        const transaction = await this.createTransaction(targetUserId, targetAccountId, {
            ...transactionData,
            status: 'completed',
        });

        return transaction !== null;
  }


    // Get specific user by ID for admin
  async getUserById(userId: string): Promise<User | null> {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
        return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as User) : null;
  }

    // Cancel transaction functionality (Admin only)
  async cancelTransaction(adminId: string, targetUserId: string, targetAccountId: string, transactionId: string): Promise<boolean> {
    const adminDoc = await getDoc(doc(db, USERS_COLLECTION, adminId));
    if (!adminDoc.exists() || !adminDoc.data().isAdmin) return false;

    const userRef = doc(db, USERS_COLLECTION, targetUserId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return false;

    const user = userDoc.data() as User;
    const account = user.accounts.find(a => a.id === targetAccountId);
    if (!account) return false;

    const transactionIndex = account.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return false;

    const originalTransaction = account.transactions[transactionIndex];
    if (originalTransaction.status === 'cancelled') return false;

    originalTransaction.status = 'cancelled';

    const reversalAmount = -originalTransaction.amount;
    const reversalDescription = `Cancellation of: ${originalTransaction.description}`;
    const reversalRef = `REV${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Handle transfer cancellations
    if (originalTransaction.type === 'transfer' && (originalTransaction.fromAccount || originalTransaction.toAccount)) {
        // This logic needs to be adapted for Firestore, it might require a more complex data model
        // For now, we will just reverse the single transaction
    }

    const reversalTransaction = await this.createTransaction(targetUserId, targetAccountId, {
      type: originalTransaction.type,
      amount: reversalAmount,
      currency: originalTransaction.currency,
      description: reversalDescription,
      status: 'completed',
      reference: reversalRef,
    });

    return reversalTransaction !== null;
  }

    // Get transactions for admin management
    async getAllTransactions(): Promise<{ user: User; account: any; transaction: any }[]> {
        const users = await this.getAllUsers();
        const allTransactions: { user: User; account: any; transaction: any }[] = [];
        users.forEach(user => {
            user.accounts.forEach(account => {
                account.transactions.forEach(transaction => {
                    allTransactions.push({ user, account, transaction });
                });
            });
        });
        return allTransactions.sort((a, b) => new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime());
    }


  private async getAccount(userId: string, accountId: string): Promise<BankAccount | null> {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const user = userDoc.data() as User;
      return user.accounts.find(a => a.id === accountId) || null;
    }
    return null;
  }

  async seedInitialData(): Promise<void> {
    const usersCollection = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersCollection);
    if (snapshot.empty) {
      console.log('No users found in Firestore, seeding initial data...');
      for (const user of mockUsers) {
        try {
          const { user: authUser } = await createUserWithEmailAndPassword(auth, user.email, user.password);
          const userToSave = { ...user, id: authUser.uid };
          delete userToSave.password; // Do not store plain text passwords
          await setDoc(doc(db, USERS_COLLECTION, authUser.uid), userToSave);
          console.log(`User ${user.username} created successfully.`);
        } catch (error) {
          console.error(`Error creating user ${user.username}:`, error);
        }
      }
    } else {
      console.log('Users already exist in Firestore, skipping seed.');
    }
  }

}
''