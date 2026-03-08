'use client';

import { useEffect, useState } from 'react';
import { useAppStore, DayData, Task } from '@/store/useAppStore';
import { subscribeDaysData } from '@/services/dayService';
import { subscribeTasksByUser } from '@/services/taskService';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface CalendarViewProps {
  onSelectDate: (date: string) => void;
}

export default function CalendarView({ onSelectDate }: CalendarViewProps) {
  const { userId, daysData, setDaysData, tasks, setTasks } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const unsubscribeDays = subscribeDaysData(userId, (data) => {
      setDaysData(data);
      setIsLoading(false);
    });

    const unsubscribeTasks = subscribeTasksByUser(userId, (userTasks) => {
      setTasks(userTasks);
    });

    return () => {
      unsubscribeDays();
      unsubscribeTasks();
    };
  }, [userId, setDaysData, setTasks]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDayData = (day: number): DayData | undefined => {
    const dateStr = getDateString(day);
    return daysData.find(d => d.date === dateStr);
  };

  const getDayTasks = (day: number): Task[] => {
    const dateStr = getDateString(day);
    return tasks.filter(t => t.plannedDate === dateStr);
  };

  const getHeatmapColor = (score: number | undefined, dayTasks: Task[], dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (dayTasks.length > 0) {
      const completedTasks = dayTasks.filter(t => t.completed).length;
      if (dateStr < today && completedTasks === 0) {
        return 'bg-red-500/40 border border-red-500/50';
      }
      if (completedTasks === dayTasks.length) {
        return 'bg-green-500/40 border border-green-500/50';
      }
      return 'bg-yellow-500/40 border border-yellow-500/50';
    }
    
    if (!score) return 'bg-primary-dark/30';
    const intensity = score / 10;
    if (intensity < 0.3) return 'bg-accent-light/20';
    if (intensity < 0.5) return 'bg-accent-light/40';
    if (intensity < 0.7) return 'bg-accent-red/60';
    return 'bg-accent-red';
  };

  const getTaskIndicator = (dayTasks: Task[], dateStr: string) => {
    if (dayTasks.length === 0) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const completedTasks = dayTasks.filter(t => t.completed).length;
    
    if (dateStr < today && completedTasks === 0) {
      return <AlertTriangle className="w-3 h-3 text-red-400" />;
    }
    if (completedTasks === dayTasks.length) {
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    }
    return <Clock className="w-3 h-3 text-yellow-400" />;
  };

  const changeMonth = (months: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + months);
    setCurrentDate(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-accent-light" />
        </button>
        <h3 className="text-xl font-semibold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-accent-light" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-accent-light/60 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-20" />;
          }
          
          const dayData = getDayData(day);
          const dayTasks = getDayTasks(day);
          const dateStr = getDateString(day);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const taskIndicator = getTaskIndicator(dayTasks, dateStr);
          
          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`h-20 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                isToday 
                  ? 'ring-2 ring-accent-orange' 
                  : ''
              } ${dayTasks.length > 0 ? getHeatmapColor(dayData?.productivityScore, dayTasks, dateStr) : dayData ? getHeatmapColor(dayData.productivityScore, [], dateStr) : 'bg-primary-dark/30 hover:bg-secondary'}`}
            >
              <span className={`text-sm font-medium ${dayData || dayTasks.length > 0 ? 'text-white' : 'text-accent-light/60'}`}>
                {day}
              </span>
              {taskIndicator && (
                <div className="flex items-center gap-1">
                  {taskIndicator}
                  <span className="text-xs text-accent-light/80">{dayTasks.length}</span>
                </div>
              )}
              {dayData && !taskIndicator && (
                <span className="text-xs text-accent-light/80">
                  {dayData.productivityScore}/10
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/40 border border-green-500/50" />
          <span className="text-xs text-accent-light/60">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/40 border border-yellow-500/50" />
          <span className="text-xs text-accent-light/60">Planned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/40 border border-red-500/50" />
          <span className="text-xs text-accent-light/60">Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent-light/20" />
          <span className="text-xs text-accent-light/60">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent-red" />
          <span className="text-xs text-accent-light/60">High</span>
        </div>
      </div>
    </div>
  );
}
