import { get, onValue, ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { DayData } from '@/store/useAppStore';

export const saveDayData = async (userId: string, dayData: DayData): Promise<string> => {
  const dayRef = ref(db, `users/${userId}/days/${dayData.date}`);
  const existingSnap = await get(dayRef);
  const existing = existingSnap.exists() ? (existingSnap.val() as DayData) : null;

  const dataToSave = {
    ...dayData,
    userId,
    id: dayData.date,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(dayRef, dataToSave);
  return dayData.date;
};

export const getDayData = async (userId: string, date: string): Promise<DayData | null> => {
  const dayRef = ref(db, `users/${userId}/days/${date}`);
  const snapshot = await get(dayRef);

  if (snapshot.exists()) {
    return { ...(snapshot.val() as DayData), id: date };
  }

  return null;
};

export const getAllDaysData = async (userId: string): Promise<DayData[]> => {
  const daysRef = ref(db, `users/${userId}/days`);
  const snapshot = await get(daysRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, DayData>;
  return Object.entries(data)
    .map(([date, value]) => ({ ...value, id: date }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getDaysDataInRange = async (userId: string, startDate: string, endDate: string): Promise<DayData[]> => {
  const allDays = await getAllDaysData(userId);
  return allDays
    .filter((day) => day.date >= startDate && day.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const subscribeDaysData = (userId: string, callback: (days: DayData[]) => void): (() => void) => {
  const daysRef = ref(db, `users/${userId}/days`);

  return onValue(daysRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, DayData>;
    const days = Object.entries(data)
      .map(([date, value]) => ({ ...value, id: date }))
      .sort((a, b) => b.date.localeCompare(a.date));

    callback(days);
  });
};

export const subscribeDayData = (userId: string, date: string, callback: (day: DayData | null) => void): (() => void) => {
  const dayRef = ref(db, `users/${userId}/days/${date}`);

  return onValue(dayRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as DayData;
      callback({ ...data, id: date });
    } else {
      callback(null);
    }
  });
};
