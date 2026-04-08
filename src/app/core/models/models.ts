export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'INDIVIDUAL' | 'BUSINESS';
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Income {
  id?: number;
  amount: number;
  type: IncomeType;
  description: string;
  incomeDate: string;
  isFixedSalary: boolean;
  month?: number;
  year?: number;
  createdAt?: string;
}

export type IncomeType = 'SALARY' | 'SALE' | 'GAMBLING' | 'FREELANCE' | 'INVESTMENT' | 'OTHER';

export interface Expense {
  id?: number;
  amount: number;
  category: ExpenseCategory;
  description: string;
  expenseDate: string;
  month?: number;
  year?: number;
  createdAt?: string;
}

export type ExpenseCategory = 'FOOD' | 'CLOTHING' | 'ELECTRONICS' | 'TRANSPORT' | 'HEALTH' | 'ENTERTAINMENT' | 'EDUCATION' | 'HOME' | 'OTHER';

export interface Subscription {
  id?: number;
  name: string;
  monthlyAmount: number;
  category: SubscriptionCategory;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  durationMonths?: number;
  createdAt?: string;
}

export type SubscriptionCategory = 'ELECTRICITY' | 'INTERNET' | 'MOBILE' | 'STREAMING' | 'RENT' | 'INSURANCE' | 'GYM' | 'NEWSPAPER' | 'CLOUD' | 'OTHER';

export interface BankAccount {
  id?: number;
  bankName: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AccountType = 'SAVINGS' | 'CHECKING' | 'INVESTMENT' | 'CRYPTO' | 'OTHER';

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalSubscriptions: number;
  totalDeductions: number;
  balance: number;
  totalSavings: number;
  expensesByCategory: Record<string, number>;
  incomeByType: Record<string, number>;
}
