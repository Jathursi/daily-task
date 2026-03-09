'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/store/useAppStore';
import { X, Calendar, Clock, Flag, BookOpen, Save, Loader2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const categoryColors: Record<string, string> = {
  Study: 'from-blue-500 to-blue-600',
  Work: 'from-purple-500 to-purple-600',
  Coding: 'from-green-500 to-green-600',
  Personal: 'from-pink-500 to-pink-600',
  Health: 'from-red-500 to-red-600',
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  Low: { label: 'Low', color: 'text-green-400' },
  Medium: { label: 'Medium', color: 'text-yellow-400' },
  High: { label: 'High', color: 'text-red-400' },
};

export default function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const [notes, setNotes] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    setNotes(task.description || '');
  }, [task]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onUpdate(task.id!, { description: notes });
    setIsSaving(false);
    setIsEditingNotes(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gradient-to-br from-primary-dark via-secondary/40 to-primary-dark rounded-2xl shadow-2xl overflow-hidden border border-accent-light/10">
        <div className="relative bg-gradient-to-r from-accent-orange/20 to-accent-red/20 p-4 sm:p-6 border-b border-accent-light/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[task.category]} flex items-center justify-center`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white line-clamp-1">{task.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[task.category]} text-white`}>
                {task.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-accent-light" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10">
              <div className="flex items-center gap-2 text-accent-light/60 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Date</span>
              </div>
              <p className="text-sm text-white font-medium">{formatDate(task.plannedDate)}</p>
            </div>
            
            <div className="p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10">
              <div className="flex items-center gap-2 text-accent-light/60 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Time</span>
              </div>
              <p className="text-sm text-white font-medium">{task.plannedTime || 'Not set'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10">
              <div className="flex items-center gap-2 text-accent-light/60 mb-1">
                <Flag className="w-4 h-4" />
                <span className="text-xs">Priority</span>
              </div>
              <p className={`text-sm font-medium ${priorityLabels[task.priority].color}`}>
                {priorityLabels[task.priority].label}
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10">
              <div className="flex items-center gap-2 text-accent-light/60 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Planned Hours</span>
              </div>
              <p className="text-sm text-white font-medium">{task.plannedHours} hrs</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-accent-light/70 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Notes
              </label>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-accent-orange hover:text-accent-orange/80"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-32 bg-primary-dark/60 border border-accent-light/20 rounded-xl px-4 py-3 text-white placeholder-accent-light/40 focus:outline-none focus:border-accent-orange/50 resize-none"
                  placeholder="Add notes for this task..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotes(task.description || '');
                      setIsEditingNotes(false);
                    }}
                    className="flex-1 py-2 px-4 rounded-xl bg-primary-dark/40 border border-accent-light/20 text-accent-light text-sm font-medium hover:bg-primary-dark/60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-accent-orange to-accent-red text-white text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary-dark/40 border border-accent-light/10 min-h-[80px]">
                {notes ? (
                  <p className="text-sm text-white whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-sm text-accent-light/40 italic">No notes added yet</p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-primary-dark/40 border border-accent-light/20 text-white font-medium hover:bg-primary-dark/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
