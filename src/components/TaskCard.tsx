'use client';

import { Task } from '@/store/useAppStore';
import { Check, Edit2, Trash2, Book, Briefcase, Code, User, Heart, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewDetails?: (task: Task) => void;
  isOverdue?: boolean;
  showDate?: boolean;
}

const categoryIcons = {
  Study: Book,
  Work: Briefcase,
  Coding: Code,
  Personal: User,
  Health: Heart,
};

const priorityColors = {
  Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const categoryColors = {
  Study: 'from-blue-500 to-blue-600',
  Work: 'from-purple-500 to-purple-600',
  Coding: 'from-green-500 to-green-600',
  Personal: 'from-pink-500 to-pink-600',
  Health: 'from-emerald-500 to-emerald-600',
};

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onViewDetails, isOverdue = false, showDate = false }: TaskCardProps) {
  const CategoryIcon = categoryIcons[task.category];
  const today = new Date().toISOString().split('T')[0];
  const isToday = task.plannedDate === today;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => onViewDetails?.(task)}
      className={`glass-card p-3 sm:p-4 transition-all overflow-hidden cursor-pointer hover:border-accent-orange/30 ${isOverdue ? 'border-red-500/50 bg-red-500/5' : ''}`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <button
          onClick={() => onToggleComplete(task)}
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            task.completed
              ? 'bg-accent-orange border-accent-orange'
              : 'border-accent-light/30 hover:border-accent-orange'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${categoryColors[task.category]} flex items-center justify-center`}>
              <CategoryIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <h4 className={`text-sm sm:text-base font-medium text-white ${task.completed ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </h4>
          
          {task.description && (
            <p className="text-xs sm:text-sm text-accent-light/60 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-[11px] sm:text-xs text-accent-light/60">
            {showDate && (
              <span className={isOverdue ? 'text-red-400' : isToday ? 'text-accent-orange' : ''}>
                {isToday ? 'Today' : formatDate(task.plannedDate)}
              </span>
            )}
            {task.plannedTime && (
              <span className="text-accent-light/80">{task.plannedTime}</span>
            )}
            <span>{task.plannedHours}h planned</span>
            {isOverdue && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-light" />
          </button>
          <button
            onClick={() => onDelete(task.id!)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
