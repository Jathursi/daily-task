'use client';

import { AlertCircle, CalendarCheck, Flame, CheckCircle } from 'lucide-react';

interface TaskAlertPanelProps {
  overdueCount: number;
  todayCount: number;
  completedToday: number;
}

export default function TaskAlertPanel({ overdueCount, todayCount, completedToday }: TaskAlertPanelProps) {
  const allCompletedYesterday = overdueCount === 0 && completedToday > 0;
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Task Alerts</h3>
      
      <div className="space-y-3">
        {overdueCount > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">
                {overdueCount} task{overdueCount > 1 ? 's' : ''} not completed
              </p>
              <p className="text-sm text-red-400/70 mt-1">
                You missed these tasks. Consider rescheduling or completing them today.
              </p>
            </div>
          </div>
        )}
        
        {overdueCount === 0 && completedToday > 0 && allCompletedYesterday && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
            <Flame className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">All tasks completed yesterday!</p>
              <p className="text-sm text-green-400/70 mt-1">
                Great job! Keep up the momentum.
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 rounded-xl bg-accent-orange/10 border border-accent-orange/30 flex items-start gap-3">
          <CalendarCheck className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-accent-orange font-medium">
              {todayCount} task{todayCount !== 1 ? 's' : ''} planned today
            </p>
            <p className="text-sm text-accent-orange/70 mt-1">
              {completedToday > 0 
                ? `${completedToday} completed, ${todayCount - completedToday} remaining`
                : 'Start your day by completing these tasks'}
            </p>
          </div>
        </div>
        
        {todayCount === 0 && overdueCount === 0 && (
          <div className="p-4 rounded-xl bg-secondary/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-accent-light flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-accent-light font-medium">No tasks planned</p>
              <p className="text-sm text-accent-light/70 mt-1">
                Plan your day ahead for better productivity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
