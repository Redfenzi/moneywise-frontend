import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Income, Expense, Subscription, BankAccount, MonthlySummary, ProfileUpdateRequest, PasswordChangeRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // === DASHBOARD ===
  getDashboardSummary() {
    return this.http.get<MonthlySummary>(`${this.BASE}/dashboard/summary`);
  }

  getMonthlySummary(year: number, month: number) {
    return this.http.get<MonthlySummary>(`${this.BASE}/dashboard/summary/${year}/${month}`);
  }

  // === INCOMES ===
  getIncomes() {
    return this.http.get<Income[]>(`${this.BASE}/incomes`);
  }

  getIncomesByMonth(year: number, month: number) {
    return this.http.get<Income[]>(`${this.BASE}/incomes/month/${year}/${month}`);
  }

  createIncome(income: Partial<Income>) {
    return this.http.post<Income>(`${this.BASE}/incomes`, income);
  }

  updateIncome(id: number, income: Partial<Income>) {
    return this.http.put<Income>(`${this.BASE}/incomes/${id}`, income);
  }

  deleteIncome(id: number) {
    return this.http.delete<void>(`${this.BASE}/incomes/${id}`);
  }

  // === EXPENSES ===
  getExpenses() {
    return this.http.get<Expense[]>(`${this.BASE}/expenses`);
  }

  getExpensesByMonth(year: number, month: number) {
    return this.http.get<Expense[]>(`${this.BASE}/expenses/month/${year}/${month}`);
  }

  createExpense(expense: Partial<Expense>) {
    return this.http.post<Expense>(`${this.BASE}/expenses`, expense);
  }

  updateExpense(id: number, expense: Partial<Expense>) {
    return this.http.put<Expense>(`${this.BASE}/expenses/${id}`, expense);
  }

  deleteExpense(id: number) {
    return this.http.delete<void>(`${this.BASE}/expenses/${id}`);
  }

  // === SUBSCRIPTIONS ===
  getSubscriptions() {
    return this.http.get<Subscription[]>(`${this.BASE}/subscriptions`);
  }

  getActiveSubscriptions() {
    return this.http.get<Subscription[]>(`${this.BASE}/subscriptions/active`);
  }

  createSubscription(subscription: Partial<Subscription>) {
    return this.http.post<Subscription>(`${this.BASE}/subscriptions`, subscription);
  }

  updateSubscription(id: number, subscription: Partial<Subscription>) {
    return this.http.put<Subscription>(`${this.BASE}/subscriptions/${id}`, subscription);
  }

  toggleSubscription(id: number) {
    return this.http.patch<Subscription>(`${this.BASE}/subscriptions/${id}/toggle`, {});
  }

  deleteSubscription(id: number) {
    return this.http.delete<void>(`${this.BASE}/subscriptions/${id}`);
  }

  // === BANK ACCOUNTS ===
  getBankAccounts() {
    return this.http.get<BankAccount[]>(`${this.BASE}/bank-accounts`);
  }

  createBankAccount(account: Partial<BankAccount>) {
    return this.http.post<BankAccount>(`${this.BASE}/bank-accounts`, account);
  }

  updateBankAccount(id: number, account: Partial<BankAccount>) {
    return this.http.put<BankAccount>(`${this.BASE}/bank-accounts/${id}`, account);
  }

  deleteBankAccount(id: number) {
    return this.http.delete<void>(`${this.BASE}/bank-accounts/${id}`);
  }

  // === USER PROFILE ===
  getProfile() {
    return this.http.get<any>(`${this.BASE}/users/profile`);
  }

  updateProfile(data: ProfileUpdateRequest) {
    return this.http.put<any>(`${this.BASE}/users/profile`, data);
  }

  changePassword(data: PasswordChangeRequest) {
    return this.http.put<any>(`${this.BASE}/users/password`, data);
  }

  deleteAccount(password: string) {
    return this.http.delete<any>(`${this.BASE}/users/account`, { body: { password } });
  }

  // === EMAIL VERIFICATION ===
  resendVerification(email: string) {
    return this.http.post<{ message: string }>(`${this.BASE}/auth/resend-verification`, { email });
  }

  // === PASSWORD RESET ===
  forgotPassword(email: string) {
    return this.http.post<{ browserKey: string }>(`${this.BASE}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, browserKey: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.BASE}/auth/reset-password`, { token, browserKey, newPassword });
  }
}
