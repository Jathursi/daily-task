'use client';

import { useState } from 'react';
import { Task } from '@/store/useAppStore';
import { ArrowRight, Trash2, Calendar, X } from 'lucide-react';

interface SmartCarryForwardProps {
  task: Task;
  onMoveToTomorrow: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onKeepOverdue: () => void;
}

export default function SmartCarryForward({ task, onMoveToTomorrow, onDelete, onKeepOverdue }: SmartCarryForwardProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!isOpen) return null;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="glass-card p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-accent-orange" />
            <h3 className="text-lg font-semibold text-white">Task Not Completed</h3>
          </div>
          <button
            onClick={onKeepOverdue}
            className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
          >
            <X className="w-5 h-5 text-accent-light" />
          </button>
        </div>
        
        <p className="text-accent-light/80 mb-4">
          You didn&apos;t complete &quot;<span className="text-white font-medium">{task.title}</span>&quot; on {new Date(task.plannedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onMoveToTomorrow(task.id!);
              setIsOpen(false);
            }}
            className="w-full p-4 rounded-xl bg-accent-orange/20 border border-accent-orange/30 hover:bg-accent-orange/30 transition-colors flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-accent-orange" />
            <div className="text-left">
              <p className="text-white font-medium">Move to Tomorrow</p>
              <p className="text-sm text-accent-light/60">{tomorrowStr}</p>
            </div>
          </button>
          
          <button
            onClick={() => {
              onDelete(task.id!);
              setIsOpen(false);
            }}
            className="w-full p-4 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="text-white font-medium">Delete Task</p>
              <p className="text-sm text-accent-light/60">Remove this task permanently</p>
            </div>
          </button>
          
          <button
            onClick={onKeepOverdue}
            className="w-full p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 hover:bg-secondary transition-colors text-left"
          >
            <p className="text-accent-light">Keep as Overdue</p>
          </button>
        </div>
      </div>
    </div>
  );
}
