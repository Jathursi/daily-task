'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Bell, X } from 'lucide-react';
import { Task, useAppStore } from '@/store/useAppStore';
import { subscribeTasksByUser } from '@/services/taskService';

type AlertType = 'warning' | 'success' | 'info';

interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
}

const isOverdue = (task: Task, today: string) => task.plannedDate < today && !task.completed;

export default function RealtimeAlertSystem() {
  const { userId } = useAppStore();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const previousTasksRef = useRef<Record<string, Task>>({});

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeTasksByUser(userId, (tasks) => {
      const today = new Date().toISOString().split('T')[0];
      const previous = previousTasksRef.current;
      const next: Record<string, Task> = {};
      const incomingAlerts: AlertItem[] = [];

      tasks.forEach((task) => {
        if (!task.id) return;

        next[task.id] = task;
        const previousTask = previous[task.id];

        if (!previousTask && task.plannedDate === today && !task.completed) {
          incomingAlerts.push({
            id: `new-${task.id}-${Date.now()}`,
            type: 'info',
            message: `📌 New task for today: ${task.title}`,
          });
        }

        if (previousTask && !previousTask.completed && task.completed) {
          incomingAlerts.push({
            id: `done-${task.id}-${Date.now()}`,
            type: 'success',
            message: `✅ Completed: ${task.title}`,
          });
        }

        const wasOverdue = previousTask ? isOverdue(previousTask, today) : false;
        const nowOverdue = isOverdue(task, today);
        if (!wasOverdue && nowOverdue) {
          incomingAlerts.push({
            id: `overdue-${task.id}-${Date.now()}`,
            type: 'warning',
            message: '⚠️ You missed this task yesterday.',
          });
        }
      });

      previousTasksRef.current = next;

      if (incomingAlerts.length > 0) {
        setAlerts((current) => [...incomingAlerts, ...current].slice(0, 5));
      }
    });

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (alerts.length === 0) return;

    const timer = setTimeout(() => {
      setAlerts((current) => current.slice(0, -1));
    }, 4500);

    return () => clearTimeout(timer);
  }, [alerts]);

  const dismissAlert = (id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  const getStyles = (type: AlertType) => {
    if (type === 'warning') {
      return {
        container: 'bg-red-500/15 border-red-500/40',
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      };
    }

    if (type === 'success') {
      return {
        container: 'bg-green-500/15 border-green-500/40',
        icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
      };
    }

    return {
      container: 'bg-accent-orange/15 border-accent-orange/40',
      icon: <Bell className="w-4 h-4 text-accent-orange" />,
    };
  };

  return (
    <div className="fixed top-5 right-5 z-[70] space-y-3 w-[340px] max-w-[calc(100vw-2rem)]">
      {alerts.map((alert) => {
        const styles = getStyles(alert.type);
        return (
          <div key={alert.id} className={`glass-card p-3 border ${styles.container} animate-fadeIn`}>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{styles.icon}</div>
              <p className="text-sm text-accent-light flex-1 leading-snug">{alert.message}</p>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 rounded hover:bg-black/20 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-accent-light/70" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
