'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { subscribeGoalsByUser, createGoal, updateGoal, deleteGoal, Goal } from '@/services/goalService';
import { Target, Calendar, Plus, Loader2, Trash2, Edit2, X, CheckCircle2, Circle } from 'lucide-react';

const goalCategories = ['Career', 'Education', 'Health', 'Finance', 'Personal', 'Other'] as const;

export default function GoalsPage() {
  const { userId } = useAppStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'Career' as typeof goalCategories[number],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const unsubscribe = subscribeGoalsByUser(userId, (userGoals) => {
      setGoals(userGoals);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !formData.title.trim() || !formData.targetDate) return;

    setIsSaving(true);

    if (editingGoal) {
      await updateGoal(userId, editingGoal.id!, {
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        category: formData.category,
      });
    } else {
      await createGoal(userId, {
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        category: formData.category,
        userId,
      });
    }

    setIsSaving(false);
    setShowForm(false);
    setEditingGoal(null);
    setFormData({ title: '', description: '', targetDate: '', category: 'Career' });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      category: goal.category as typeof goalCategories[number],
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId: string) => {
    if (!userId) return;
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(userId, goalId);
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    if (!userId) return;
    await updateGoal(userId, goal.id!, {
      status: goal.status === 'completed' ? 'active' : 'completed',
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getProgressColor = (daysRemaining: number, totalDays: number) => {
    const progress = ((totalDays - daysRemaining) / totalDays) * 100;
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Goals</h1>
          <p className="text-sm sm:text-base text-accent-light/60">Set and track your life goals</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setFormData({ title: '', description: '', targetDate: '', category: 'Career' });
            setShowForm(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm"
          onClick={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        >
          <div className="h-[calc(100vh-3rem)] w-full overflow-hidden p-3 sm:p-6">
            <div className="mx-auto flex h-full items-start justify-center">
          <div
            className="w-full max-w-lg h-full sm:h-[calc(100vh-3rem)] overflow-hidden bg-gradient-to-br from-primary-dark via-secondary/40 to-primary-dark rounded-2xl shadow-2xl border border-accent-light/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-accent-orange/20 to-accent-red/20 p-4 sm:p-6 border-b border-accent-light/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingGoal ? 'Edit Goal' : 'New Goal'}
                  </h3>
                  <p className="text-xs text-accent-light/60">Set your target</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-accent-light" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent-light/70">Goal Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white placeholder-accent-light/40 focus:outline-none focus:border-accent-orange/50"
                  placeholder="e.g., Find a job, Learn a skill"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-accent-light/70">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white placeholder-accent-light/40 focus:outline-none focus:border-accent-orange/50 resize-none h-24"
                  placeholder="Describe your goal in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-accent-light/70">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof goalCategories[number] })}
                    className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50"
                  >
                    {goalCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-primary-dark">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-accent-light/70">Target Date *</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 bg-gradient-to-r from-accent-orange to-accent-red rounded-xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </form>
          </div>
            </div>
          </div>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Active Goals</h2>
          <div className="grid gap-4">
            {activeGoals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const totalDays = Math.ceil((new Date(goal.targetDate).getTime() - new Date(goal.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
              const progress = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));
              
              return (
                <div key={goal.id} className="glass-card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(goal)}
                        className="mt-0.5 p-1 rounded-full hover:bg-white/10"
                      >
                        <Circle className="w-5 h-5 text-accent-orange" />
                      </button>
                      <div>
                        <h3 className="font-semibold text-white">{goal.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-accent-light">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 rounded-lg hover:bg-white/10 text-accent-light/60 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id!)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-accent-light/60 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-accent-light/70 mb-3 ml-8">{goal.description}</p>
                  )}
                  
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-accent-light/60">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                      <span className={daysRemaining < 0 ? 'text-red-400' : daysRemaining < 7 ? 'text-yellow-400' : 'text-green-400'}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                      </span>
                    </div>
                    <div className="h-2 bg-primary-dark/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(daysRemaining, totalDays)} transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Completed Goals</h2>
          <div className="grid gap-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="glass-card p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(goal)}
                    className="p-1"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-white line-through">{goal.title}</h3>
                    <span className="text-xs text-accent-light/60">{goal.category}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id!)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-accent-light/60 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-accent-orange/50" />
          <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
          <p className="text-sm text-accent-light/60 mb-4">Start setting goals to track your progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
