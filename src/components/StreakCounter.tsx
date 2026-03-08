'use client';

import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
}

export default function StreakCounter({ currentStreak, bestStreak }: StreakCounterProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">🔥 Productivity Streak</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-accent-orange" />
          <p className="text-2xl font-bold text-white">{currentStreak}</p>
          <p className="text-xs text-accent-light/60">Current</p>
        </div>
        <div className="p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-accent-red" />
          <p className="text-2xl font-bold text-white">{bestStreak}</p>
          <p className="text-xs text-accent-light/60">Best</p>
        </div>
      </div>
      <p className="text-xs text-accent-light/50 mt-4 text-center">
        Days with productivity score ≥ 6
      </p>
    </div>
  );
}
