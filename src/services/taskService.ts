import { db } from '@/lib/firebase';
import { Task } from '@/store/useAppStore';
import { equalTo, get, onValue, orderByChild, push, query, ref, remove, set, update } from 'firebase/database';

const TASKS_PATH = 'tasks';

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const tasksRef = ref(db, TASKS_PATH);
  const newTaskRef = push(tasksRef);
  const taskId = newTaskRef.key;

  if (!taskId) {
    throw new Error('Failed to create task id');
  }

  const newTask: Task = {
    ...task,
    id: taskId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(newTaskRef, newTask);
  return taskId;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const taskRef = ref(db, `${TASKS_PATH}/${taskId}`);
  await update(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = ref(db, `${TASKS_PATH}/${taskId}`);
  await remove(taskRef);
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const tasksQuery = query(ref(db, TASKS_PATH), orderByChild('userId'), equalTo(userId));
  const snapshot = await get(tasksQuery);

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

export const toggleTaskComplete = async (taskId: string, completed: boolean): Promise<void> => {
  await updateTask(taskId, { completed });
};

export const moveTaskToTomorrow = async (taskId: string): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  await updateTask(taskId, { plannedDate: tomorrowStr });
};

export const subscribeTasksByUser = (userId: string, callback: (tasks: Task[]) => void): (() => void) => {
  const tasksQuery = query(ref(db, TASKS_PATH), orderByChild('userId'), equalTo(userId));

  return onValue(tasksQuery, (snapshot) => {
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
