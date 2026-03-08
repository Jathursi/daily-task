'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { saveFocusSession } from '@/services/focusService';
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';

interface FocusTimerProps {
  initialMinutes?: number;
  isBreak?: boolean;
}

export default function FocusTimer({ initialMinutes = 25, isBreak = false }: FocusTimerProps) {
  const { userId } = useAppStore();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(isBreak);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const FOCUS_TIME = 25;
  const BREAK_TIME = 5;

  const handleSessionComplete = useCallback(async () => {
    if (!userId) return;
    
    const today = new Date().toISOString().split('T')[0];
    await saveFocusSession({
      userId,
      date: today,
      sessionsCompleted: 1,
      totalMinutes: FOCUS_TIME,
    });
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (!isBreakMode) {
              setSessionsCompleted(prev => prev + 1);
              setTotalMinutes(prev => prev + FOCUS_TIME);
              handleSessionComplete();
            }
            setIsActive(false);
            setIsBreakMode(!isBreakMode);
            setMinutes(isBreakMode ? FOCUS_TIME : BREAK_TIME);
            setSeconds(0);
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreakMode, handleSessionComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreakMode ? BREAK_TIME : FOCUS_TIME);
    setSeconds(0);
  };

  const skipToBreak = () => {
    setIsActive(false);
    setIsBreakMode(true);
    setMinutes(BREAK_TIME);
    setSeconds(0);
  };

  const skipToFocus = () => {
    setIsActive(false);
    setIsBreakMode(false);
    setMinutes(FOCUS_TIME);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((isBreakMode ? BREAK_TIME : FOCUS_TIME) * 60 - (minutes * 60 + seconds)) / ((isBreakMode ? BREAK_TIME : FOCUS_TIME) * 60) * 100;

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-dark/50 mb-4">
          {isBreakMode ? (
            <>
              <Coffee className="w-4 h-4 text-accent-light" />
              <span className="text-sm text-accent-light">Break Time</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4 text-accent-orange" />
              <span className="text-sm text-accent-orange">Focus Time</span>
            </>
          )}
        </div>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(233, 188, 185, 0.1)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isBreakMode ? '#44174E' : '#ED9E59'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.83} 283`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-white">
            {formatTime(minutes, seconds)}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isActive 
              ? 'bg-accent-red hover:bg-accent-red/80' 
              : 'bg-accent-orange hover:bg-accent-orange/80'
          }`}
        >
          {isActive ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={skipToFocus}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            !isBreakMode ? 'bg-accent-orange text-white' : 'bg-primary-dark/50 text-accent-light hover:bg-secondary'
          }`}
        >
          Focus
        </button>
        <button
          onClick={skipToBreak}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            isBreakMode ? 'bg-secondary text-white' : 'bg-primary-dark/50 text-accent-light hover:bg-secondary'
          }`}
        >
          Break
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-accent-light/60">
          Sessions completed today: <span className="text-accent-orange font-bold">{sessionsCompleted}</span>
        </p>
        <p className="text-sm text-accent-light/60 mt-1">
          Total focus time: <span className="text-white font-bold">{totalMinutes} min</span>
        </p>
      </div>
    </div>
  );
}
