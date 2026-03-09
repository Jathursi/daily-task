'use client';

import { useState } from 'react';
import { Task } from '@/store/useAppStore';
import { X, Plus, Loader2, Repeat } from 'lucide-react';

interface TaskPlannerProps {
  userId: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTask?: Task | null;
  onCancelEdit?: () => void;
}

const categories = ['Study', 'Work', 'Coding', 'Personal', 'Health'] as const;
const priorities = ['Low', 'Medium', 'High'] as const;

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
    <div className="rounded-2xl border border-accent-light/15 bg-primary-dark shadow-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {editingTask ? 'Edit Task' : 'Plan New Task'}
        </h3>
        {onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
            aria-label="Close task planner"
          >
            <X className="w-5 h-5 text-accent-light" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="What do you need to do?"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field min-h-[80px] resize-none"
            placeholder="Add more details..."
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Planned Hours</label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={formData.plannedHours}
              onChange={(e) => setFormData({ ...formData, plannedHours: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Date</label>
            <input
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Time (optional)</label>
            <input
              type="time"
              value={formData.plannedTime || ''}
              onChange={(e) => setFormData({ ...formData, plannedTime: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="w-full sm:max-w-xs">
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
            className="input-field"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {!editingTask && (
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-accent-light/10">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-accent-orange" />
              <span className="text-xs sm:text-sm font-medium text-white">Repeat</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRepeatDays(days)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                    repeatDays === days
                      ? 'bg-accent-orange text-white'
                      : 'bg-primary-dark/50 text-accent-light hover:bg-secondary'
                  }`}
                >
                  {days === 1 ? '1 day' : days === 7 ? '1 week' : `${days} days`}
                </button>
              ))}
            </div>
            {repeatDays > 1 && (
              <p className="text-xs text-accent-light/60 mt-2">
                This task will be added for {repeatDays} consecutive days starting from {new Date(formData.plannedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSaving || !formData.title.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base"
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
