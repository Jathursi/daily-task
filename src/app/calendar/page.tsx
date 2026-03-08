'use client';

import { useState } from 'react';
import CalendarView from '@/components/CalendarView';
import DayEntryForm from '@/components/DayEntryForm';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
        <p className="text-accent-light/60">View your productivity heatmap</p>
      </div>

      {!showForm ? (
        <CalendarView onSelectDate={handleSelectDate} />
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowForm(false)}
            className="text-accent-light/60 hover:text-white transition-colors"
          >
            ← Back to Calendar
          </button>
          <DayEntryForm
            selectedDate={selectedDate!}
            onDateChange={setSelectedDate}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}
