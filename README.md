# Testing Bank - Professional Banking Application

A comprehensive ReactJS banking application built for testing and### Technical Features

### Data Management
- **Local Storage**: All data persists in browser localStorage
- **Session Persistence**: User sessions remain active until logout
- **Real-time Updates**: Immediate reflection of all transactions
- **Transaction Tracking**: Complete audit trail of all activities with cancellation support
- **Currency Support**: Multi-currency account support (USD, EUR, GBP, JPY, CAD, ARS)
- **Balance Integrity**: Automatic balance correction and reversal for cancelled transactions

### Security
- **Role-based Access**: Admin vs. regular user permissions
- **Session Management**: Secure login/logout functionality with persistence
- **Data Validation**: Input validation and error handling
- **Transaction Audit**: Complete transaction history with status tracking (completed, cancelled)

### Admin Capabilities
- **Money Creation**: Admins can create money for their own accounts
- **Transaction Generation**: Generate any type of transaction for any user account (no admin legend)
- **Transaction Cancellation**: Cancel completed transactions with automatic reversal and transfer handling
- **Multi-Currency Management**: Control accounts in all supported currencies including ARS
- **System Control**: Full control over all user accounts and transactions

This application provides a full-featured banking experience with professional UI/UX design.

## 🏦 Features

### Core Banking Features
- **Money Transfers**: Transfer funds between internal accounts with real-time balance updates
- **Bill Payments**: Pay various types of bills (utilities, internet, phone, insurance)
- **Credit Card Management**: Make partial or full credit card payments
- **Currency Exchange**: Buy and sell foreign currencies with live exchange rates
- **Transaction History**: Comprehensive transaction tracking and history

### Admin Panel
- **User Management**: Create, modify, and manage user accounts
- **Balance Management**: Adjust account balances for any user
- **Password Management**: Change passwords for all user accounts
- **Transaction Generation**: Create various types of transactions for any user account (deposits, withdrawals, transfers, bill payments, credit card payments)
- **Transaction Cancellation**: Cancel any completed transaction with automatic balance reversal and transfer handling
- **Money Creation**: Admin can create money and add it to their own accounts (deposit functionality)
- **System Overview**: Monitor all transactions and user activities across all accounts
- **Multi-Currency Control**: Manage accounts in different currencies including ARS (Argentine Peso)

### User Experience
- **Professional UI**: Modern, clean interface with responsive design
- **Multiple Account Types**: Checking, Savings, and Credit Card accounts
- **Multi-Currency Support**: Support for USD, EUR, GBP, JPY, CAD, and ARS (Argentine Peso)
- **Real-time Updates**: Instant balance and transaction updates
- **Security Features**: Secure login system with role-based access
- **Session Persistence**: Stay logged in until explicitly logging out
- **Currency Exchange**: Buy and sell foreign currencies with live exchange rates
- **Demo Data**: 15 pre-generated test users with diverse transaction history and multi-currency accounts

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testing-bank
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

### Deploying to GitHub Pages

1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## 👥 Demo Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: Full administrative access including:
  - User and account management
  - Transaction generation and cancellation
  - Money creation for admin accounts
  - Multi-currency control
  - System monitoring and audit

### User Accounts
- **Username**: `john.smith` | **Password**: `password123`
- **Username**: `jane.johnson` | **Password**: `password123`
- **Username**: `michael.williams` | **Password**: `password123`
- And 12 more auto-generated users with multi-currency accounts...

### Admin Panel Navigation
1. **User Management**: Browse, select, and manage user accounts
2. **Balance Updates**: Modify account balances for any user
3. **Password Management**: Change user passwords securely
4. **Transaction Generation**: Create transactions for any user account:
   - Select user and account
   - Choose transaction type (deposit, withdrawal, transfer, bill payment, credit card)
   - Specify amount and description
   - Transaction appears as normal user activity (no admin legend)
5. **Transaction Cancellation**: Cancel completed transactions:
   - Browse all transactions across all users
   - Select any completed transaction
   - Automatic balance reversal and transfer handling
   - Maintains audit trail with cancelled status
