'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getDayData, saveDayData } from '@/services/dayService';
import { FileText, Save, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function NotesPage() {
  const { userId, daysData } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pastNotes, setPastNotes] = useState<{ date: string; notes: string }[]>([]);

  useEffect(() => {
    const loadNotes = async () => {
      if (!userId) return;
      setIsLoading(true);
      
      const dayData = await getDayData(userId, selectedDate);
      if (dayData) {
        setNotes(dayData.notes || '');
      } else {
        setNotes('');
      }
      
      const notesWithContent = daysData
        .filter(d => d.notes && d.notes.length > 0)
        .map(d => ({ date: d.date, notes: d.notes }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);
      setPastNotes(notesWithContent);
      
      setIsLoading(false);
    };
    
    loadNotes();
  }, [userId, selectedDate, daysData]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    await saveDayData(userId, {
      date: selectedDate,
      userId,
      studyHours: 0,
      workHours: 0,
      codingHours: 0,
      sleepHours: 0,
      exerciseMinutes: 0,
      productivityScore: 0,
      mood: '😊',
      notes,
    });
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Notes</h1>
        <p className="text-accent-light/60">Daily reflections and journal entries</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
          Notes saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-accent-light" />
              </button>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-orange" />
                <span className="text-lg font-semibold text-white">
                  {formatDate(selectedDate)}
                </span>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg hover:bg-accent-light/10 transition-colors"
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              >
                <ChevronRight className="w-5 h-5 text-accent-light" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[400px] resize-none"
                placeholder="Write your thoughts, reflections, or anything on your mind..."
              />
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Notes
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Notes</h3>
            {pastNotes.length === 0 ? (
              <p className="text-accent-light/60 text-sm">No notes yet. Start writing!</p>
            ) : (
              <div className="space-y-3">
                {pastNotes.map((note) => (
                  <button
                    key={note.date}
                    onClick={() => setSelectedDate(note.date)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedDate === note.date
                        ? 'bg-secondary ring-2 ring-accent-orange'
                        : 'bg-primary-dark/50 hover:bg-secondary'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{formatDate(note.date)}</p>
                    <p className="text-xs text-accent-light/60 mt-1 line-clamp-2">{note.notes}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
