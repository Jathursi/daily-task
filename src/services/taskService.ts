import { db } from '@/lib/firebase';
import { Task } from '@/store/useAppStore';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';

export const createTask = async (userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const tasksRef = ref(db, `users/${userId}/tasks`);
  const newTaskRef = push(tasksRef);
  const taskId = newTaskRef.key;

  if (!taskId) {
    throw new Error('Failed to create task id');
  }

  const newTask: Task = {
    ...task,
    userId,
    id: taskId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(newTaskRef, newTask);
  return taskId;
};

export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  await update(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  await remove(taskRef);
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const tasksRef = ref(db, `users/${userId}/tasks`);
  const snapshot = await get(tasksRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, Task>;
  return Object.entries(data)
    .map(([id, value]) => ({ ...value, id }))
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
};

export const getTasksByDate = async (userId: string, date: string): Promise<Task[]> => {
  const tasks = await getTasksByUser(userId);
  return tasks.filter((task) => task.plannedDate === date);
};

export const getTodaysTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getTasksByDate(userId, today);
};

export const getOverdueTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await getTasksByUser(userId);
  return tasks.filter((task) => task.plannedDate < today && !task.completed);
};

export const getUpcomingTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await getTasksByUser(userId);
  return tasks.filter((task) => task.plannedDate > today && !task.completed);
};

export const toggleTaskComplete = async (userId: string, taskId: string, completed: boolean): Promise<void> => {
  await updateTask(userId, taskId, { completed });
};

export const moveTaskToTomorrow = async (userId: string, taskId: string): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  await updateTask(userId, taskId, { plannedDate: tomorrowStr });
};

export const subscribeTasksByUser = (userId: string, callback: (tasks: Task[]) => void): (() => void) => {
  const tasksRef = ref(db, `users/${userId}/tasks`);

  return onValue(tasksRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, Task>;
    const tasks = Object.entries(data)
      .map(([id, value]) => ({ ...value, id }))
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));

    callback(tasks);
  });
};
