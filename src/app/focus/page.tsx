'use client';

import { useState } from 'react';
import FocusTimer from '@/components/FocusTimer';
import { Timer, Flame } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { subscribeTodayFocusSessions } from '@/services/focusService';
import { useEffect } from 'react';

export default function FocusPage() {
  const { userId } = useAppStore();
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const unsubscribe = subscribeTodayFocusSessions(userId, today, (session) => {
      setTodaySessions(session?.sessionsCompleted || 0);
      setTodayMinutes(session?.totalMinutes || 0);
    });

    return unsubscribe;
  }, [userId]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Focus Timer</h1>
        <p className="text-accent-light/60">Pomodoro technique for maximum productivity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusTimer />
        
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Today&apos;s Progress</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary-dark/50 text-center">
                <p className="text-3xl font-bold text-accent-orange">{todaySessions}</p>
                <p className="text-sm text-accent-light/60">Sessions</p>
              </div>
              <div className="p-4 rounded-xl bg-primary-dark/50 text-center">
                <p className="text-3xl font-bold text-white">{todayMinutes}</p>
                <p className="text-sm text-accent-light/60">Minutes</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
            <ul className="space-y-3 text-sm text-accent-light/80">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-accent-orange/20 text-accent-orange flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <span>Click the play button to start a 25-minute focus session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-accent-light flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <span>Work on a single task until the timer rings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-accent-light flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <span>Take a 5-minute break to recharge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-accent-light flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <span>After 4 sessions, take a longer 15-30 minute break</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-accent-orange" />
              <h3 className="text-lg font-semibold text-white">Tips</h3>
            </div>
            <p className="text-sm text-accent-light/80">
              The Pomodoro Technique helps you focus by breaking work into intervals. 
              Short breaks keep your mind fresh and prevent burnout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
