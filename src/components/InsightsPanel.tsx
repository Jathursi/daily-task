'use client';

import { Calendar, Book, Moon, Trophy, Briefcase, Flame, Sparkles } from 'lucide-react';
import { Insight } from '@/services/analytics';

interface InsightsPanelProps {
  insights: Insight[];
}

const iconMap = {
  calendar: Calendar,
  book: Book,
  moon: Moon,
  trophy: Trophy,
  briefcase: Briefcase,
  flame: Flame,
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Smart Insights</h3>
        </div>
        <p className="text-sm sm:text-base text-accent-light/60 text-center py-6 sm:py-8">
          Start logging your daily activities to get personalized insights!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white">Smart Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.icon as keyof typeof iconMap] || Sparkles;
          return (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-xl bg-primary-dark/50 border border-accent-light/10 hover:border-accent-light/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-orange" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white">{insight.title}</p>
                  <p className="text-xs text-accent-light/70 mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
