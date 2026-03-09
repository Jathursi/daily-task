import { db } from '@/lib/firebase';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';

export type ExpenseType = 'income' | 'expense';

export interface ExpenseEntry {
  id?: string;
  userId: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  type: ExpenseType;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createExpenseEntry = async (userId: string, entry: Omit<ExpenseEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const expensesRef = ref(db, `users/${userId}/expenses`);
  const newRef = push(expensesRef);
  const expenseId = newRef.key;

  if (!expenseId) {
    throw new Error('Failed to create expense id');
  }

  const data: ExpenseEntry = {
    ...entry,
    userId,
    id: expenseId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(newRef, data);
  return expenseId;
};

export const updateExpenseEntry = async (userId: string, expenseId: string, updates: Partial<ExpenseEntry>): Promise<void> => {
  const expenseRef = ref(db, `users/${userId}/expenses/${expenseId}`);
  await update(expenseRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteExpenseEntry = async (userId: string, expenseId: string): Promise<void> => {
  const expenseRef = ref(db, `users/${userId}/expenses/${expenseId}`);
  await remove(expenseRef);
};

export const getExpensesByUser = async (userId: string): Promise<ExpenseEntry[]> => {
  const expensesRef = ref(db, `users/${userId}/expenses`);
  const snapshot = await get(expensesRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, ExpenseEntry>;
  return Object.entries(data)
    .map(([id, value]) => ({ ...value, id }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const subscribeExpensesByUser = (userId: string, callback: (expenses: ExpenseEntry[]) => void): (() => void) => {
  const expensesRef = ref(db, `users/${userId}/expenses`);

  return onValue(expensesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, ExpenseEntry>;
    const expenses = Object.entries(data)
      .map(([id, value]) => ({ ...value, id }))
      .sort((a, b) => b.date.localeCompare(a.date));

    callback(expenses);
  });
};
