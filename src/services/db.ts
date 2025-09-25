import Dexie, { Table } from 'dexie';
import { User, Account, Transaction, CurrencyRate, Notification } from '../types';

export class CristianBankDB extends Dexie {
  users!: Table<User>;
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  currencyRates!: Table<CurrencyRate>;
  notifications!: Table<Notification>;

  constructor() {
    super('CristianBankDB');
    this.version(1).stores({
      users: 'id, username, isAdmin',
      accounts: 'id, userId, type, currency',
      transactions: 'id, accountId, type, date',
      currencyRates: '[from+to], lastUpdated',
      notifications: 'id, userId, date, read'
    });
  }
}

export const db = new CristianBankDB();