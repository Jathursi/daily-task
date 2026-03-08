'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { subscribeDaysData } from '@/services/dayService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, AreaChart, Area } from 'recharts';

export default function AnalyticsPage() {
  const { userId, daysData, setDaysData } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const unsubscribe = subscribeDaysData(userId, (data) => {
      setDaysData(data);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId, setDaysData]);

  const getWeeklyData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData: { [key: string]: { study: number; work: number; coding: number; count: number } } = {};
    
    dayNames.forEach(day => {
      weekData[day] = { study: 0, work: 0, coding: 0, count: 0 };
    });
    
    daysData.forEach(day => {
      const dayOfWeek = new Date(day.date).getDay();
      const dayName = dayNames[dayOfWeek];
      weekData[dayName].study += day.studyHours;
      weekData[dayName].work += day.workHours;
      weekData[dayName].coding += day.codingHours;
      weekData[dayName].count += 1;
    });
    
    return dayNames.map(day => ({
      day,
      study: weekData[day].count > 0 ? (weekData[day].study / weekData[day].count).toFixed(1) : 0,
      work: weekData[day].count > 0 ? (weekData[day].work / weekData[day].count).toFixed(1) : 0,
      coding: weekData[day].count > 0 ? (weekData[day].coding / weekData[day].count).toFixed(1) : 0,
    }));
  };

  const getProductivityTrend = () => {
    return [...daysData]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: day.productivityScore,
      }));
  };

  const getSleepProductivityData = () => {
    return daysData
      .filter(d => d.sleepHours > 0)
      .map(day => ({
        sleep: day.sleepHours,
        productivity: day.productivityScore,
      }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (daysData.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-accent-light/60">Track your productivity trends</p>
        </div>
        <div className="glass-card p-12 text-center">
          <p className="text-accent-light/60">
            Start logging your daily activities to see analytics and trends!
          </p>
        </div>
      </div>
    );
  }

  const weeklyData = getWeeklyData();
  const trendData = getProductivityTrend();
  const scatterData = getSleepProductivityData();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-accent-light/60">Track your productivity trends and patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Hours per Day</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis dataKey="day" stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <YAxis stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9'
                  }}
                />
                <Bar dataKey="study" fill="#A34054" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Work Hours per Day</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis dataKey="day" stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <YAxis stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9'
                  }}
                />
                <Bar dataKey="work" fill="#662249" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sleep vs Productivity</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="sleep" 
                  name="Sleep" 
                  stroke="rgba(233, 188, 185, 0.5)" 
                  fontSize={12}
                  domain={[0, 12]}
                />
                <YAxis 
                  type="number" 
                  dataKey="productivity" 
                  name="Productivity" 
                  stroke="rgba(233, 188, 185, 0.5)" 
                  fontSize={12}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9'
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter data={scatterData} fill="#ED9E59" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Productivity Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <YAxis stroke="rgba(233, 188, 185, 0.5)" fontSize={12} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9'
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#ED9E59" strokeWidth={2} dot={{ fill: '#ED9E59' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Coding Hours Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.map((d, i) => ({ ...d, coding: weeklyData[i % 7].coding }))}>
                <defs>
                  <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#44174E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#44174E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <YAxis stroke="rgba(233, 188, 185, 0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1931',
                    border: '1px solid rgba(233, 188, 185, 0.2)',
                    borderRadius: '12px',
                    color: '#E9BCB9'
                  }}
                />
                <Area type="monotone" dataKey="coding" stroke="#44174E" strokeWidth={2} fillOpacity={1} fill="url(#colorCoding)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
