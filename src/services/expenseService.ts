import { db } from '@/lib/firebase';
import { equalTo, get, onValue, orderByChild, push, query, ref, remove, set, update } from 'firebase/database';

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

const EXPENSES_PATH = 'expenses';

export const createExpenseEntry = async (entry: Omit<ExpenseEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const expensesRef = ref(db, EXPENSES_PATH);
  const newRef = push(expensesRef);
  const expenseId = newRef.key;

  if (!expenseId) {
    throw new Error('Failed to create expense id');
  }

  const data: ExpenseEntry = {
    ...entry,
    id: expenseId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(newRef, data);
  return expenseId;
};

export const updateExpenseEntry = async (expenseId: string, updates: Partial<ExpenseEntry>): Promise<void> => {
  const expenseRef = ref(db, `${EXPENSES_PATH}/${expenseId}`);
  await update(expenseRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteExpenseEntry = async (expenseId: string): Promise<void> => {
  const expenseRef = ref(db, `${EXPENSES_PATH}/${expenseId}`);
  await remove(expenseRef);
};

export const getExpensesByUser = async (userId: string): Promise<ExpenseEntry[]> => {
  const expensesQuery = query(ref(db, EXPENSES_PATH), orderByChild('userId'), equalTo(userId));
  const snapshot = await get(expensesQuery);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, ExpenseEntry>;
  return Object.entries(data)
    .map(([id, value]) => ({ ...value, id }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const subscribeExpensesByUser = (userId: string, callback: (expenses: ExpenseEntry[]) => void): (() => void) => {
  const expensesQuery = query(ref(db, EXPENSES_PATH), orderByChild('userId'), equalTo(userId));

  return onValue(expensesQuery, (snapshot) => {
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
