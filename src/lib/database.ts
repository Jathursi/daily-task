const DB_KEY = 'smartlife-days';
const TASKS_KEY = 'smartlife-tasks';
const FOCUS_KEY = 'smartlife-focus';

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

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Study' | 'Work' | 'Coding' | 'Personal' | 'Health';
  plannedDate: string;
  plannedHours: number;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  date: string;
  sessionsCompleted: number;
  totalMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

const getDays = (): DayData[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDays = (days: DayData[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(days));
};

const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

const getFocusSessions = (): FocusSession[] => {
  const data = localStorage.getItem(FOCUS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveFocusSessions = (sessions: FocusSession[]) => {
  localStorage.setItem(FOCUS_KEY, JSON.stringify(sessions));
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const saveDayData = async (dayData: DayData): Promise<string> => {
  const days = getDays();
  const existingIndex = days.findIndex(d => d.userId === dayData.userId && d.date === dayData.date);
  
  if (existingIndex >= 0) {
    days[existingIndex] = { ...dayData, id: days[existingIndex].id, updatedAt: new Date().toISOString() };
    saveDays(days);
    return days[existingIndex].id!;
  } else {
    const newDay = { ...dayData, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    days.push(newDay);
    saveDays(days);
    return newDay.id!;
  }
};

export const getDayData = async (userId: string, date: string): Promise<DayData | null> => {
  const days = getDays();
  return days.find(d => d.userId === userId && d.date === date) || null;
};

export const getAllDaysData = async (userId: string): Promise<DayData[]> => {
  const days = getDays();
  return days.filter(d => d.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
};

export const getDaysDataInRange = async (userId: string, startDate: string, endDate: string): Promise<DayData[]> => {
  const days = getDays();
  return days.filter(d => d.userId === userId && d.date >= startDate && d.date <= endDate).sort((a, b) => a.date.localeCompare(b.date));
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const tasks = getTasks();
  const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask.id;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index >= 0) {
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    saveTasks(tasks);
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  saveTasks(filtered);
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const tasks = getTasks();
  return tasks.filter(t => t.userId === userId).sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
};

export const getTasksByDate = async (userId: string, date: string): Promise<Task[]> => {
  const tasks = getTasks();
  return tasks.filter(t => t.userId === userId && t.plannedDate === date);
};

export const getTodaysTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getTasksByDate(userId, today);
};

export const getOverdueTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = getTasks();
  return tasks.filter(t => t.userId === userId && t.plannedDate < today && !t.completed);
};

export const getUpcomingTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = getTasks();
  return tasks.filter(t => t.userId === userId && t.plannedDate > today && !t.completed);
};

export const toggleTaskComplete = async (taskId: string, completed: boolean): Promise<void> => {
  await updateTask(taskId, { completed });
};

export const moveTaskToTomorrow = async (taskId: string): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  await updateTask(taskId, { plannedDate: tomorrowStr });
};

export const saveFocusSession = async (session: Omit<FocusSession, 'id'>): Promise<string> => {
  const sessions = getFocusSessions();
  const existingIndex = sessions.findIndex(s => s.userId === session.userId && s.date === session.date);
  
  if (existingIndex >= 0) {
    sessions[existingIndex].sessionsCompleted += session.sessionsCompleted;
    sessions[existingIndex].totalMinutes += session.totalMinutes;
    sessions[existingIndex].updatedAt = new Date().toISOString();
    saveFocusSessions(sessions);
    return sessions[existingIndex].id;
  } else {
    const newSession: FocusSession = { ...session, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    sessions.push(newSession);
    saveFocusSessions(sessions);
    return newSession.id;
  }
};

export const getTodayFocusSessions = async (userId: string, date: string): Promise<FocusSession | null> => {
  const sessions = getFocusSessions();
  return sessions.find(s => s.userId === userId && s.date === date) || null;
};

export const getAllFocusSessions = async (userId: string): Promise<FocusSession[]> => {
  const sessions = getFocusSessions();
  return sessions.filter(s => s.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
};
