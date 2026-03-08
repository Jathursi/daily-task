'use client';

import { useState, useEffect } from 'react';
import { useAppStore, DayData } from '@/store/useAppStore';
import { saveDayData, getDayData } from '@/services/dayService';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface DayEntryFormProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave: () => void;
}

const moods = ['😊', '😐', '😔', '😤', '🥳', '😴'];

export default function DayEntryForm({ selectedDate, onDateChange, onSave }: DayEntryFormProps) {
  const { userId, daysData, updateDayData, addDayData } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<DayData>>({
    studyHours: 0,
    workHours: 0,
    codingHours: 0,
    sleepHours: 0,
    exerciseMinutes: 0,
    productivityScore: 5,
    mood: '😊',
    notes: '',
  });

  useEffect(() => {
    const loadDayData = async () => {
      if (!userId || !selectedDate) return;
      setIsLoading(true);
      
      const existingData = await getDayData(userId, selectedDate);
      if (existingData) {
        setFormData(existingData);
      } else {
        setFormData({
          studyHours: 0,
          workHours: 0,
          codingHours: 0,
          sleepHours: 0,
          exerciseMinutes: 0,
          productivityScore: 5,
          mood: '😊',
          notes: '',
        });
      }
      setIsLoading(false);
    };
    
    loadDayData();
  }, [userId, selectedDate]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    const dayData: DayData = {
      date: selectedDate,
      userId,
      studyHours: Number(formData.studyHours) || 0,
      workHours: Number(formData.workHours) || 0,
      codingHours: Number(formData.codingHours) || 0,
      sleepHours: Number(formData.sleepHours) || 0,
      exerciseMinutes: Number(formData.exerciseMinutes) || 0,
      productivityScore: Number(formData.productivityScore) || 5,
      mood: formData.mood || '😊',
      notes: formData.notes || '',
    };
    
    await saveDayData(dayData);
    const alreadyExists = daysData.some((day) => day.date === selectedDate);
    if (alreadyExists) {
      updateDayData(dayData);
    } else {
      addDayData(dayData);
    }
    setIsSaving(false);
    onSave();
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-accent-light" />
        </button>
        <h3 className="text-base sm:text-lg font-semibold text-white text-center px-2">{formatDate(selectedDate)}</h3>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-accent-light" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Study Hours</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.studyHours || ''}
            onChange={(e) => setFormData({ ...formData, studyHours: Number(e.target.value) })}
            className="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Work Hours</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.workHours || ''}
            onChange={(e) => setFormData({ ...formData, workHours: Number(e.target.value) })}
            className="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Coding Hours</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.codingHours || ''}
            onChange={(e) => setFormData({ ...formData, codingHours: Number(e.target.value) })}
            className="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Sleep Hours</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.sleepHours || ''}
            onChange={(e) => setFormData({ ...formData, sleepHours: Number(e.target.value) })}
            className="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Exercise (min)</label>
          <input
            type="number"
            min="0"
            max="480"
            step="5"
            value={formData.exerciseMinutes || ''}
            onChange={(e) => setFormData({ ...formData, exerciseMinutes: Number(e.target.value) })}
            className="input-field"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Mood</label>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setFormData({ ...formData, mood })}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-xl sm:text-2xl transition-all ${
                formData.mood === mood
                  ? 'bg-secondary scale-110 ring-2 ring-accent-orange'
                  : 'bg-primary-dark/50 hover:bg-secondary'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">
          Productivity Score: <span className="text-accent-orange font-bold">{formData.productivityScore}</span>/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.productivityScore || 5}
          onChange={(e) => setFormData({ ...formData, productivityScore: Number(e.target.value) })}
          className="w-full h-2 bg-primary-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-orange"
        />
        <div className="flex justify-between text-xs text-accent-light/40 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm text-accent-light/60 mb-1.5 sm:mb-2">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input-field min-h-[100px] sm:min-h-[120px] resize-none"
          placeholder="How was your day?"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        Save Day Data
      </button>
    </div>
  );
}
