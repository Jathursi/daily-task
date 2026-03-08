import { DayData } from '@/store/useAppStore';

export interface Insight {
  title: string;
  description: string;
  icon: string;
}

export const calculateInsights = (days: DayData[]): Insight[] => {
  if (days.length === 0) return [];

  const insights: Insight[] = [];
  
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));
  
  const productivityByDay: { [key: string]: number[] } = {};
  sortedDays.forEach(day => {
    const dayOfWeek = new Date(day.date).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!productivityByDay[dayNames[dayOfWeek]]) {
      productivityByDay[dayNames[dayOfWeek]] = [];
    }
    productivityByDay[dayNames[dayOfWeek]].push(day.productivityScore);
  });

  let bestDay = '';
  let maxAvg = 0;
  Object.entries(productivityByDay).forEach(([day, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      bestDay = day;
    }
  });

  if (bestDay) {
    insights.push({
      title: 'Most Productive Day',
      description: `You are most productive on ${bestDay}s with an average score of ${maxAvg.toFixed(1)}`,
      icon: 'calendar'
    });
  }

  const totalStudyHours = days.reduce((sum, day) => sum + day.studyHours, 0);
  const avgStudyHours = totalStudyHours / days.length;
  insights.push({
    title: 'Study Pattern',
    description: `Your average study time is ${avgStudyHours.toFixed(1)} hours/day`,
    icon: 'book'
  });

  const daysWithSleep = days.filter(d => d.sleepHours > 0);
  const highSleepDays = daysWithSleep.filter(d => d.sleepHours >= 7);
  const lowSleepDays = daysWithSleep.filter(d => d.sleepHours < 7);
  
  if (highSleepDays.length > 0 && lowSleepDays.length > 0) {
    const highSleepAvgProd = highSleepDays.reduce((sum, d) => sum + d.productivityScore, 0) / highSleepDays.length;
    const lowSleepAvgProd = lowSleepDays.reduce((sum, d) => sum + d.productivityScore, 0) / lowSleepDays.length;
    
    if (highSleepAvgProd > lowSleepAvgProd) {
      insights.push({
        title: 'Sleep Impact',
        description: `Sleeping more than 7 hours improves your productivity by ${((highSleepAvgProd - lowSleepAvgProd) / lowSleepAvgProd * 100).toFixed(0)}%`,
        icon: 'moon'
      });
    }
  }

  const sortedByScore = [...days].sort((a, b) => b.productivityScore - a.productivityScore);
  if (sortedByScore.length > 0) {
    const bestDayData = sortedByScore[0];
    insights.push({
      title: 'Best Day',
      description: `Your best day was ${new Date(bestDayData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} with a score of ${bestDayData.productivityScore}`,
      icon: 'trophy'
    });
  }

  const totalWorkHours = days.reduce((sum, day) => sum + day.workHours, 0);
  const totalCodingHours = days.reduce((sum, day) => sum + day.codingHours, 0);
  insights.push({
    title: 'Work Statistics',
    description: `Total work: ${totalWorkHours}h | Total coding: ${totalCodingHours}h`,
    icon: 'briefcase'
  });

  const streak = calculateStreak(days);
  insights.push({
    title: 'Current Streak',
    description: streak > 0 ? `Your current productivity streak is ${streak} days!` : 'Start your streak by logging productive days!',
    icon: 'flame'
  });

  return insights;
};

export const calculateStreak = (days: DayData[]): number => {
  if (days.length === 0) return 0;
  
  const sortedDays = [...days]
    .filter(d => d.productivityScore >= 6)
    .sort((a, b) => b.date.localeCompare(a.date));
  
  if (sortedDays.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDays.length; i++) {
    const dayDate = new Date(sortedDays[i].date);
    dayDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (dayDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (i === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dayDate.getTime() === yesterday.getTime()) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateBestStreak = (days: DayData[]): number => {
  if (days.length === 0) return 0;
  
  const sortedDays = [...days]
    .filter(d => d.productivityScore >= 6)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (sortedDays.length === 0) return 0;
  
  let bestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1].date);
    const currDate = new Date(sortedDays[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return bestStreak;
};
