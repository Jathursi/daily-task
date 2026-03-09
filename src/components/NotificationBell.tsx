'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AlertCircle, Clock, X, ChevronRight } from 'lucide-react';
import { useAppStore, Task } from '@/store/useAppStore';

interface Notification {
  id: string;
  task: Task;
  type: 'overdue' | 'due_now';
  message: string;
}

interface NotificationBellProps {
  isMobile?: boolean;
}

export default function NotificationBell({ isMobile = false }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const tasks = useAppStore((state) => state.tasks);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  useEffect(() => {
    const newNotifications: Notification[] = [];
    
    tasks.forEach((task) => {
      if (task.completed) return;
      
      const taskDate = task.plannedDate;
      const taskTime = task.plannedTime;
      
      if (taskDate < today) {
        newNotifications.push({
          id: `${task.id}-overdue`,
          task,
          type: 'overdue',
          message: `Task "${task.title}" is overdue`,
        });
      } else if (taskDate === today && taskTime) {
        const [hours, minutes] = taskTime.split(':').map(Number);
        const taskDateTime = new Date();
        taskDateTime.setHours(hours, minutes, 0, 0);
        
        if (now.getTime() > taskDateTime.getTime() + 15 * 60 * 1000) {
          newNotifications.push({
            id: `${task.id}-due`,
            task,
            type: 'due_now',
            message: `Task "${task.title}" was due at ${taskTime}`,
          });
        }
      }
    });
    
    setNotifications(newNotifications);
  }, [tasks, today]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    router.push(`/todo?taskId=${notification.task.id}`);
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isMobile 
            ? 'hover:bg-white/10' 
            : 'hover:bg-secondary/50'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} text-accent-light`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute z-50 ${
          isMobile 
            ? 'top-full left-0 right-0 mt-2 mx-4' 
            : 'top-full right-0 mt-2 w-80'
        }`}>
          <div className="bg-primary-dark border border-accent-light/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-accent-light/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4 text-accent-light" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-accent-light/60">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-accent-light/10">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full p-4 text-left hover:bg-secondary/30 transition-colors flex items-start gap-3"
                    >
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        notification.type === 'overdue' 
                          ? 'bg-red-500/20' 
                          : 'bg-yellow-500/20'
                      }`}>
                        {notification.type === 'overdue' ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {notification.task.title}
                        </p>
                        <p className="text-xs text-accent-light/60 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-accent-light/40 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