6. **Money Creation**: Admin-only money creation feature:
   - Create money deposits for admin accounts
   - Instant balance updates
   - Full transaction history

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main application layout
├── pages/              # Application pages
│   ├── LoginPage.tsx   # User authentication
│   ├── Dashboard.tsx   # Account overview
│   ├── TransferPage.tsx # Money transfers
│   ├── BillPaymentPage.tsx # Bill payments
│   ├── CreditCardPage.tsx # Credit card management
│   ├── CurrencyExchangePage.tsx # Currency exchange
│   └── AdminPage.tsx   # Administrative panel
├── data/               # Mock data and utilities
│   └── mockData.ts     # Generated test data
├── types/              # TypeScript type definitions
│   └── index.ts        # Application interfaces
├── utils/              # Utility functions
│   └── bankingService.ts # Core banking logic
└── App.tsx             # Main application component
```

## 💰 Accounts Structure

Each user has multiple accounts in different currencies:
- **Checking Account**: Primary account for daily transactions (USD, EUR, GBP, JPY, CAD, ARS)
- **Savings Account**: Interest-bearing savings account (multiple currencies)
- **Credit Card**: Revolving credit with balance and limits (primary currency)

### Supported Currencies
- **USD** (US Dollar) - Primary currency
- **EUR** (Euro) 
- **GBP** (British Pound)
- **JPY** (Japanese Yen)
- **CAD** (Canadian Dollar)
- **ARS** (Argentine Peso) - Enhanced support with realistic exchange rates

## 🔧 Technical Features

### Data Management
- **Local Storage**: All data persists in browser localStorage
- **Session Persistence**: User sessions remain active until logout
- **Real-time Updates**: Immediate reflection of all transactions
- **Transaction Tracking**: Complete audit trail of all activities with cancellation support
- **Currency Support**: Multi-currency account support (USD, EUR, GBP, JPY, CAD, ARS)
- **Balance Integrity**: Automatic balance correction and reversal for cancelled transactions

### Security
- **Role-based Access**: Admin vs. regular user permissions
- **Session Management**: Secure login/logout functionality with persistence
- **Data Validation**: Input validation and error handling
- **Transaction Audit**: Complete transaction history with status tracking (completed, cancelled)

### Responsive Design
- **Mobile-first**: Optimized for all device sizes
- **Professional Styling**: Modern banking application aesthetics
- **Accessibility**: Keyboard navigation and screen reader support

## 🛡️ Advanced Admin Features

### Transaction Management
- **Transaction Cancellation**: Cancel any completed transaction with automatic balance reversal
- **Transfer Cancellation**: Smart handling of transfer cancellations (cancels both debit and credit sides)
- **Balance Verification**: Automatic balance integrity checks and corrections
- **Audit Trail**: All cancelled transactions remain in history with proper status

### Money Creation & Control
- **Admin Money Creation**: Admins can create money and deposit into their own accounts
- **Transaction Generation**: Generate any transaction type for any user:
  - Deposits and withdrawals
  - Transfers between accounts
  - Bill payments (utilities, internet, phone, insurance)
  - Credit card payments (partial or full)
- **No Admin Legend**: Generated transactions appear as normal user transactions

### Multi-Currency Management
- **ARS Integration**: Full Argentine Peso support with realistic exchange rates
- **Currency Exchange**: Admin control over exchange rates and currency conversion
- **Multi-Currency Accounts**: Users can have accounts in any supported currency

### System Administration
- **User Account Control**: Full CRUD operations on user accounts
- **Password Management**: Change passwords for any user account
- **Session Control**: Admin sessions persist until explicit logout
- **Real-time Monitoring**: Monitor all user activities and transactions

## 🎯 Use Cases

### For Testing Teams
- **Functional Testing**: Test all banking workflows including transaction cancellations
- **UI/UX Testing**: Validate user interface components and admin panel
- **Integration Testing**: Test API interactions (mock services) and multi-currency support
- **Performance Testing**: Load testing with multiple users and transaction types
- **Admin Testing**: Test administrative functions including money creation and transaction control

### For Developers
- **Learning Platform**: Understand banking application architecture with advanced admin features
- **Portfolio Project**: Demonstrate full-stack development skills with complex transaction logic
- **Prototype Base**: Foundation for real banking applications with cancellation and audit features

### For Training
- **Banking Software Training**: Safe environment for learning with realistic transaction scenarios
- **Financial Literacy**: Understand banking concepts including multi-currency operations
- **System Testing**: Practice testing methodologies with complex admin workflows
- **Admin Training**: Learn administrative banking functions safely

## 📱 Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Devices**: Desktop, Tablet, Mobile
- **Hosting**: GitHub Pages, Netlify, Vercel, any static hosting

## ⚠️ Important Notes

- This is a **DEMO APPLICATION** for testing purposes only
- **NOT FOR PRODUCTION**: No real financial transactions
- **MOCK DATA**: All data is simulated and stored locally
- **EDUCATIONAL USE**: Designed for learning and testing

## 🛠️ Customization

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `App.tsx`
4. Extend banking service in `utils/bankingService.ts`

### Modifying Test Data
- Edit `src/data/mockData.ts` to customize users and transactions
- Add new currency rates, bills, or credit cards
- Modify account structures and balances

### Styling Changes
- Update `src/App.css` for global styles
- Modify component styles for specific areas
- Customize color scheme and branding

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Review the documentation
- Check the demo accounts section

---

**Testing Bank** - Professional Banking Solutions for Testing and Development