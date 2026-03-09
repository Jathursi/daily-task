'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Wallet, TrendingDown, TrendingUp, PiggyBank, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  createExpenseEntry,
  deleteExpenseEntry,
  ExpenseEntry,
  ExpenseType,
  subscribeExpensesByUser,
  updateExpenseEntry,
} from '@/services/expenseService';

const categories = ['Food', 'Transport', 'Rent', 'Bills', 'Shopping', 'Health', 'Education', 'Salary', 'Freelance', 'Other'];

const initialForm = {
  title: '',
  category: 'Food',
  amount: 0,
  type: 'expense' as ExpenseType,
  date: new Date().toISOString().split('T')[0],
  note: '',
};

export default function ExpensesPage() {
  const { userId } = useAppStore();
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeExpensesByUser(userId, (entries) => {
      setExpenses(entries);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((entry) => entry.date.startsWith(currentMonth));
  }, [expenses, currentMonth]);

  const totalIncome = monthlyExpenses
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const totalExpense = monthlyExpenses
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : '0.0';

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    monthlyExpenses
      .filter((entry) => entry.type === 'expense')
      .forEach((entry) => {
        totals[entry.category] = (totals[entry.category] || 0) + Number(entry.amount);
      });

    return totals;
  }, [monthlyExpenses]);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const monthChartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; income: number; expense: number }>();

    expenses.forEach((entry) => {
      const key = entry.date.slice(0, 7);
      const monthLabel = new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' });

      if (!monthMap.has(key)) {
        monthMap.set(key, { month: monthLabel, income: 0, expense: 0 });
      }

      const monthData = monthMap.get(key)!;
      if (entry.type === 'income') {
        monthData.income += Number(entry.amount);
      } else {
        monthData.expense += Number(entry.amount);
      }
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, value]) => value);
  }, [expenses]);

  const avgDailyExpense = useMemo(() => {
    const dailyTotals: Record<string, number> = {};

    monthlyExpenses
      .filter((entry) => entry.type === 'expense')
      .forEach((entry) => {
        dailyTotals[entry.date] = (dailyTotals[entry.date] || 0) + Number(entry.amount);
      });

    const values = Object.values(dailyTotals);
    if (values.length === 0) return 0;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [monthlyExpenses]);

  const handleSave = async () => {
    if (!userId || !form.title.trim() || Number(form.amount) <= 0) return;

    const payload = {
      userId,
      title: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      type: form.type,
      date: form.date,
      note: form.note.trim(),
    };

    if (editingId) {
      await updateExpenseEntry(userId, editingId, payload);
    } else {
      await createExpenseEntry(userId, payload);
    }

    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (entry: ExpenseEntry) => {
    setEditingId(entry.id || null);
    setForm({
      title: entry.title,
      category: entry.category,
      amount: Number(entry.amount),
      type: entry.type,
      date: entry.date,
      note: entry.note || '',
    });
  };

  const handleDelete = async (id?: string) => {
    if (!id || !userId) return;
    await deleteExpenseEntry(userId, id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Expenses</h1>
        <p className="text-sm sm:text-base text-accent-light/60">Smart expense tracking and cash flow management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-accent-light/60">Income</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-accent-light/60">Expense</p>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-red-400">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-accent-light/60">Net Cash Flow</p>
            <Wallet className="w-4 h-4 text-accent-orange" />
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${netCashFlow >= 0 ? 'text-accent-orange' : 'text-red-400'}`}>
            ${netCashFlow.toFixed(2)}
          </p>
        </div>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-accent-light/60">Savings Rate</p>
            <PiggyBank className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-white">{savingsRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-card p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {editingId ? 'Edit Entry' : 'Add Expense/Income'}
          </h3>

          <input
            className="input-field"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              placeholder="Amount"
              value={form.amount || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ExpenseType }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <textarea
            className="input-field min-h-[90px] resize-none"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1 text-sm sm:text-base">
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
                className="px-4 rounded-xl bg-secondary hover:bg-tertiary text-accent-light transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Cash Flow Trend (Last 6 Months)</h3>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis dataKey="month" stroke="rgba(233, 188, 185, 0.5)" fontSize={11} />
                <YAxis stroke="rgba(233, 188, 185, 0.5)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9',
                  }}
                />
                <Bar dataKey="income" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Smart Expense Insights</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-primary-dark/50 border border-accent-light/10">
              <p className="text-sm text-white font-medium">Top Spend Category</p>
              <p className="text-xs text-accent-light/70 mt-1">
                {topCategory ? `${topCategory[0]} • $${topCategory[1].toFixed(2)}` : 'No expense data yet for this month.'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary-dark/50 border border-accent-light/10">
              <p className="text-sm text-white font-medium">Average Daily Expense</p>
              <p className="text-xs text-accent-light/70 mt-1">${avgDailyExpense.toFixed(2)} / day</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-dark/50 border border-accent-light/10">
              <p className="text-sm text-white font-medium">Cash Flow Health</p>
              <p className="text-xs text-accent-light/70 mt-1">
                {netCashFlow >= 0
                  ? 'Healthy cash flow. You are spending within your income this month.'
                  : 'Warning: Expenses are higher than income. Reduce non-essential spending.'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Transactions</h3>
          {expenses.length === 0 ? (
            <p className="text-accent-light/60 text-sm">No transactions yet. Add your first entry.</p>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {expenses.slice(0, 20).map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl bg-primary-dark/50 border border-accent-light/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{entry.title}</p>
                      <p className="text-xs text-accent-light/60 mt-0.5">
                        {entry.category} • {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className={`text-sm font-semibold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.type === 'income' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                      </p>
                      <button onClick={() => handleEdit(entry)} className="p-1.5 rounded hover:bg-accent-light/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-accent-light" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {entry.note && <p className="text-xs text-accent-light/70 mt-1.5 line-clamp-2">{entry.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="w-4 h-4 text-accent-orange" />
          <p className="text-sm sm:text-base font-semibold text-white">Cash Flow Maintenance Tip</p>
        </div>
        <p className="text-xs sm:text-sm text-accent-light/70">
          Use the 50-30-20 guideline as a baseline: 50% needs, 30% wants, 20% savings/investments.
          Review your top spending category weekly and set a cap for next week.
        </p>
      </div>
    </div>
  );
}
