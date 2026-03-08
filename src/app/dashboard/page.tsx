'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore, DayData } from '@/store/useAppStore';
import { subscribeDaysData } from '@/services/dayService';
import { subscribeTasksByUser } from '@/services/taskService';
import { calculateInsights, calculateStreak, calculateBestStreak } from '@/services/analytics';
import MetricCard from '@/components/MetricCard';
import ProductivityChart from '@/components/ProductivityChart';
import InsightsPanel from '@/components/InsightsPanel';
import StreakCounter from '@/components/StreakCounter';
import TaskAlertPanel from '@/components/TaskAlertPanel';
import { CheckCircle2, Circle, FileText, TriangleAlert } from 'lucide-react';

export default function Dashboard() {
  const { userId, daysData, setDaysData, tasks, setTasks } = useAppStore();
  const [todayData, setTodayData] = useState<DayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const unsubscribeDays = subscribeDaysData(userId, (data) => {
      setDaysData(data);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = data.find((day) => day.date === today);
      setTodayData(todayEntry || null);
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

  const getWeekData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = daysData.find(d => d.date === dateStr);
      weekData.push({
        day: days[date.getDay()],
        score: dayData?.productivityScore || 0
      });
    }
    return weekData;
  };

  const insights = calculateInsights(daysData);
  const currentStreak = calculateStreak(daysData);
  const bestStreak = calculateBestStreak(daysData);

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.plannedDate === today);
  const completedTodayTasks = todaysTasks.filter(t => t.completed).length;
  const overdueTasks = tasks.filter(t => t.plannedDate < today && !t.completed);
  const recentDays = [...daysData].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const calculateProductivityScore = () => {
    const baseScore = todayData?.productivityScore || 0;
    if (todaysTasks.length > 0) {
      const taskCompletionBonus = (completedTodayTasks / todaysTasks.length) * 2;
      return Math.min(10, Math.round((baseScore + taskCompletionBonus) * 10) / 10);
    }
    return baseScore;
  };

  const metrics = [
    { title: 'Study Hours', value: todayData?.studyHours || 0, unit: 'hrs', icon: 'study' as const, color: 'study' },
    { title: 'Work Hours', value: todayData?.workHours || 0, unit: 'hrs', icon: 'work' as const, color: 'work' },
    { title: 'Coding Hours', value: todayData?.codingHours || 0, unit: 'hrs', icon: 'coding' as const, color: 'coding' },
    { title: 'Sleep Hours', value: todayData?.sleepHours || 0, unit: 'hrs', icon: 'sleep' as const, color: 'sleep' },
    { title: 'Exercise', value: todayData?.exerciseMinutes || 0, unit: 'min', icon: 'exercise' as const, color: 'exercise' },
    { title: 'Productivity', value: calculateProductivityScore() || '-', unit: '/10', icon: 'productivity' as const, color: 'productivity' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-accent-light/60">Today&apos;s productivity summary</p>
      </div>

      <TaskAlertPanel
        overdueCount={overdueTasks.length}
        todayCount={todaysTasks.length}
        completedToday={completedTodayTasks}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ProductivityChart data={getWeekData()} />
        </div>
        <div>
          <StreakCounter currentStreak={currentStreak} bestStreak={bestStreak} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <InsightsPanel insights={insights} />
        
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Today&apos;s Notes</h3>
          </div>
          {todayData?.notes ? (
            <p className="text-sm sm:text-base text-accent-light/80 line-clamp-4">{todayData.notes}</p>
          ) : (
            <p className="text-sm sm:text-base text-accent-light/60 text-center py-6 sm:py-8">
              No notes for today. Start journaling!
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Today&apos;s Tasks</h3>
            <Link href="/todo" className="text-xs sm:text-sm text-accent-orange hover:text-accent-red transition-colors">
              View all
            </Link>
          </div>

          {todaysTasks.length === 0 ? (
            <p className="text-accent-light/60 text-sm">No tasks planned for today.</p>
          ) : (
            <div className="space-y-3">
              {todaysTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-2.5 sm:p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10 flex items-center justify-between gap-2.5 sm:gap-3">
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-medium truncate ${task.completed ? 'text-accent-light/50 line-through' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-accent-light/60">{task.category} • {task.priority}</p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-accent-light/60 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Recent Calendar Entries</h3>
            <Link href="/calendar" className="text-xs sm:text-sm text-accent-orange hover:text-accent-red transition-colors">
              Open calendar
            </Link>
          </div>

          {recentDays.length === 0 ? (
            <p className="text-accent-light/60 text-sm">No day entries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDays.map((day) => {
                const isOverdueDay = tasks.some((task) => task.plannedDate === day.date && !task.completed && task.plannedDate < today);
                const completedDayTasks = tasks.filter((task) => task.plannedDate === day.date && task.completed).length;
                const totalDayTasks = tasks.filter((task) => task.plannedDate === day.date).length;

                return (
                  <div key={day.date} className="p-2.5 sm:p-3 rounded-xl bg-primary-dark/40 border border-accent-light/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm text-white font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs text-accent-light/70">Score {day.productivityScore}/10</span>
                        {isOverdueDay && <TriangleAlert className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-accent-light/60 mt-1">
                      Study {day.studyHours}h • Work {day.workHours}h • Coding {day.codingHours}h
                      {totalDayTasks > 0 ? ` • Tasks ${completedDayTasks}/${totalDayTasks}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
