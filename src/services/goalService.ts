import { db } from '@/lib/firebase';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  category: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export const createGoal = async (userId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>): Promise<string> => {
  const goalsRef = ref(db, `users/${userId}/goals`);
  const newRef = push(goalsRef);
  const goalId = newRef.key;

  if (!goalId) {
    throw new Error('Failed to create goal id');
  }

  const newGoal: Goal = {
    ...goal,
    userId,
    id: goalId,
    progress: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(newRef, newGoal);
  return goalId;
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<void> => {
  const goalRef = ref(db, `users/${userId}/goals/${goalId}`);
  await update(goalRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  const goalRef = ref(db, `users/${userId}/goals/${goalId}`);
  await remove(goalRef);
};

export const getGoalsByUser = async (userId: string): Promise<Goal[]> => {
  const goalsRef = ref(db, `users/${userId}/goals`);
  const snapshot = await get(goalsRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, Goal>;
  return Object.entries(data)
    .map(([id, value]) => ({ ...value, id }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

export const subscribeGoalsByUser = (userId: string, callback: (goals: Goal[]) => void): (() => void) => {
  const goalsRef = ref(db, `users/${userId}/goals`);

  return onValue(goalsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, Goal>;
    const goals = Object.entries(data)
      .map(([id, value]) => ({ ...value, id }))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    callback(goals);
  }, (error) => {
    console.error('Error subscribing to goals:', error);
    callback([]);
  });
};
