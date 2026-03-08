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
  isOverdue?: boolean;
}

export default function TaskList({
  title,
  tasks,
  emptyText,
  onToggleComplete,
  onEdit,
  onDelete,
  isOverdue = false,
}: TaskListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className={`text-sm ${isOverdue ? 'text-red-400/60' : 'text-accent-light/60'}`}>
          ({tasks.length})
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-accent-light/60 text-sm">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              isOverdue={isOverdue}
              showDate
            />
          ))}
        </div>
      )}
    </div>
  );
}
