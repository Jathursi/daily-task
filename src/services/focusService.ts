import { db } from '@/lib/firebase';
import { FocusSession } from '@/store/useAppStore';
import { get, onValue, ref, set } from 'firebase/database';

const FOCUS_PATH = 'focusSessions';

export const saveFocusSession = async (session: Omit<FocusSession, 'id'>): Promise<string> => {
  const sessionRef = ref(db, `${FOCUS_PATH}/${session.userId}/${session.date}`);
  const existingSnap = await get(sessionRef);

  if (existingSnap.exists()) {
    const existing = existingSnap.val() as FocusSession;
    const updated: FocusSession = {
      ...existing,
      sessionsCompleted: existing.sessionsCompleted + session.sessionsCompleted,
      totalMinutes: existing.totalMinutes + session.totalMinutes,
      updatedAt: new Date().toISOString(),
    };
    await set(sessionRef, updated);
    return `${session.userId}_${session.date}`;
  }

  const newSession: FocusSession = {
    ...session,
    id: `${session.userId}_${session.date}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await set(sessionRef, newSession);
  return newSession.id!;
};

export const getTodayFocusSessions = async (userId: string, date: string): Promise<FocusSession | null> => {
  const sessionRef = ref(db, `${FOCUS_PATH}/${userId}/${date}`);
  const snap = await get(sessionRef);
  if (!snap.exists()) return null;

  return snap.val() as FocusSession;
};

export const getAllFocusSessions = async (userId: string): Promise<FocusSession[]> => {
  const userSessionsRef = ref(db, `${FOCUS_PATH}/${userId}`);
  const snap = await get(userSessionsRef);

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, FocusSession>;
  return Object.values(data).sort((a, b) => b.date.localeCompare(a.date));
};

export const subscribeTodayFocusSessions = (
  userId: string,
  date: string,
  callback: (session: FocusSession | null) => void
): (() => void) => {
  const sessionRef = ref(db, `${FOCUS_PATH}/${userId}/${date}`);

  return onValue(sessionRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.val() as FocusSession);
  });
};
