'use client';

import { useState } from 'react';
import { Task } from '@/store/useAppStore';
import { X, Plus, Loader2, Repeat, Calendar, Clock, Flag, BookOpen } from 'lucide-react';

interface TaskPlannerProps {
  userId: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTask?: Task | null;
  onCancelEdit?: () => void;
}

const categories = ['Study', 'Work', 'Coding', 'Personal', 'Health'] as const;
const priorities = ['Low', 'Medium', 'High'] as const;

const categoryColors: Record<string, string> = {
  Study: 'from-blue-500 to-blue-600',
  Work: 'from-purple-500 to-purple-600',
  Coding: 'from-green-500 to-green-600',
  Personal: 'from-pink-500 to-pink-600',
  Health: 'from-red-500 to-red-600',
};

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  High: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export default function TaskPlanner({ userId, onSave, editingTask, onCancelEdit }: TaskPlannerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [repeatDays, setRepeatDays] = useState(1);
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    category: editingTask?.category || 'Study',
    plannedDate: editingTask?.plannedDate || new Date().toISOString().split('T')[0],
    plannedTime: editingTask?.plannedTime || '',
    plannedHours: editingTask?.plannedHours || 1,
    priority: editingTask?.priority || 'Medium',
    completed: editingTask?.completed || false,
    userId: editingTask?.userId || userId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    
    for (let i = 0; i < repeatDays; i++) {
      const date = new Date(formData.plannedDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      await onSave({
        ...formData,
        plannedDate: dateStr,
      });
    }
    
    setIsSaving(false);
    
    if (!editingTask) {
      setFormData({
        title: '',
        description: '',
        category: 'Study',
        plannedDate: new Date().toISOString().split('T')[0],
        plannedTime: '',
        plannedHours: 1,
        priority: 'Medium',
        completed: false,
        userId: formData.userId,
      });
      setRepeatDays(1);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-primary-dark via-secondary/40 to-primary-dark rounded-2xl border border-accent-light/10 shadow-2xl overflow-hidden flex flex-col">
      <div className="relative bg-gradient-to-r from-accent-orange/20 to-accent-red/20 p-4 sm:p-6 border-b border-accent-light/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <p className="text-xs text-accent-light/60">Plan your productivity</p>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-accent-light" />
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Task Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white placeholder-accent-light/40 focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all"
            placeholder="What do you need to do?"
            required
            autoFocus
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-accent-light/70">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white placeholder-accent-light/40 focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all resize-none min-h-[80px]"
            placeholder="Add more details..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Category
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                className="w-full appearance-none bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-primary-dark">{cat}</option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br ${categoryColors[formData.category]}`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Hours
            </label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={formData.plannedHours}
              onChange={(e) => setFormData({ ...formData, plannedHours: Number(e.target.value) })}
              className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </label>
            <input
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Time
            </label>
            <input
              type="time"
              value={formData.plannedTime || ''}
              onChange={(e) => setFormData({ ...formData, plannedTime: e.target.value })}
              className="w-full bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/10 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-accent-light/70 flex items-center gap-2">
            <Flag className="w-3.5 h-3.5" />
            Priority
          </label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p })}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  formData.priority === p
                    ? `${priorityColors[p].bg} ${priorityColors[p].text} ${priorityColors[p].border}`
                    : 'bg-primary-dark/40 border-accent-light/10 text-accent-light/60 hover:bg-primary-dark/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {!editingTask && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/30 to-primary-dark/30 border border-accent-light/10">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-accent-orange" />
              <span className="text-sm font-medium text-white">Repeat</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRepeatDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    repeatDays === days
                      ? 'bg-gradient-to-r from-accent-orange to-accent-red text-white'
                      : 'bg-primary-dark/50 text-accent-light hover:bg-secondary/50'
                  }`}
                >
                  {days === 1 ? '1 day' : days === 7 ? '1 week' : `${days} days`}
                </button>
              ))}
            </div>
            {repeatDays > 1 && (
              <p className="text-xs text-accent-light/60 mt-2">
                Will create {repeatDays} tasks starting from {new Date(formData.plannedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSaving || !formData.title.trim()}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-accent-orange to-accent-red rounded-xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-orange/20"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {editingTask ? 'Update Task' : repeatDays > 1 ? `Add ${repeatDays} Tasks` : 'Add Task'}
        </button>
      </form>
    </div>
  );
}
