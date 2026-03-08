'use client';

import { Task } from '@/store/useAppStore';
import { AlertTriangle } from 'lucide-react';

interface OverdueTaskAlertProps {
  tasks: Task[];
}

export default function OverdueTaskAlert({ tasks }: OverdueTaskAlertProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 sm:gap-3">
      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm sm:text-base text-red-400 font-medium">⚠️ You missed this task yesterday.</p>
        <p className="text-xs sm:text-sm text-red-400/70 mt-1">
          {tasks.length} overdue task{tasks.length > 1 ? 's are' : ' is'} now in Overdue Tasks.
        </p>
      </div>
    </div>
  );
}
