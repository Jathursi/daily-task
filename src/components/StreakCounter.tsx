'use client';

import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
}

export default function StreakCounter({ currentStreak, bestStreak }: StreakCounterProps) {
  return (
    <div className="glass-card p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">🔥 Productivity Streak</h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 text-center">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 text-accent-orange" />
          <p className="text-xl sm:text-2xl font-bold text-white">{currentStreak}</p>
          <p className="text-xs text-accent-light/60">Current</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 text-center">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 text-accent-red" />
          <p className="text-xl sm:text-2xl font-bold text-white">{bestStreak}</p>
          <p className="text-xs text-accent-light/60">Best</p>
        </div>
      </div>
      <p className="text-[11px] sm:text-xs text-accent-light/50 mt-3 sm:mt-4 text-center">
        Days with productivity score ≥ 6
      </p>
    </div>
  );
}
