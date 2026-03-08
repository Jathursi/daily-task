'use client';

import { useState } from 'react';
import DayTrackerForm from '@/components/DayTrackerForm';

export default function DailyTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Daily Tracker</h1>
        <p className="text-accent-light/60">Log your daily activities and track your progress</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
          Data saved successfully!
        </div>
      )}

      <div className="max-w-2xl">
        <DayTrackerForm
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
