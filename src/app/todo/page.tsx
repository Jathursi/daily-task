'use client';

import { useState, useEffect } from 'react';
import { useAppStore, Task } from '@/store/useAppStore';
import { createTask, subscribeTasksByUser, toggleTaskComplete, deleteTask, moveTaskToTomorrow, updateTask } from '@/services/taskService';
import TaskPlanner from '@/components/TaskPlanner';
import TaskAlertPanel from '@/components/TaskAlertPanel';
import SmartCarryForward from '@/components/SmartCarryForward';
import OverdueTaskAlert from '@/components/OverdueTaskAlert';
import TaskList from '@/components/TaskList';
import { Filter, Plus } from 'lucide-react';

type FilterCategory = 'All' | 'Study' | 'Work' | 'Coding' | 'Personal' | 'Health';

export default function TodoPage() {
  const { userId, tasks, setTasks, addTask, updateTask: updateTaskInStore, removeTask } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('All');
  const [showPlanner, setShowPlanner] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [carryForwardTask, setCarryForwardTask] = useState<Task | null>(null);
  const [showCarryForward, setShowCarryForward] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const unsubscribe = subscribeTasksByUser(userId, (userTasks) => {
      setTasks(userTasks);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId, setTasks]);

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    if (editingTask) {
      await updateTask(userId, editingTask.id!, taskData);
      updateTaskInStore({ ...taskData, id: editingTask.id, userId });
      setEditingTask(null);
    } else {
      const taskId = await createTask(userId, { ...taskData, userId });
      const newTask: Task = { ...taskData, id: taskId, userId };
      addTask(newTask);
    }
    setShowPlanner(false);
  };

  const handleToggleComplete = async (task: Task) => {
    if (!userId) return;
    const newCompleted = !task.completed;
    await toggleTaskComplete(userId, task.id!, newCompleted);
    updateTaskInStore({ ...task, completed: newCompleted });
    
    if (!newCompleted && task.plannedDate < today) {
      setCarryForwardTask(task);
      setShowCarryForward(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!userId) return;
    await deleteTask(userId, taskId);
    removeTask(taskId);
  };

  const handleMoveToTomorrow = async (taskId: string) => {
    if (!userId) return;
    await moveTaskToTomorrow(userId, taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateTaskInStore({ ...task, plannedDate: tomorrow.toISOString().split('T')[0] });
    }
    setShowCarryForward(false);
    setCarryForwardTask(null);
  };

  const todaysTasks = tasks.filter(t => t.plannedDate === today);
  const upcomingTasks = tasks.filter(t => t.plannedDate > today && !t.completed);
  const overdueTasks = tasks.filter(t => t.plannedDate < today && !t.completed);

  const filterTasks = (taskList: Task[]) => {
    if (filterCategory === 'All') return taskList;
    return taskList.filter(t => t.category === filterCategory);
  };

  const categories: FilterCategory[] = ['All', 'Study', 'Work', 'Coding', 'Personal', 'Health'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Tasks & Planning</h1>
          <p className="text-sm sm:text-base text-accent-light/60">Plan and track your daily tasks</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowPlanner(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Task
        </button>
      </div>

      <TaskAlertPanel
        overdueCount={overdueTasks.length}
        todayCount={todaysTasks.length}
        completedToday={todaysTasks.filter(t => t.completed).length}
      />

      <OverdueTaskAlert tasks={overdueTasks} />

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-accent-light/60 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-accent-orange text-white'
                : 'bg-secondary/50 text-accent-light hover:bg-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <TaskList
          title="Today's Tasks"
          tasks={filterTasks(todaysTasks)}
          emptyText="No tasks for today"
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setEditingTask(task);
            setShowPlanner(true);
          }}
          onDelete={handleDeleteTask}
        />

        <TaskList
          title="Upcoming"
          tasks={filterTasks(upcomingTasks)}
          emptyText="No upcoming tasks"
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setEditingTask(task);
            setShowPlanner(true);
          }}
          onDelete={handleDeleteTask}
        />

        <TaskList
          title="Overdue Tasks"
          tasks={filterTasks(overdueTasks)}
          emptyText="No overdue tasks"
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setEditingTask(task);
            setShowPlanner(true);
          }}
          onDelete={handleDeleteTask}
          isOverdue
        />
      </div>

      {showPlanner && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          onClick={() => {
            setEditingTask(null);
            setShowPlanner(false);
          }}
        >
          <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
            <div className="flex min-h-full items-start justify-center sm:items-center">
            <div
              className="w-full max-w-2xl my-3 sm:my-6"
              onClick={(e) => e.stopPropagation()}
            >
              <TaskPlanner
                userId={userId}
                onSave={handleSaveTask}
                editingTask={editingTask}
                onCancelEdit={() => {
                  setEditingTask(null);
                  setShowPlanner(false);
                }}
              />
            </div>
            </div>
          </div>
        </div>
      )}

      {showCarryForward && carryForwardTask && (
        <SmartCarryForward
          task={carryForwardTask}
          onMoveToTomorrow={handleMoveToTomorrow}
          onDelete={handleDeleteTask}
          onKeepOverdue={() => {
            setShowCarryForward(false);
            setCarryForwardTask(null);
          }}
        />
      )}
    </div>
  );
}
