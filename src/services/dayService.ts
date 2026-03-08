import { get, onValue, ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { DayData } from '@/store/useAppStore';

const DAYS_PATH = 'days';

export const saveDayData = async (dayData: DayData): Promise<string> => {
  const dayRef = ref(db, `${DAYS_PATH}/${dayData.date}`);
  const existingSnap = await get(dayRef);
  const existing = existingSnap.exists() ? (existingSnap.val() as DayData) : null;

  const dataToSave = {
    ...dayData,
    id: dayData.date,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(dayRef, dataToSave);
  return dayData.date;
};

export const getDayData = async (userId: string, date: string): Promise<DayData | null> => {
  const dayRef = ref(db, `${DAYS_PATH}/${date}`);
  const snapshot = await get(dayRef);

  if (snapshot.exists()) {
    const data = snapshot.val() as DayData;
    if (data.userId === userId) {
      return { ...data, id: date };
    }
  }

  return null;
};

export const getAllDaysData = async (userId: string): Promise<DayData[]> => {
  const daysRef = ref(db, DAYS_PATH);
  const snapshot = await get(daysRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, DayData>;
  return Object.entries(data)
    .map(([date, value]) => ({ ...value, id: date }))
    .filter((day) => day.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getDaysDataInRange = async (userId: string, startDate: string, endDate: string): Promise<DayData[]> => {
  const allDays = await getAllDaysData(userId);
  return allDays
    .filter((day) => day.date >= startDate && day.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const subscribeDaysData = (userId: string, callback: (days: DayData[]) => void): (() => void) => {
  const daysRef = ref(db, DAYS_PATH);

  return onValue(daysRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, DayData>;
    const days = Object.entries(data)
      .map(([date, value]) => ({ ...value, id: date }))
      .filter((day) => day.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));

    callback(days.sort((a, b) => b.date.localeCompare(a.date)));
  });
};

export const subscribeDayData = (userId: string, date: string, callback: (day: DayData | null) => void): (() => void) => {
  const dayRef = ref(db, `${DAYS_PATH}/${date}`);

  return onValue(dayRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as DayData;
      callback(data.userId === userId ? { ...data, id: date } : null);
    } else {
      callback(null);
    }
  });
};
