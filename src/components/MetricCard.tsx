'use client';

import { Book, Briefcase, Code, Moon, Dumbbell, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: 'study' | 'work' | 'coding' | 'sleep' | 'exercise' | 'productivity';
  color: string;
}

const iconMap = {
  study: Book,
  work: Briefcase,
  coding: Code,
  sleep: Moon,
  exercise: Dumbbell,
  productivity: TrendingUp,
};

const colorMap = {
  study: 'from-blue-500 to-blue-600',
  work: 'from-purple-500 to-purple-600',
  coding: 'from-green-500 to-green-600',
  sleep: 'from-indigo-500 to-indigo-600',
  exercise: 'from-orange-500 to-orange-600',
  productivity: 'from-accent-orange to-accent-red',
};

export default function MetricCard({ title, value, unit, icon, color }: MetricCardProps) {
  const Icon = iconMap[icon];
  const gradientClass = colorMap[color as keyof typeof colorMap] || colorMap.productivity;

  return (
    <div className="glass-card p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-accent-light/60 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-sm text-accent-light/60">{unit}</span>
      </div>
    </div>
  );
}
