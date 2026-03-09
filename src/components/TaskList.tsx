'use client';

import { Task } from '@/store/useAppStore';
import TaskCard from '@/components/TaskCard';

interface TaskListProps {
  title: string;
  tasks: Task[];
  emptyText: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewDetails?: (task: Task) => void;
  isOverdue?: boolean;
}

export default function TaskList({
  title,
  tasks,
  emptyText,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewDetails,
  isOverdue = false,
}: TaskListProps) {
  return (
    <div className="space-y-3 sm:space-y-4 min-w-0">
      <div className="flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
        <span className={`text-xs sm:text-sm ${isOverdue ? 'text-red-400/60' : 'text-accent-light/60'}`}>
          ({tasks.length})
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-accent-light/60 text-xs sm:text-sm">{emptyText}</p>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              isOverdue={isOverdue}
              showDate
            />
          ))}
        </div>
      )}
    </div>
  );
}
