import { create } from 'zustand';

export interface DayData {
  id?: string;
  date: string;
  userId: string;
  studyHours: number;
  workHours: number;
  codingHours: number;
  sleepHours: number;
  exerciseMinutes: number;
  productivityScore: number;
  mood: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  id?: string;
  userId: string;
  date: string;
  sessionsCompleted: number;
  totalMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  category: 'Study' | 'Work' | 'Coding' | 'Personal' | 'Health';
  plannedDate: string;
  plannedTime?: string;
  plannedHours: number;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppState {
  userId: string;
  currentDate: string;
  selectedDay: DayData | null;
  daysData: DayData[];
  tasks: Task[];
  isLoading: boolean;
  setUserId: (id: string) => void;
  setCurrentDate: (date: string) => void;
  setSelectedDay: (day: DayData | null) => void;
  setDaysData: (days: DayData[]) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setIsLoading: (loading: boolean) => void;
  addDayData: (day: DayData) => void;
  updateDayData: (day: DayData) => void;
  initUserId: () => void;
}

const getOrCreateUserId = () => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('smartlife-user-id');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('smartlife-user-id', userId);
  }
  return userId;
};

export const useAppStore = create<AppState>((set) => ({
  userId: '',
  currentDate: new Date().toISOString().split('T')[0],
  selectedDay: null,
  daysData: [],
  tasks: [],
  isLoading: false,
  setUserId: (id) => set({ userId: id }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setDaysData: (days) => set({ daysData: days }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === task.id ? task : t)
  })),
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId)
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addDayData: (day) => set((state) => ({ daysData: [...state.daysData, day] })),
  updateDayData: (day) => set((state) => ({
    daysData: state.daysData.map((d) => d.date === day.date ? day : d)
  })),
  initUserId: () => set({ userId: getOrCreateUserId() }),
}));
